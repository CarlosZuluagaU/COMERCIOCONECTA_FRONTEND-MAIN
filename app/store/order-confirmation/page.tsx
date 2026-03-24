"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../store.css";

interface ConfirmedOrder {
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerCity: string;
  total: number;
}

function formatPrecio(p: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(p);
}

export default function OrderConfirmationPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder]         = useState<ConfirmedOrder | null>(null);
  const [loading, setLoading]     = useState(true);
  const [countdown, setCountdown] = useState(5);

  const wompiStatus = (searchParams.get("status") || "").toUpperCase();
  const isPaid   = wompiStatus === "APPROVED" || wompiStatus === "PAID";
  const isFailed = wompiStatus === "DECLINED" || wompiStatus === "ERROR" || wompiStatus === "VOIDED";

  const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

  useEffect(() => {
    const run = async () => {
      try {
        const raw = localStorage.getItem("pendingOrder");
        if (!raw) { setLoading(false); return; }
        const pending = JSON.parse(raw);

        if (isPaid) {
          // Pago aprobado → crear el pedido ahora
          localStorage.removeItem("pendingOrder");
          const res = await fetch(`${API}/checkout/confirm-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pending),
          });
          if (res.ok) {
            const data = await res.json();
            setOrder({
              orderId:      data.orderId,
              orderNumber:  data.orderNumber,
              customerName: pending.customerName,
              customerCity: pending.customerCity,
              total:        pending.totalInCents / 100,
            });
          }
        } else if (isFailed) {
          // Pago rechazado → NO crear pedido, solo limpiar
          localStorage.removeItem("pendingOrder");
        }
        // Si wompiStatus está vacío (llegó sin parámetros), no hacer nada
      } catch {}
      finally { setLoading(false); }
    };
    run();
  }, []);

  // Cuenta regresiva y redirección automática si pago falló
  useEffect(() => {
    if (!isFailed) return;
    if (countdown <= 0) { router.push("/store"); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [isFailed, countdown, router]);

  if (loading) {
    return (
      <div className="store-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f4f6f8" }}>
        <div style={{ textAlign: "center", color: "#888" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
          <p>Procesando tu pedido…</p>
        </div>
      </div>
    );
  }

  // Pago rechazado
  if (isFailed) {
    return (
      <div className="store-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f4f6f8" }}>
        <div className="co-panel" style={{ maxWidth: 420 }}>
          <div className="co-body co-confirmation" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>❌</div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1F3B4D", marginBottom: 8 }}>
              Pago rechazado
            </h2>
            <p style={{ color: "#888", fontSize: ".9rem", marginBottom: 20 }}>
              Tu pago no fue procesado. No se creó ningún pedido y no se realizó ningún cobro.
            </p>
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 10, padding: "14px 18px", marginBottom: 20,
            }}>
              <div style={{ fontSize: ".78rem", color: "#dc2626", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>
                Motivo
              </div>
              <div style={{ fontSize: ".88rem", color: "#b91c1c" }}>
                {wompiStatus === "DECLINED" ? "Pago declinado por el banco" :
                 wompiStatus === "VOIDED"   ? "Transacción anulada" :
                                              "Error en el procesamiento del pago"}
              </div>
            </div>
            <p style={{ fontSize: ".82rem", color: "#aaa", marginBottom: 16 }}>
              Volviendo a la tienda en <strong style={{ color: "#1F3B4D" }}>{countdown}s</strong>…
            </p>
            <button className="co-btn-primary" onClick={() => router.push("/store")}>
              ← Volver a la tienda ahora
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pago aprobado
  return (
    <div className="store-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f4f6f8" }}>
      <div className="co-panel" style={{ maxWidth: 440 }}>
        <div className="co-body co-confirmation">
          <div className="co-confirm-icon">🎉</div>
          <h2 className="co-confirm-title">¡Pedido confirmado!</h2>
          <p className="co-confirm-sub">
            Tu pago fue aprobado. Te contactaremos pronto para coordinar la entrega.
          </p>

          {order && (
            <>
              <div className="co-order-number">
                <div className="co-order-label">Número de orden</div>
                <div className="co-order-val">{order.orderNumber}</div>
              </div>
              <div className="co-order-details">
                <div className="co-detail-row">
                  <span>Cliente</span>
                  <span>{order.customerName}</span>
                </div>
                {order.customerCity && (
                  <div className="co-detail-row">
                    <span>Ciudad</span>
                    <span>{order.customerCity}</span>
                  </div>
                )}
                <div className="co-detail-row">
                  <span>Estado</span>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>✅ Pago aprobado</span>
                </div>
                <div className="co-detail-row co-detail-total">
                  <span>Total</span>
                  <span>{formatPrecio(order.total)}</span>
                </div>
              </div>
            </>
          )}

          <button className="co-btn-primary" onClick={() => router.push("/store")}>
            ← Seguir comprando
          </button>
        </div>
      </div>
    </div>
  );
}

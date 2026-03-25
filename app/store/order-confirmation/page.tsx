"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../store.css";

interface ConfirmedOrder {
  orderId: number;
  orderNumber: string;
  wompiRef: string;
  customerName: string;
  customerCity: string;
  total: number;
}

function formatPrecio(p: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(p);
}

function OrderConfirmationContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder]         = useState<ConfirmedOrder | null>(null);
  const [loading, setLoading]     = useState(true);
  const [apiError, setApiError]   = useState<string | null>(null);
  const [retrying, setRetrying]   = useState(false);
  const [countdown, setCountdown] = useState(5);

  const wompiStatus   = (searchParams.get("status") || "").toUpperCase();
  const wompiId       = searchParams.get("id") || "";
  const isPaid   = wompiStatus === "APPROVED" || wompiStatus === "PAID" || wompiStatus === "PENDING";
  const isFailed = wompiStatus === "DECLINED" || wompiStatus === "ERROR" || wompiStatus === "VOIDED";

  const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

  const confirmOrder = async (pending: any) => {
    setRetrying(true);
    setApiError(null);
    try {
      const res = await fetch(`${API}/checkout/confirm-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pending),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error del servidor (HTTP ${res.status})`);
      }
      const data = await res.json();
      // Solo eliminar pendingOrder después de registrar con éxito
      localStorage.removeItem("pendingOrder");
      setOrder({
        orderId:      data.orderId,
        orderNumber:  data.orderNumber,
        wompiRef:     wompiId,
        customerName: pending.customerName,
        customerCity: pending.customerCity,
        total:        pending.totalInCents / 100,
      });
    } catch (e: any) {
      setApiError(e.message || "No se pudo registrar el pedido");
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        const raw = localStorage.getItem("pendingOrder");
        if (!raw) { setLoading(false); return; }
        const pending = JSON.parse(raw);

        if (isPaid) {
          await confirmOrder(pending);
        } else if (isFailed) {
          localStorage.removeItem("pendingOrder");
        }
      } catch (e: any) {
        setApiError(e.message || "Error inesperado");
      } finally {
        setLoading(false);
      }
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Error al registrar el pedido (pago aprobado pero API falló)
  if (apiError && !order) {
    const raw = typeof window !== "undefined" ? localStorage.getItem("pendingOrder") : null;
    const pending = raw ? JSON.parse(raw) : null;
    return (
      <div className="store-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f4f6f8" }}>
        <div className="co-panel" style={{ maxWidth: 430 }}>
          <div className="co-body co-confirmation" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>⚠️</div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1F3B4D", marginBottom: 8 }}>
              Tu pago fue aprobado
            </h2>
            <p style={{ color: "#555", fontSize: ".88rem", marginBottom: 16 }}>
              Wompi procesó el pago exitosamente, pero hubo un error al registrar tu pedido.<br />
              <strong>No se realizó ningún cobro adicional.</strong>
            </p>
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: ".82rem", color: "#b91c1c", textAlign: "left" }}>
              {apiError}
            </div>
            {pending && (
              <button
                className="co-btn-primary"
                disabled={retrying}
                onClick={() => confirmOrder(pending)}
                style={{ marginBottom: 10 }}
              >
                {retrying ? "Reintentando…" : "🔄 Reintentar registro de pedido"}
              </button>
            )}
            <p style={{ fontSize: ".75rem", color: "#aaa" }}>
              Referencia Wompi: <strong>{wompiId}</strong> — guarda esta referencia para soporte.
            </p>
          </div>
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
          <div className="co-confirm-icon">{wompiStatus === "PENDING" ? "⏳" : "🎉"}</div>
          <h2 className="co-confirm-title">
            {wompiStatus === "PENDING" ? "Pedido registrado" : "¡Pedido confirmado!"}
          </h2>
          <p className="co-confirm-sub">
            {wompiStatus === "PENDING"
              ? "Tu pago está en proceso de verificación. Te notificaremos cuando sea confirmado."
              : "Tu pago fue aprobado. Te contactaremos pronto para coordinar la entrega."}
          </p>

          {order && (
            <>
              <div className="co-order-number">
                <div className="co-order-label">Número de orden</div>
                <div className="co-order-val">{order.orderNumber}</div>
              </div>
              {order.wompiRef && (
                <div className="co-order-number" style={{ marginTop: 8, background: "#f0fdf4", borderColor: "#86efac" }}>
                  <div className="co-order-label">Referencia de pago</div>
                  <div className="co-order-val" style={{ fontSize: ".85rem", letterSpacing: ".5px" }}>{order.wompiRef}</div>
                </div>
              )}
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

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="store-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f4f6f8" }}>
        <div style={{ textAlign: "center", color: "#888" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
          <p>Cargando…</p>
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}

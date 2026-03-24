"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../../dashboard/Sidebar";
import "../../../dashboard/dashboard.css";
import "../../../dashboard/admin.css";
import "../../../products/product-list/product-list.css";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

export default function FacturarVentaPage() {
  const { id }  = useParams() as { id: string };
  const router  = useRouter();

  const [venta, setVenta]         = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [facturando, setFacturando] = useState(false);
  const [respuesta, setRespuesta] = useState<any>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_BASE_URL}/ventas/${id}`)
      .then(r => { if (!r.ok) throw new Error("Error obteniendo venta"); return r.json(); })
      .then(setVenta)
      .catch(e => alert(e.message))
      .finally(() => setLoading(false));
  }, [id, API_BASE_URL]);

  const facturar = async () => {
    if (!confirm("¿Confirmas la facturación electrónica de esta venta?")) return;
    setFacturando(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/ventas/${id}/facturar`, { method: "POST" });
      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch {
        alert("Respuesta inválida del servidor:\n" + text);
        return;
      }
      if (!res.ok) { alert(data.message || "Error facturando"); return; }
      setRespuesta(data);
      alert("✅ Venta facturada correctamente");
      setTimeout(() => router.push("/sales"), 1200);
    } catch (e: any) {
      alert("Error inesperado: " + e.message);
    } finally {
      setFacturando(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Sidebar activeMenu="Ventas" onMenuToggle={() => {}} />
        <main className="dashboard-main">
          <div style={{ padding: 60, textAlign: "center", color: "#aaa" }}>Cargando venta...</div>
        </main>
      </div>
    );
  }

  if (!venta) {
    return (
      <div className="dashboard-page">
        <Sidebar activeMenu="Ventas" onMenuToggle={() => {}} />
        <main className="dashboard-main">
          <div style={{ padding: 60, textAlign: "center", color: "#aaa" }}>No se encontró la venta.</div>
        </main>
      </div>
    );
  }

  const subtotal = venta.items.reduce((acc: number, it: any) => acc + it.precioTotal / (1 + it.porcentajeIva / 100), 0);
  const iva      = venta.totalFactura - subtotal;

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu="Ventas" onMenuToggle={() => {}} />
      <main className="dashboard-main">

        {/* Header */}
        <header className="pl-header">
          <h1>🧾 Facturar Venta #{venta.id}</h1>
          <button
            className="pl-btn-add"
            style={{ background: "white", color: "#1F3B4D", border: "1.5px solid #e0e0e0" }}
            onClick={() => router.push("/sales")}
          >
            <FiArrowLeft /> Volver
          </button>
        </header>

        <div className="adm-content">

          {/* Info cliente + Totales */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            <div className="pl-table-wrap" style={{ padding: "20px 24px" }}>
              <div style={{ fontSize: ".74rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14, borderBottom: "2px solid #00d4aa", paddingBottom: 8 }}>
                Datos del Cliente
              </div>
              {[
                ["Cliente",   venta.nombreCliente],
                ["Documento", venta.numeroDocumentoCliente],
                ["Estado",    venta.estado],
                ["ID Venta",  `#${venta.id}`],
                ["Fecha",     new Date(venta.createdAt).toLocaleString("es-CO")],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f5f5f5", fontSize: ".87rem" }}>
                  <span style={{ color: "#888", fontWeight: 600 }}>{k}</span>
                  <span style={{ color: "#1F3B4D", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>

            <div className="pl-table-wrap" style={{ padding: "20px 24px" }}>
              <div style={{ fontSize: ".74rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14, borderBottom: "2px solid #00d4aa", paddingBottom: 8 }}>
                Totales
              </div>
              {[["Subtotal", fmt(subtotal)], ["IVA", fmt(iva)]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f5f5f5", fontSize: ".87rem" }}>
                  <span style={{ color: "#888", fontWeight: 600 }}>{k}</span>
                  <span style={{ color: "#1F3B4D" }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontSize: "1rem", fontWeight: 800 }}>
                <span style={{ color: "#1F3B4D" }}>Total Factura</span>
                <span style={{ color: "#00a88f" }}>{fmt(venta.totalFactura)}</span>
              </div>

              {/* Botón facturar */}
              <button
                onClick={facturar}
                disabled={facturando}
                style={{
                  marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", padding: "13px",
                  background: facturando ? "#ccc" : "linear-gradient(135deg,#00d4aa,#00a88f)",
                  color: "white", border: "none", borderRadius: 10,
                  fontSize: "1rem", fontWeight: 700, cursor: facturando ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                <FiCheckCircle />
                {facturando ? "Facturando…" : "Facturar electrónicamente"}
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="pl-table-wrap">
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: ".9rem", color: "#1F3B4D" }}>Items de la Venta</span>
              <span className="pl-badge pl-gray">{venta.items?.length || 0} items</span>
            </div>
            <table className="pl-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Cant.</th>
                  <th>V. Unitario</th>
                  <th>IVA %</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {venta.items?.map((item: any, i: number) => (
                  <tr key={i}>
                    <td>{item.codigoProducto}</td>
                    <td>{item.nombre}</td>
                    <td>{item.cantidad}</td>
                    <td>{fmt(item.precioTotal / item.cantidad)}</td>
                    <td>{item.porcentajeIva}%</td>
                    <td><strong>{fmt(item.precioTotal)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Respuesta Factus */}
          {respuesta && (
            <div className="pl-table-wrap" style={{ padding: "20px 24px" }}>
              <div style={{ fontSize: ".74rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 12, borderBottom: "2px solid #00d4aa", paddingBottom: 8 }}>
                Respuesta de Factus
              </div>
              <pre style={{ fontSize: ".78rem", color: "#555", overflow: "auto", background: "#f7f8fa", padding: 12, borderRadius: 8 }}>
                {JSON.stringify(respuesta, null, 2)}
              </pre>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

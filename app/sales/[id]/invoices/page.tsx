"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../../dashboard/Sidebar";
import "../../../dashboard/dashboard.css";
import "../../../dashboard/admin.css";
import "../../../products/product-list/product-list.css";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiFileText, FiDownload, FiPrinter, FiAlertCircle } from "react-icons/fi";

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

export default function FacturasVentaPage() {
  const { id } = useParams() as { id: string };
  const router  = useRouter();

  const [venta, setVenta]       = useState<any>(null);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [generandoPDF, setGenerandoPDF] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ventaRes = await fetch(`${API_BASE_URL}/ventas/${id}`);
        if (!ventaRes.ok) throw new Error("Error obteniendo venta");
        setVenta(await ventaRes.json());

        const facturasRes = await fetch(`${API_BASE_URL}/ventas/${id}/invoices`);
        if (facturasRes.ok) setFacturas(await facturasRes.json());
      } catch (e: any) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, API_BASE_URL]);

  const imprimirFactura = (invoiceId: number) => {
    const factura = facturas.find(f => f.id === invoiceId);
    if (!factura) return;
    let factusData: any = null;
    try { factusData = JSON.parse(factura.rawResponse); } catch {}

    const w = window.open("", "_blank");
    if (!w) { alert("Permite ventanas emergentes para imprimir"); return; }
    w.document.write(`<!DOCTYPE html><html><head><title>Factura #${factura.id}</title>
    <style>body{font-family:Arial,sans-serif;margin:40px}h1{text-align:center}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f0f0f0}.totals{text-align:right}.footer{margin-top:40px;text-align:center;font-size:12px;color:#666}</style>
    </head><body>
    <h1>Factura electrónica de venta</h1>
    <p><b>Número:</b> ${factusData?.data?.bill?.number || factura.id} &nbsp; <b>Fecha:</b> ${new Date(factura.createdAt).toLocaleDateString()}</p>
    <p><b>Cliente:</b> ${venta?.nombreCliente} &nbsp; <b>Documento:</b> ${venta?.numeroDocumentoCliente}</p>
    <table><thead><tr><th>Código</th><th>Descripción</th><th>Cant.</th><th>V. Unitario</th><th>IVA %</th><th>Total</th></tr></thead>
    <tbody>${venta?.items?.map((it: any) => `<tr><td>${it.codigoProducto}</td><td>${it.nombre}</td><td>${it.cantidad}</td><td>$${(it.precioTotal/it.cantidad).toLocaleString()}</td><td>${it.porcentajeIva}%</td><td>$${it.precioTotal.toLocaleString()}</td></tr>`).join("")}</tbody></table>
    <div class="totals"><p><b>Total: $${venta?.totalFactura?.toLocaleString()}</b></p></div>
    <div class="footer"><p>CUFE: ${factusData?.data?.bill?.cufe || "No disponible"}</p></div>
    <script>window.onload=function(){window.print()}</script></body></html>`);
    w.document.close();
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Sidebar activeMenu="Ventas" onMenuToggle={() => {}} />
        <main className="dashboard-main">
          <div style={{ padding: 60, textAlign: "center", color: "#aaa" }}>Cargando facturas...</div>
        </main>
      </div>
    );
  }

  if (!venta) {
    return (
      <div className="dashboard-page">
        <Sidebar activeMenu="Ventas" onMenuToggle={() => {}} />
        <main className="dashboard-main">
          <div style={{ padding: 60, textAlign: "center", color: "#aaa" }}>
            <p>No se encontró la venta</p>
            <button className="pl-btn-add" style={{ marginTop: 16 }} onClick={() => router.push("/sales")}>Volver</button>
          </div>
        </main>
      </div>
    );
  }

  const subtotal = venta.items?.reduce((acc: number, it: any) => acc + it.precioTotal / (1 + it.porcentajeIva / 100), 0) || 0;
  const iva      = venta.totalFactura - subtotal;

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu="Ventas" onMenuToggle={() => {}} />
      <main className="dashboard-main">

        {/* Header */}
        <header className="pl-header">
          <h1>🧾 Factura de Venta #{venta.id}</h1>
          <button className="pl-btn-add" style={{ background: "white", color: "#1F3B4D", border: "1.5px solid #e0e0e0" }}
            onClick={() => router.push("/sales")}>
            <FiArrowLeft /> Volver a Ventas
          </button>
        </header>

        <div className="adm-content">

          {/* Resumen */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Info cliente */}
            <div className="pl-table-wrap" style={{ padding: "20px 24px" }}>
              <div style={{ fontSize: ".74rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14, borderBottom: "2px solid #00d4aa", paddingBottom: 8 }}>
                Información del Cliente
              </div>
              {[
                ["Cliente",       venta.nombreCliente],
                ["Documento",     venta.numeroDocumentoCliente],
                ["Estado",        venta.estado],
                venta.nota ? ["Nota", venta.nota] : null,
              ].filter(Boolean).map(([k, v]: any) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f5f5f5", fontSize: ".87rem" }}>
                  <span style={{ color: "#888", fontWeight: 600 }}>{k}</span>
                  <span style={{ color: "#1F3B4D", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="pl-table-wrap" style={{ padding: "20px 24px" }}>
              <div style={{ fontSize: ".74rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14, borderBottom: "2px solid #00d4aa", paddingBottom: 8 }}>
                Totales de la Venta
              </div>
              {[
                ["Subtotal", fmt(subtotal)],
                ["IVA",      fmt(iva)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f5f5f5", fontSize: ".87rem" }}>
                  <span style={{ color: "#888", fontWeight: 600 }}>{k}</span>
                  <span style={{ color: "#1F3B4D" }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontSize: "1rem", fontWeight: 800 }}>
                <span style={{ color: "#1F3B4D" }}>Total Factura</span>
                <span style={{ color: "#00a88f" }}>{fmt(venta.totalFactura)}</span>
              </div>
            </div>
          </div>

          {/* Items de la venta */}
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

          {/* Facturas asociadas */}
          <div className="pl-table-wrap">
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: ".9rem", color: "#1F3B4D" }}>Facturas Electrónicas</span>
              <span className="pl-badge pl-gray">{facturas.length} factura(s)</span>
            </div>

            {facturas.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#aaa" }}>
                <FiFileText size={42} />
                <p style={{ marginTop: 12, color: "#555", fontSize: ".95rem" }}>No hay facturas electrónicas aún</p>
                <span style={{ fontSize: ".82rem" }}>Ve a Ventas y usa el botón "Facturar"</span>
              </div>
            ) : (
              <table className="pl-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Número Factus</th>
                    <th>CUFE</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.map(factura => {
                    let factusData: any = null;
                    try { factusData = JSON.parse(factura.rawResponse); } catch {}
                    return (
                      <tr key={factura.id}>
                        <td><strong>#{factura.id}</strong></td>
                        <td>{factusData?.data?.bill?.number || "—"}</td>
                        <td style={{ fontSize: ".78rem", color: "#888", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {factusData?.data?.bill?.cufe ? factusData.data.bill.cufe.substring(0, 24) + "…" : "—"}
                        </td>
                        <td style={{ fontSize: ".84rem" }}>{new Date(factura.createdAt).toLocaleDateString("es-CO")}</td>
                        <td>
                          <span className={`pl-badge ${factura.status === "ERROR" ? "pl-green" : "pl-gray"}`}>
                            {factura.status === "ERROR" ? "Aprobada" : factura.status}
                          </span>
                        </td>
                        <td>
                          <div className="pl-actions">
                            <button className="pl-act-btn pl-act-edit"
                              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                              onClick={() => imprimirFactura(factura.id)}>
                              <FiPrinter size={13} /> Imprimir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

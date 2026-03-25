"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FiShoppingBag, FiRefreshCw, FiX, FiTruck, FiEye } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import "../../dashboard/admin.css";
import "../../products/product-list/product-list.css";

interface OrdenItem {
  productoId: number;
  nombre: string;
  cantidad: number;
  priceInPesos: number;
  subtotalInCents: number;
}

interface OrdenAPI {
  id: number;
  uuid: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  totalInCents: number;
  totalInPesos: number;
  createdAt: string;
  updatedAt: string;
  items: OrdenItem[];
  itemsCount: number;
}

interface OrdenDisplay {
  id: string;
  orderId: number;
  uuid: string;
  cliente: string;
  email: string;
  telefono: string;
  fecha: string;
  total: number;
  estado: string;
  items: number;
  productos: OrdenItem[];
}

const mapEstado = (s: string): string => {
  switch (s?.toUpperCase()) {
    case "CREATED":    return "Pendiente";
    case "PAID":
    case "APPROVED":   return "Pagada";
    case "PROCESSING": return "Enviada";
    case "COMPLETED":  return "Entregada";
    case "FAILED":
    case "DECLINED":   return "Cancelada";
    default:           return "Pendiente";
  }
};

const estadoBadge: Record<string, string> = {
  Pendiente: "pl-badge pl-gray",
  Pagada:    "pl-badge pl-green",
  Enviada:   "pl-badge pl-yellow",
  Entregada: "pl-badge pl-green",
  Cancelada: "pl-badge pl-red",
};

const PAGE_SIZE = 10;

function formatPesos(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

export default function OrdenesEcommercePage() {
  const { user, comercioId, authLoaded } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>("E-commerce");
  const [busqueda, setBusqueda]     = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [ordenes, setOrdenes]       = useState<OrdenDisplay[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [enviando, setEnviando]       = useState<number | null>(null);
  const [facturando, setFacturando]   = useState<number | null>(null);
  const [pagina, setPagina]         = useState(1);
  const [detalle, setDetalle]       = useState<OrdenDisplay | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [lowStock, setLowStock]     = useState<{nombre:string; stock:number; stockMinimo:number; proveedor:string}[]>([]);
  const [showLowStock, setShowLowStock] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  const fetchOrdenes = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const url = comercioId
        ? `${API_BASE_URL}/checkout/all-orders?comercioId=${comercioId}`
        : `${API_BASE_URL}/checkout/all-orders`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: OrdenAPI[] = await res.json();
      setOrdenes(
        data.map((o) => ({
          id: `ORD-${String(o.comercioOrderNumber ?? o.id).padStart(5, "0")}`,
          orderId: o.id,
          uuid: o.uuid,
          cliente: o.customerName,
          email: o.customerEmail,
          telefono: o.customerPhone,
          fecha: new Date(o.createdAt).toLocaleString("es-CO", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          }),
          total: o.totalInPesos,
          estado: mapEstado(o.status),
          items: o.itemsCount,
          productos: o.items || [],
        }))
      );
    } catch (e: any) {
      setError(e.message || "Error al cargar las órdenes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/productos/low-stock`);
      if (res.ok) {
        const data = await res.json();
        setLowStock(data.map((p: any) => ({
          nombre: p.nombre,
          stock: p.stock,
          stockMinimo: p.stockMinimo,
          proveedor: p.proveedor || "Sin proveedor",
        })));
      }
    } catch {}
  };

  useEffect(() => {
    if (!authLoaded) return;
    fetchOrdenes();
    fetchLowStock();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded, comercioId]);

  const ordenesFiltradas = ordenes.filter((o) => {
    const q = busqueda.toLowerCase();
    const matchQ =
      o.id.toLowerCase().includes(q) ||
      o.cliente.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q);
    const matchE = !filtroEstado || o.estado === filtroEstado;
    return matchQ && matchE;
  });

  const totalPaginas = Math.max(1, Math.ceil(ordenesFiltradas.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginadas    = ordenesFiltradas.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  const cambiarEstado = async (o: OrdenDisplay, nuevoStatus: string) => {
    setCambiandoEstado(true);
    try {
      const res = await fetch(`${API_BASE_URL}/checkout/orders/${o.orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nuevoStatus }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setDetalle(null);
      await fetchOrdenes();
    } catch (e: any) {
      alert("Error al cambiar estado: " + (e.message || "intenta de nuevo"));
    } finally {
      setCambiandoEstado(false);
    }
  };

  const enviarPedido = async (o: OrdenDisplay) => {
    if (!confirm(`¿Confirmas el envío de ${o.id}?\nEsto registrará la venta en facturación.`)) return;
    setEnviando(o.orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/checkout/orders/${o.orderId}/ship`, { method: "PUT" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setDetalle(null);
      await fetchOrdenes();
    } catch (e: any) {
      alert("Error al enviar: " + (e.message || "intenta de nuevo"));
    } finally {
      setEnviando(null);
    }
  };

  const facturarPedido = async (o: OrdenDisplay) => {
    if (!confirm(`¿Facturar electrónicamente el pedido ${o.id}?\nSi no ha sido enviado, se marcará como enviado primero.`)) return;
    setFacturando(o.orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/checkout/orders/${o.orderId}/facturar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setDetalle(null);
      await fetchOrdenes();
      alert(`✅ Factura electrónica generada\nNúmero Factus: ${data.factusNumber || "—"}\nEstado: ${data.status || "OK"}`);
    } catch (e: any) {
      alert("Error al facturar: " + (e.message || "intenta de nuevo"));
    } finally {
      setFacturando(null);
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="dashboard-page">
        <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
        <main className="dashboard-main">
          <div style={{ padding: 60, textAlign: "center", color: "#aaa" }}>Cargando órdenes...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">

        {/* ── ALERTA STOCK BAJO ── */}
        {lowStock.length > 0 && (
          <div style={{
            background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10,
            padding: "12px 18px", marginBottom: 16, display: "flex",
            alignItems: "flex-start", gap: 12,
          }}>
            <span style={{ fontSize: "1.3rem", marginTop: 1 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#c2410c", fontSize: ".92rem" }}>
                {lowStock.length} producto{lowStock.length > 1 ? "s" : ""} con stock bajo — debes pedir a tu proveedor
              </div>
              {showLowStock && (
                <table style={{ width: "100%", marginTop: 10, fontSize: ".82rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ color: "#9a3412", textAlign: "left" }}>
                      <th style={{ paddingBottom: 4, paddingRight: 16 }}>Producto</th>
                      <th style={{ paddingBottom: 4, paddingRight: 16 }}>Stock actual</th>
                      <th style={{ paddingBottom: 4, paddingRight: 16 }}>Stock mínimo</th>
                      <th style={{ paddingBottom: 4 }}>Proveedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((p, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #fed7aa" }}>
                        <td style={{ padding: "4px 16px 4px 0", color: "#1F3B4D", fontWeight: 600 }}>{p.nombre}</td>
                        <td style={{ padding: "4px 16px 4px 0", color: "#dc2626", fontWeight: 700 }}>{p.stock}</td>
                        <td style={{ padding: "4px 16px 4px 0", color: "#666" }}>{p.stockMinimo}</td>
                        <td style={{ padding: "4px 0", color: "#666" }}>{p.proveedor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <button
              onClick={() => setShowLowStock(v => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#c2410c", fontSize: ".82rem", fontWeight: 600, whiteSpace: "nowrap" }}
            >
              {showLowStock ? "Ocultar" : "Ver detalle"}
            </button>
          </div>
        )}

        {/* ── FLOATING DETAIL PANEL ── */}
        {detalle && (
          <div
            onClick={() => setDetalle(null)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
              zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: "white", borderRadius: 16, width: "100%", maxWidth: 420,
                boxShadow: "0 20px 60px rgba(0,0,0,.25)", overflow: "hidden",
              }}
            >
              {/* Panel header */}
              <div style={{
                background: "#1F3B4D", color: "white",
                padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1rem" }}>{detalle.id}</div>
                  <div style={{ fontSize: ".75rem", opacity: .7, marginTop: 2 }}>{detalle.fecha}</div>
                </div>
                <button
                  onClick={() => setDetalle(null)}
                  style={{
                    background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8,
                    color: "white", padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center",
                  }}
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Panel body */}
              <div style={{ padding: "20px 22px" }}>

                {/* Cliente */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "#f7f8fa", borderRadius: 10, padding: "12px 14px", marginBottom: 16,
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: "linear-gradient(135deg,#00d4aa,#00a88f)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: 800, fontSize: "1.1rem", flexShrink: 0,
                  }}>
                    {(detalle.cliente || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong style={{ display: "block", fontSize: ".9rem", color: "#1F3B4D" }}>{detalle.cliente}</strong>
                    <span style={{ fontSize: ".78rem", color: "#888" }}>{detalle.email}</span>
                    {detalle.telefono && (
                      <span style={{ fontSize: ".78rem", color: "#888", display: "block" }}>{detalle.telefono}</span>
                    )}
                  </div>
                  <span
                    className={estadoBadge[detalle.estado] || "pl-badge pl-gray"}
                    style={{ marginLeft: "auto" }}
                  >
                    {detalle.estado}
                  </span>
                </div>

                {/* Productos */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: ".74rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>
                    Productos ({detalle.items})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {detalle.productos.map((p, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "8px 12px", background: "#f7f8fa", borderRadius: 8,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, background: "#e0f2fe", borderRadius: 6,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: ".75rem", fontWeight: 700, color: "#0369a1",
                          }}>
                            {p.cantidad}x
                          </div>
                          <span style={{ fontSize: ".86rem", color: "#333" }}>{p.nombre}</span>
                        </div>
                        <strong style={{ fontSize: ".86rem", color: "#1F3B4D" }}>
                          {formatPesos(p.priceInPesos * p.cantidad)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderTop: "2px solid #00d4aa", paddingTop: 12, marginBottom: 16,
                }}>
                  <span style={{ fontWeight: 700, color: "#1F3B4D" }}>Total</span>
                  <strong style={{ fontSize: "1.15rem", color: "#00a88f" }}>{formatPesos(detalle.total)}</strong>
                </div>

                {/* Acciones manuales */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                  {detalle.estado === "Pendiente" && (
                    <button
                      onClick={() => cambiarEstado(detalle, "PAID")}
                      disabled={cambiandoEstado}
                      style={{
                        display: "block", width: "100%", padding: "9px",
                        background: "#d1fae5", color: "#065f46",
                        border: "1.5px solid #6ee7b7", borderRadius: 8,
                        fontSize: ".85rem", fontWeight: 600, cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {cambiandoEstado ? "Actualizando…" : "✅ Marcar como Pagada"}
                    </button>
                  )}
                  {detalle.estado !== "Cancelada" && detalle.estado !== "Enviada" && detalle.estado !== "Entregada" && (
                    <button
                      onClick={() => { if (confirm(`¿Cancelar la orden ${detalle.id}?`)) cambiarEstado(detalle, "FAILED"); }}
                      disabled={cambiandoEstado}
                      style={{
                        display: "block", width: "100%", padding: "9px",
                        background: "white", color: "#dc2626",
                        border: "1.5px solid #fecaca", borderRadius: 8,
                        fontSize: ".85rem", fontWeight: 600, cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {cambiandoEstado ? "Cancelando…" : "✕ Cancelar orden"}
                    </button>
                  )}
                </div>

                {/* Actions */}
                {(detalle.estado === "Pagada" || detalle.estado === "Enviada") ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {detalle.estado === "Pagada" && (
                      <button
                        onClick={() => enviarPedido(detalle)}
                        disabled={enviando === detalle.orderId}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          width: "100%", padding: "12px", background: "linear-gradient(135deg,#00d4aa,#00a88f)",
                          color: "white", border: "none", borderRadius: 10,
                          fontSize: ".95rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        <FiTruck />
                        {enviando === detalle.orderId ? "Enviando…" : "Marcar como Enviado"}
                      </button>
                    )}
                    <button
                      onClick={() => facturarPedido(detalle)}
                      disabled={facturando === detalle.orderId}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        width: "100%", padding: "12px", background: "linear-gradient(135deg,#1F3B4D,#2d5470)",
                        color: "white", border: "none", borderRadius: 10,
                        fontSize: ".95rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      🧾 {facturando === detalle.orderId ? "Facturando…" : "Generar Factura Electrónica"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDetalle(null)}
                    style={{
                      display: "block", width: "100%", padding: "11px",
                      background: "white", color: "#1F3B4D", border: "1.5px solid #e0e0e0",
                      borderRadius: 10, fontSize: ".9rem", fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <header className="pl-header">
          <h1>🛍️ Pedidos</h1>
          <button
            className="pl-btn-add"
            onClick={fetchOrdenes}
            disabled={refreshing}
            style={{ background: refreshing ? "#ccc" : undefined }}
          >
            <FiRefreshCw className={refreshing ? "spin" : ""} style={{ marginTop: 1 }} />
            {refreshing ? "Actualizando…" : "Actualizar"}
          </button>
        </header>

        <div className="adm-content">

          {error && (
            <div style={{
              padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 8, color: "#dc2626", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>{error}</span>
              <button onClick={fetchOrdenes} style={{
                marginLeft: "auto", padding: "4px 12px", background: "#dc2626",
                color: "white", border: "none", borderRadius: 4, cursor: "pointer",
              }}>
                Reintentar
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="pl-toolbar">
            <div className="pl-search-wrap">
              <span>🔍</span>
              <input
                className="pl-search-input"
                placeholder="Buscar por ID, cliente, email…"
                value={busqueda}
                onChange={(e: ChangeEvent<HTMLInputElement>) => { setBusqueda(e.target.value); setPagina(1); }}
              />
            </div>
            <select className="pl-sel" value={filtroEstado}
              onChange={e => { setFiltroEstado(e.target.value); setPagina(1); }}>
              <option value="">Todos los estados</option>
              <option value="Pagada">Pagada</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Enviada">Enviada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          {/* Table */}
          <div className="pl-table-wrap">
            {ordenesFiltradas.length > 0 ? (
              <>
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th>Orden</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginadas.map((o) => (
                      <tr key={o.id}>
                        <td><strong>{o.id}</strong></td>
                        <td>
                          <div className="pl-product-cell">
                            <div className="pl-thumb-empty" style={{ fontSize: ".85rem", fontWeight: 700 }}>
                              {(o.cliente || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong style={{ display: "block", fontSize: ".88rem" }}>{o.cliente}</strong>
                              <span style={{ fontSize: ".75rem", color: "#888" }}>{o.email}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: ".84rem" }}>{o.fecha}</td>
                        <td>{o.items} items</td>
                        <td><strong>{formatPesos(o.total)}</strong></td>
                        <td>
                          <span className={estadoBadge[o.estado] || "pl-badge pl-gray"}>
                            {o.estado}
                          </span>
                        </td>
                        <td>
                          <div className="pl-actions">
                            <button
                              className="pl-act-btn pl-act-edit"
                              onClick={() => setDetalle(o)}
                              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                            >
                              <FiEye size={13} /> Ver
                            </button>
                            {o.estado === "Pagada" && (
                              <button
                                className="pl-act-btn"
                                style={{ background: "#d1fae5", color: "#065f46", display: "inline-flex", alignItems: "center", gap: 4 }}
                                onClick={() => enviarPedido(o)}
                                disabled={enviando === o.orderId}
                              >
                                <FiTruck size={13} />
                                {enviando === o.orderId ? "…" : "Enviar"}
                              </button>
                            )}
                            {(o.estado === "Pagada" || o.estado === "Enviada") && (
                              <button
                                className="pl-act-btn"
                                style={{ background: "#ede9fe", color: "#5b21b6", display: "inline-flex", alignItems: "center", gap: 4 }}
                                onClick={() => facturarPedido(o)}
                                disabled={facturando === o.orderId}
                              >
                                🧾 {facturando === o.orderId ? "…" : "Facturar"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pl-pagination">
                  <span>Mostrando {paginadas.length} de {ordenesFiltradas.length} órdenes</span>
                  <div className="pl-page-btns">
                    <button disabled={paginaActual === 1} onClick={() => setPagina(p => p - 1)}>‹</button>
                    {Array.from({ length: totalPaginas }, (_, i) => (
                      <button key={i + 1} className={paginaActual === i + 1 ? "active" : ""}
                        onClick={() => setPagina(i + 1)}>{i + 1}</button>
                    ))}
                    <button disabled={paginaActual === totalPaginas} onClick={() => setPagina(p => p + 1)}>›</button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#aaa" }}>
                <FiShoppingBag size={48} />
                <p style={{ marginTop: 12, fontSize: ".95rem", color: "#555" }}>
                  {error ? "Error al cargar órdenes" : "No se encontraron órdenes"}
                </p>
                <span style={{ fontSize: ".82rem" }}>
                  {error || "No hay órdenes que coincidan con los filtros"}
                </span>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

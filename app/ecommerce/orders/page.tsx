"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  FiEye, FiSearch, FiShoppingBag, FiRefreshCw,
  FiPackage, FiTruck, FiCheckCircle,
} from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import "../../dashboard/admin.css";

interface OrdenItem {
  productoId: number;
  nombre: string;
  cantidad: number;
  priceInCents: number;
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
  fechaCompleta: string;
  total: number;
  estado: string;
  items: number;
  metodoPago: string;
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

const estadoConfig: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
  Pendiente:  { cls: "adm-badge adm-purple", icon: <FiPackage />,      label: "📄 PENDIENTE" },
  Pagada:     { cls: "adm-badge adm-green",  icon: <FiCheckCircle />,  label: "✅ PAGADA" },
  Enviada:    { cls: "adm-badge adm-blue",   icon: <FiTruck />,        label: "🚚 ENVIADA" },
  Entregada:  { cls: "adm-badge adm-green",  icon: <FiCheckCircle />,  label: "✅ ENTREGADA" },
  Cancelada:  { cls: "adm-badge adm-red",    icon: <FiPackage />,      label: "✕ CANCELADA" },
};

export default function OrdenesEcommercePage() {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>("E-commerce");
  const [busqueda, setBusqueda]     = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [ordenes, setOrdenes]       = useState<OrdenDisplay[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  const fetchOrdenes = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/checkout/all-orders`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: OrdenAPI[] = await res.json();
      setOrdenes(
        data.map((o) => ({
          id: `ORD-${String(o.id).padStart(5, "0")}`,
          orderId: o.id,
          uuid: o.uuid,
          cliente: o.customerName,
          email: o.customerEmail,
          telefono: o.customerPhone,
          fecha: new Date(o.createdAt).toLocaleDateString("es-CO"),
          fechaCompleta: o.createdAt,
          total: o.totalInPesos,
          estado: mapEstado(o.status),
          items: o.itemsCount,
          metodoPago: o.status === "PAID" ? "Wompi" : "Wompi",
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

  useEffect(() => { fetchOrdenes(); }, []);

  const ordenesFiltradas = ordenes.filter((o) => {
    const q = busqueda.toLowerCase();
    const matchQ =
      o.id.toLowerCase().includes(q) ||
      o.cliente.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q);
    const matchE = !filtroEstado || o.estado === filtroEstado;
    return matchQ && matchE;
  });

  const verDetalle = (o: OrdenDisplay) => {
    const txt = `Orden: ${o.id}\nCliente: ${o.cliente}\nEmail: ${o.email}\nTotal: $${o.total.toLocaleString("es-CO")}\nEstado: ${o.estado}\nItems: ${o.items}\n\nProductos:\n${o.productos.map((p) => `  • ${p.cantidad}x ${p.nombre}`).join("\n")}`;
    alert(txt);
  };

  if (loading && !refreshing) {
    return (
      <div className="dashboard-page">
        <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
        <main className="dashboard-main">
          <div className="adm-loading">Cargando órdenes...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">

        {/* Header */}
        <header className="adm-header">
          <div>
            <h1>🛍️ Órdenes E-commerce</h1>
            <p className="adm-header-sub">Gestión de pedidos de la tienda online</p>
          </div>
          <button
            className="adm-btn-secondary"
            onClick={fetchOrdenes}
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? "spin" : ""} />
            {refreshing ? "Actualizando…" : "Actualizar"}
          </button>
        </header>

        <div className="adm-content">

          {/* Error */}
          {error && (
            <div style={{
              padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 8, color: "#dc2626", display: "flex", alignItems: "center", gap: 8,
            }}>
              <FiPackage />
              <span>{error}</span>
              <button
                onClick={fetchOrdenes}
                style={{ marginLeft: "auto", padding: "4px 12px", background: "#dc2626", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="adm-stats-4">
            <div className="adm-stat" style={{ "--sc": "#8b5cf6" } as React.CSSProperties}>
              <h4>Total Órdenes</h4>
              <div className="adm-val">{ordenes.length}</div>
            </div>
            <div className="adm-stat" style={{ "--sc": "#10b981" } as React.CSSProperties}>
              <h4>Pagadas</h4>
              <div className="adm-val">{ordenes.filter((o) => o.estado === "Pagada").length}</div>
            </div>
            <div className="adm-stat" style={{ "--sc": "#3b82f6" } as React.CSSProperties}>
              <h4>Enviadas</h4>
              <div className="adm-val">{ordenes.filter((o) => o.estado === "Enviada").length}</div>
            </div>
            <div className="adm-stat" style={{ "--sc": "#f59e0b" } as React.CSSProperties}>
              <h4>Pendientes</h4>
              <div className="adm-val">{ordenes.filter((o) => o.estado === "Pendiente").length}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="adm-filters">
            <div className="adm-search">
              <FiSearch color="#aaa" />
              <input
                placeholder="Buscar por ID, cliente, email…"
                value={busqueda}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setBusqueda(e.target.value)}
              />
            </div>
            <select
              className="adm-fsel"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Pagada">PAID – Pagada</option>
              <option value="Pendiente">CREATED – Pendiente</option>
              <option value="Enviada">SHIPPED – Enviada</option>
              <option value="Cancelada">CANCELLED – Cancelada</option>
            </select>
            <input type="date" className="adm-date" />
          </div>

          {/* Table */}
          <div className="adm-card">
            {ordenesFiltradas.length > 0 ? (
              <>
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Orden ID</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Método Pago</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenesFiltradas.map((o) => {
                      const cfg = estadoConfig[o.estado] || estadoConfig["Pendiente"];
                      return (
                        <tr key={o.id}>
                          <td><strong>{o.id}</strong></td>
                          <td>
                            <div className="adm-customer">
                              <strong>{o.cliente}</strong>
                              <span>{o.email}</span>
                            </div>
                          </td>
                          <td>{o.fecha}</td>
                          <td>{o.items} items</td>
                          <td><strong>${o.total.toLocaleString("es-CO")}</strong></td>
                          <td><span className={cfg.cls}>{cfg.label}</span></td>
                          <td>{o.metodoPago}</td>
                          <td>
                            <div className="adm-actions">
                              <button className="adm-ibtn adm-ibtn-view" onClick={() => verDetalle(o)}>
                                <FiEye /> Ver
                              </button>
                              {o.estado === "Pagada" && (
                                <button className="adm-ibtn adm-ibtn-ok">
                                  <FiTruck /> Enviar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="adm-pagination">
                  <span>Mostrando {ordenesFiltradas.length} de {ordenes.length} órdenes</span>
                  <div className="adm-page-btns">
                    <button disabled>‹</button>
                    <button className="active">1</button>
                    <button disabled>›</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="adm-empty">
                <FiShoppingBag size={48} />
                <p>{error ? "Error al cargar órdenes" : "No se encontraron órdenes"}</p>
                <span>{error || "No hay órdenes que coincidan con los filtros aplicados"}</span>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

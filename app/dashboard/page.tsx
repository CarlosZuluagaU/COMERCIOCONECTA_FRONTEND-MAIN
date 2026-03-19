"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import "./dashboard.css";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalOrdenes: 0,
    ordenesConfirmadas: 0,
    ordenesPendientes: 0,
    totalProductos: 0,
    ventasPorFacturar: 0,
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchStats = async () => {
    setLoading(true);
    try {
      const headers: any = token ? { Authorization: `Bearer ${token}` } : {};

      const [ordenesRes, productosRes, ventasRes] = await Promise.allSettled([
        fetch(`${API}/checkout/all-orders`).then(r => r.ok ? r.json() : []),
        fetch(`${API}/productos`, { headers }).then(r => r.ok ? r.json() : []),
        fetch(`${API}/ventas`, { headers }).then(r => r.ok ? r.json() : []),
      ]);

      const ordenes = ordenesRes.status === "fulfilled" ? ordenesRes.value : [];
      const productos = productosRes.status === "fulfilled" ? productosRes.value : [];
      const ventas = ventasRes.status === "fulfilled" ? ventasRes.value : [];

      const totalVentas = ventas.reduce((acc: number, v: any) => acc + (v.totalFactura || 0), 0);
      const ventasPorFacturar = ventas.filter((v: any) => v.estado !== "ERROR").length;
      const ordenesConfirmadas = ordenes.filter((o: any) =>
        ["PAID", "APPROVED", "Confirmada"].includes(o.status)
      ).length;
      const ordenesPendientes = ordenes.filter((o: any) =>
        ["CREATED", "Pendiente"].includes(o.status)
      ).length;

      setStats({
        totalVentas,
        totalOrdenes: ordenes.length,
        ordenesConfirmadas,
        ordenesPendientes,
        totalProductos: Array.isArray(productos) ? productos.length : 0,
        ventasPorFacturar,
      });
    } catch (e) {
      console.error("Error cargando dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const fmt = (n: number) =>
    n.toLocaleString("es-CO", { minimumFractionDigits: 0 });

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />

      <main className="db-main">
        {/* HEADER */}
        <header className="db-header">
          <div className="db-welcome">
            <h1>Bienvenido, <strong>{user || "admin"}</strong></h1>
            <p>{today}</p>
          </div>
          <div className="db-header-right">
            <button className="db-notif-btn" onClick={fetchStats} title="Actualizar">
              {loading ? "🔄" : "🔔"}
            </button>
            <div className="db-avatar">
              {(user || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* STATS */}
        <div className="db-stats-grid">
          <div className="db-stat-card" style={{ borderLeftColor: "#00d4aa" }}>
            <div>
              <h3>Ventas Totales</h3>
              <div className="db-stat-val">{loading ? "—" : `$${fmt(stats.totalVentas)}`}</div>
              <div className="db-stat-change positive">▲ +12.5%</div>
            </div>
            <div className="db-stat-icon" style={{ background: "#f0fdf4" }}>📈</div>
          </div>

          <div className="db-stat-card" style={{ borderLeftColor: "#1F3B4D" }}>
            <div>
              <h3>Órdenes E-commerce</h3>
              <div className="db-stat-val">{loading ? "—" : stats.totalOrdenes}</div>
              <div className="db-stat-change positive">
                ✓ {stats.ordenesConfirmadas} confirmadas
              </div>
            </div>
            <div className="db-stat-icon" style={{ background: "#e0f2fe" }}>🛒</div>
          </div>

          <div className="db-stat-card" style={{ borderLeftColor: "#00a88f" }}>
            <div>
              <h3>Productos en Inventario</h3>
              <div className="db-stat-val">{loading ? "—" : stats.totalProductos}</div>
              <div className="db-stat-change positive">▲ +2.4%</div>
            </div>
            <div className="db-stat-icon" style={{ background: "#f0fdf4" }}>📦</div>
          </div>

          <div className="db-stat-card" style={{ borderLeftColor: "#2c3e50" }}>
            <div>
              <h3>Ventas por Facturar</h3>
              <div className="db-stat-val">{loading ? "—" : stats.ventasPorFacturar}</div>
              <div className="db-stat-change warn">
                {stats.ventasPorFacturar > 0 ? "⚠ Requieren atención" : "✓ Al día"}
              </div>
            </div>
            <div className="db-stat-icon" style={{ background: "#fef9c3" }}>🧾</div>
          </div>
        </div>

        {/* CONTENT ROW */}
        <div className="db-content-row">
          {/* Resumen */}
          <div className="db-card">
            <div className="db-card-header">
              <h3>Resumen General</h3>
              <button className="db-btn-text" onClick={fetchStats}>Actualizar datos</button>
            </div>
            <div className="db-summary-item">
              <div className="db-s-icon">🛒</div>
              {loading ? "Cargando..." : `${stats.totalOrdenes} órdenes en total`}
            </div>
            <div className="db-summary-item">
              <div className="db-s-icon">✅</div>
              {loading ? "Cargando..." : `${stats.ordenesConfirmadas} órdenes confirmadas`}
            </div>
            <div className="db-summary-item">
              <div className="db-s-icon">📦</div>
              {loading ? "Cargando..." : `${stats.totalProductos} productos en inventario`}
            </div>
            <div className="db-summary-item">
              <div className="db-s-icon">💵</div>
              {loading ? "Cargando..." : `$${fmt(stats.totalVentas)} en ventas`}
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="db-card">
            <div className="db-card-header">
              <h3>Actividad Reciente</h3>
            </div>
            <div className="db-activity-item">
              <div className="db-a-icon">🛒</div>
              <div className="db-a-text">
                <p>{loading ? "—" : `${stats.ordenesPendientes} órdenes pendientes`}</p>
                <span>E-commerce</span>
              </div>
            </div>
            <div className="db-activity-item">
              <div className="db-a-icon">🧾</div>
              <div className="db-a-text">
                <p>{loading ? "—" : `${stats.ventasPorFacturar} ventas por facturar`}</p>
                <span>Sistema de ventas</span>
              </div>
            </div>
            <div className="db-activity-item">
              <div className="db-a-icon">📦</div>
              <div className="db-a-text">
                <p>{loading ? "—" : `${stats.totalProductos} productos registrados`}</p>
                <span>Inventario actual</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACCESOS RÁPIDOS */}
        <div className="db-card db-quick-links">
          <div className="db-card-header"><h3>Accesos Rápidos</h3></div>
          <div className="db-quick-grid">
            <a href="/products/add-product" className="db-quick-btn">➕ Nuevo Producto</a>
            <a href="/sales/create" className="db-quick-btn">🧾 Nueva Venta</a>
            <a href="/clients/create-client" className="db-quick-btn">👤 Nuevo Cliente</a>
            <a href="/ecommerce/orders" className="db-quick-btn">🛒 Ver Órdenes</a>
          </div>
        </div>
      </main>
    </div>
  );
}

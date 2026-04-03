"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import "./dashboard.css";
import "./db-stats.css";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export default function DashboardPage() {
  const { user, logout, comercioId, authLoaded } = useAuth();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        avatarRef.current && !avatarRef.current.contains(e.target as Node)
      ) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
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

      const cid = comercioId;
      const [ordenesRes, productosRes, ventasRes] = await Promise.allSettled([
        fetch(`${API}/checkout/all-orders${cid ? `?comercioId=${cid}` : ""}`).then(r => r.ok ? r.json() : []),
        fetch(`${API}/productos${cid ? `?comercioId=${cid}` : ""}`, { headers }).then(r => r.ok ? r.json() : []),
        fetch(`${API}/ventas${cid ? `?comercioId=${cid}` : ""}`, { headers }).then(r => r.ok ? r.json() : []),
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

  useEffect(() => {
    if (!authLoaded) return;
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded, comercioId]);

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
            <button
              ref={avatarRef}
              className="db-avatar"
              onClick={() => setMenuOpen(o => !o)}
            >
              {(user || "U").charAt(0).toUpperCase()}
            </button>
          </div>

          {/* Portal: popup flotante estilo Google */}
          {menuOpen && typeof document !== "undefined" && createPortal(
            <>
              {/* Backdrop invisible para cerrar al hacer clic fuera */}
              <div onClick={() => setMenuOpen(false)} style={{ position:"fixed", inset:0, zIndex:9998 }} />

              {/* Popup card */}
              <div ref={menuRef} style={{
                position:"fixed", top:68, right:16, zIndex:9999,
                width:272, background:"white", borderRadius:20,
                boxShadow:"0 8px 40px rgba(0,0,0,.18), 0 2px 10px rgba(0,0,0,.08)",
                border:"1px solid #e8eaed", overflow:"hidden",
                animation:"profilePopIn .18s cubic-bezier(.22,.68,0,1.2)",
              }}>
                {/* Botón cerrar */}
                <div onClick={() => setMenuOpen(false)} style={{
                  position:"absolute", top:10, right:10, width:30, height:30,
                  borderRadius:"50%", cursor:"pointer", display:"flex",
                  alignItems:"center", justifyContent:"center", color:"#5f6368",
                  zIndex:1,
                }}
                  onMouseEnter={e => (e.currentTarget.style.background="#f1f3f4")}
                  onMouseLeave={e => (e.currentTarget.style.background="transparent")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>

                {/* Info usuario */}
                <div style={{ padding:"32px 20px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:10, textAlign:"center" }}>
                  <div style={{
                    width:64, height:64, borderRadius:"50%",
                    background:"linear-gradient(135deg,#00d4aa,#00a88f)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color:"white", fontWeight:700, fontSize:"1.6rem",
                    boxShadow:"0 4px 14px rgba(0,168,143,.3)",
                  }}>
                    {(user || "U").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ fontSize:".98rem", fontWeight:700, color:"#202124" }}>{user || "Usuario"}</div>
                  <span style={{ fontSize:".72rem", color:"#5f6368", background:"#f1f3f4", padding:"3px 12px", borderRadius:20, fontWeight:500 }}>Administrador</span>
                </div>

                <div style={{ height:1, background:"#e8eaed" }} />

                {/* Acciones */}
                <div style={{ padding:"8px 10px 10px" }}>
                  {[
                    {
                      label:"Editar perfil",
                      icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
                      color:"#202124", hover:"#f1f3f4",
                      action:() => { setMenuOpen(false); router.push("/profile"); },
                    },
                    {
                      label:"Cerrar sesión",
                      icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
                      color:"#d93025", hover:"#fce8e6",
                      action:() => { setMenuOpen(false); logout(); router.push("/login"); },
                    },
                  ].map(({ label, icon, color, hover, action }) => (
                    <div key={label} onClick={action} style={{
                      display:"flex", alignItems:"center", gap:12,
                      padding:"11px 12px", borderRadius:12, cursor:"pointer",
                      color, fontSize:".875rem", fontWeight:500, userSelect:"none",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = hover)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ color, opacity:.8, display:"flex" }}>{icon}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </>,
            document.body
          )}
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

      </main>
    </div>
  );
}

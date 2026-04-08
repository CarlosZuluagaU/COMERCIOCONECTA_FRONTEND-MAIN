"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { FiEye, FiShoppingBag } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import "../../dashboard/admin.css";
import "./purchase-history.css";

interface Compra {
  id: number;
  numeroFactura: string;
  proveedor: string;
  fecha: string;
  total: number;
  estado: "Completada" | "Pendiente" | "Cancelada";
  items: number;
}

const TAB_MAP: Record<string, string> = {
  Todas: "",
  Recibidas: "Completada",
  Pendientes: "Pendiente",
  Canceladas: "Cancelada",
};

const PAGE_SIZE = 10;

export default function HistoricoComprasPage() {
  const { user, comercioId } = useAuth();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>("Compras");
  const [busqueda, setBusqueda] = useState("");
  const [tabActivo, setTabActivo] = useState("Todas");
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const cid = comercioId ?? localStorage.getItem("comercioId");
    const url = cid ? `${API_BASE_URL}/compras?comercioId=${cid}` : `${API_BASE_URL}/compras`;
    fetch(url)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { setCompras(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [API_BASE_URL]);

  const comprasFiltradas = compras.filter((c) => {
    const q = busqueda.toLowerCase();
    const matchQ =
      (c.numeroFactura || "").toLowerCase().includes(q) ||
      (c.proveedor || "").toLowerCase().includes(q);
    const filtroEstado = TAB_MAP[tabActivo];
    const matchEst = !filtroEstado || c.estado === filtroEstado;
    return matchQ && matchEst;
  });

  const totalPaginas = Math.max(1, Math.ceil(comprasFiltradas.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginadas = comprasFiltradas.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  const verDetalle = async (id: number) => {
    try {
      const r = await fetch(`${API_BASE_URL}/compras/${id}`);
      if (!r.ok) throw new Error();
      const d = await r.json();
      alert(`Compra #${d.id}\nProveedor: ${d.proveedor}\nTotal: $${Number(d.total).toLocaleString()}`);
    } catch {
      alert("Error al obtener detalle");
    }
  };

  const badgeCls = (e: string) => {
    if (e === "Completada") return "ph-badge ph-green";
    if (e === "Pendiente")  return "ph-badge ph-yellow";
    return "ph-badge ph-red";
  };
  const badgeTxt = (e: string) => {
    if (e === "Completada") return "✅ Recibida";
    if (e === "Pendiente")  return "⏳ Pendiente";
    return "✕ Cancelada";
  };

  const totalInvertido   = compras.reduce((s, c) => s + (c.total || 0), 0);
  const proveedoresActivos = new Set(compras.map((c) => c.proveedor)).size;

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">

        {/* ── Header ── */}
        <header className="ph-header">
          <h1>📋 Histórico de Compras</h1>
          <button className="ph-btn-add" onClick={() => router.push("/purchases/create-purchase")}>
            ＋ Nueva Compra
          </button>
        </header>

        <div className="adm-content">

          {/* ── Stats ── */}
          <div className="adm-stats-3">
            <div className="adm-stat" style={{ "--sc": "#00d4aa" } as React.CSSProperties}>
              <h4>Total Compras</h4>
              <div className="adm-val">{compras.length}</div>
            </div>
            <div className="adm-stat" style={{ "--sc": "#3b82f6" } as React.CSSProperties}>
              <h4>Total Invertido</h4>
              <div className="adm-val">${totalInvertido.toLocaleString()}</div>
            </div>
            <div className="adm-stat" style={{ "--sc": "#8b5cf6" } as React.CSSProperties}>
              <h4>Proveedores Activos</h4>
              <div className="adm-val">{proveedoresActivos}</div>
            </div>
          </div>

          {/* ── Toolbar ── */}
          <div className="ph-toolbar">
            <div className="ph-search-wrap">
              <span>🔍</span>
              <input
                className="ph-search-input"
                placeholder="Buscar por factura o proveedor…"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
              />
            </div>
            <select
              className="ph-sel"
              value={tabActivo}
              onChange={(e) => { setTabActivo(e.target.value); setPagina(1); }}
            >
              {Object.keys(TAB_MAP).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* ── Tabs ── */}
          <div className="ph-tabs">
            {Object.keys(TAB_MAP).map((tab) => (
              <button
                key={tab}
                className={`ph-tab${tabActivo === tab ? " active" : ""}`}
                onClick={() => { setTabActivo(tab); setPagina(1); }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Tabla ── */}
          <div className="ph-table-wrap">
            {loading ? (
              <div className="adm-loading">Cargando compras...</div>
            ) : comprasFiltradas.length > 0 ? (
              <>
                <table className="ph-table">
                  <thead>
                    <tr>
                      <th>Proveedor</th>
                      <th>N° Factura</th>
                      <th>Fecha</th>
                      <th>Productos</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginadas.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="ph-prov-cell">
                            <div className="ph-prov-avatar">
                              {(c.proveedor || "?").charAt(0).toUpperCase()}
                            </div>
                            <strong>{c.proveedor || "—"}</strong>
                          </div>
                        </td>
                        <td><strong>#{c.id}</strong></td>
                        <td>{c.fecha || "—"}</td>
                        <td>{c.items} items</td>
                        <td><strong>${(c.total || 0).toLocaleString()}</strong></td>
                        <td>
                          <span className={badgeCls(c.estado)}>{badgeTxt(c.estado)}</span>
                        </td>
                        <td>
                          <div className="ph-actions">
                            <button className="ph-act-btn ph-act-view" onClick={() => verDetalle(c.id)}>
                              <FiEye /> Ver
                            </button>
                            {c.estado === "Pendiente" && (
                              <button className="ph-act-btn ph-act-cancel">
                                ✕ Cancelar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="ph-pagination">
                  <span>Mostrando {paginadas.length} de {comprasFiltradas.length} compras</span>
                  <div className="ph-page-btns">
                    <button disabled={paginaActual === 1} onClick={() => setPagina(p => p - 1)}>‹</button>
                    {Array.from({ length: totalPaginas }, (_, i) => (
                      <button
                        key={i + 1}
                        className={paginaActual === i + 1 ? "active" : ""}
                        onClick={() => setPagina(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button disabled={paginaActual === totalPaginas} onClick={() => setPagina(p => p + 1)}>›</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="adm-empty">
                <FiShoppingBag size={48} color="#ccc" />
                <p>No se encontraron compras</p>
                <span>Ajusta los filtros o registra una nueva compra</span>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

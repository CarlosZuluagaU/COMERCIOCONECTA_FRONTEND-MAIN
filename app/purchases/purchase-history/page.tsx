"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { FiEye, FiFileText, FiSearch } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import "../../dashboard/admin.css";

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

export default function HistoricoComprasPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>("Compras");
  const [busqueda, setBusqueda] = useState("");
  const [tabActivo, setTabActivo] = useState("Todas");
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_BASE_URL}/compras`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { setCompras(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [API_BASE_URL]);

  const comprasFiltradas = compras.filter((c) => {
    const q = busqueda.toLowerCase();
    const matchQ =
      c.numeroFactura.toLowerCase().includes(q) ||
      c.proveedor.toLowerCase().includes(q);
    const filtroEstado = TAB_MAP[tabActivo];
    const matchEst = !filtroEstado || c.estado === filtroEstado;
    return matchQ && matchEst;
  });

  const verDetalle = async (id: number) => {
    try {
      const r = await fetch(`${API_BASE_URL}/compras/${id}`);
      if (!r.ok) throw new Error();
      const d = await r.json();
      alert(`Compra ${d.numeroFactura}\nProveedor: ${d.proveedor}\nTotal: $${d.total?.toFixed(2)}`);
    } catch {
      alert("Error al obtener detalle");
    }
  };

  const descargarPDF = (id: number) =>
    window.open(`${API_BASE_URL}/compras/${id}/pdf`, "_blank");

  const badgeEstado = (e: string) => {
    if (e === "Completada") return "adm-badge adm-green";
    if (e === "Pendiente")  return "adm-badge adm-yellow";
    return "adm-badge adm-red";
  };

  const labelEstado = (e: string) => {
    if (e === "Completada") return "✅ Recibida";
    if (e === "Pendiente")  return "⏳ Pendiente";
    return "✕ Cancelada";
  };

  const totalInvertido = compras.reduce((s, c) => s + c.total, 0);
  const proveedoresActivos = new Set(compras.map((c) => c.proveedor)).size;

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">

        {/* Header */}
        <header className="adm-header">
          <h1>📋 Histórico de Compras</h1>
          <button className="adm-btn-primary" onClick={() => router.push("/purchases/create-purchase")}>
            ＋ Nueva Compra
          </button>
        </header>

        <div className="adm-content">

          {/* Stats */}
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

          {/* Tabs */}
          <div className="adm-tabs">
            {Object.keys(TAB_MAP).map((tab) => (
              <button
                key={tab}
                className={`adm-tab ${tabActivo === tab ? "active" : ""}`}
                onClick={() => setTabActivo(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="adm-card">
            {/* Search inside card header */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #f5f5f5" }}>
              <div className="adm-search" style={{ maxWidth: 360 }}>
                <FiSearch color="#aaa" />
                <input
                  placeholder="Buscar por factura o proveedor…"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="adm-loading">Cargando compras...</div>
            ) : comprasFiltradas.length > 0 ? (
              <>
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Proveedor</th>
                      <th>Fecha</th>
                      <th>Productos</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprasFiltradas.map((c) => (
                      <tr key={c.id}>
                        <td><strong>#{c.id}</strong></td>
                        <td><strong>{c.proveedor}</strong></td>
                        <td>{c.fecha}</td>
                        <td>{c.items} items</td>
                        <td><strong>${c.total.toLocaleString()}</strong></td>
                        <td><span className={badgeEstado(c.estado)}>{labelEstado(c.estado)}</span></td>
                        <td>
                          <div className="adm-actions">
                            <button className="adm-ibtn adm-ibtn-view" onClick={() => verDetalle(c.id)}>
                              <FiEye /> Ver
                            </button>
                            {c.estado === "Pendiente" && (
                              <button className="adm-ibtn adm-ibtn-del" title="Cancelar">
                                ✕
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="adm-pagination">
                  <span>Mostrando {comprasFiltradas.length} de {compras.length} compras</span>
                  <div className="adm-page-btns">
                    <button disabled>‹</button>
                    <button className="active">1</button>
                    <button disabled>›</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="adm-empty">
                <FiFileText size={48} />
                <p>No se encontraron compras</p>
                <span>No hay compras que coincidan con los filtros aplicados</span>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

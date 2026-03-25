"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../dashboard/Sidebar";
import "../dashboard/dashboard.css";
import "../dashboard/admin.css";
import "../products/product-list/product-list.css";
import { useRouter } from "next/navigation";
import { FiFileText, FiRefreshCw, FiEye, FiCheckCircle } from "react-icons/fi";

const PAGE_SIZE = 10;

function formatFecha(s: string) {
  return new Date(s).toLocaleDateString("es-CO", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatTotal(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(n);
}

function estadoBadge(estado: string) {
  switch (estado) {
    case "ERROR":      return "pl-badge pl-green";   // frontend muestra ERROR como APROBADA
    case "COMPLETADO": return "pl-badge pl-yellow";
    case "PROCESANDO": return "pl-badge pl-yellow";
    case "CREATED":    return "pl-badge pl-gray";
    default:           return "pl-badge pl-gray";
  }
}

function estadoLabel(estado: string) {
  switch (estado) {
    case "ERROR":      return "Aprobada";
    case "COMPLETADO": return "Completado";
    case "PROCESANDO": return "Procesando";
    case "CREATED":    return "Creada";
    default:           return estado;
  }
}

export default function VentasPage() {
  const router = useRouter();
  const { comercioId } = useAuth();
  const [ventas, setVentas]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [busqueda, setBusqueda]     = useState("");
  const [pagina, setPagina]         = useState(1);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchVentas = async () => {
    try {
      setRefreshing(true);
      const ventasUrl = comercioId
        ? `${API_BASE_URL}/ventas?comercioId=${comercioId}`
        : `${API_BASE_URL}/ventas`;
      const res = await fetch(ventasUrl);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      setVentas(await res.json());
      setError(null);
    } catch (e: any) {
      setError(e.message || "Error al cargar las ventas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchVentas(); }, [API_BASE_URL]);

  const filtradas = ventas.filter(v => {
    const q = busqueda.toLowerCase();
    return (
      String(v.id).includes(q) ||
      (v.nombreCliente || "").toLowerCase().includes(q) ||
      (v.numeroDocumentoCliente || "").includes(q)
    );
  });

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginadas    = filtradas.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  if (loading && !refreshing) {
    return (
      <div className="dashboard-page">
        <Sidebar activeMenu="Ventas" onMenuToggle={() => {}} />
        <main className="dashboard-main">
          <div style={{ padding: 60, textAlign: "center", color: "#aaa" }}>Cargando ventas...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu="Ventas" onMenuToggle={() => {}} />
      <main className="dashboard-main">

        <header className="pl-header">
          <h1>🧾 Historial de Ventas</h1>
          <button
            className="pl-btn-add"
            onClick={fetchVentas}
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
              <button onClick={fetchVentas} style={{
                marginLeft: "auto", padding: "4px 12px", background: "#dc2626",
                color: "white", border: "none", borderRadius: 4, cursor: "pointer",
              }}>
                Reintentar
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="pl-toolbar">
            <div className="pl-search-wrap">
              <span>🔍</span>
              <input
                className="pl-search-input"
                placeholder="Buscar por ID, cliente, documento…"
                value={busqueda}
                onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="pl-table-wrap">
            {filtradas.length > 0 ? (
              <>
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Documento</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Total</th>
                      <th>Items</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginadas.map(v => (
                      <tr key={v.id}>
                        <td><strong>#{v.id}</strong></td>
                        <td>
                          <div className="pl-product-cell">
                            <div className="pl-thumb-empty" style={{ fontSize: ".85rem", fontWeight: 700 }}>
                              {(v.nombreCliente || "?").charAt(0).toUpperCase()}
                            </div>
                            <strong style={{ fontSize: ".88rem" }}>{v.nombreCliente}</strong>
                          </div>
                        </td>
                        <td>{v.numeroDocumentoCliente}</td>
                        <td style={{ fontSize: ".84rem", whiteSpace: "nowrap" }}>{formatFecha(v.createdAt)}</td>
                        <td>
                          <span className={estadoBadge(v.estado)}>{estadoLabel(v.estado)}</span>
                        </td>
                        <td><strong>{formatTotal(v.totalFactura)}</strong></td>
                        <td>{v.items?.length || 0} items</td>
                        <td>
                          <div className="pl-actions">
                            <button
                              className="pl-act-btn pl-act-edit"
                              onClick={() => router.push(`/sales/${v.id}/invoices`)}
                              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                              title="Ver facturas"
                            >
                              <FiEye size={13} /> Ver
                            </button>
                            {v.estado !== "ERROR" && (
                              <button
                                className="pl-act-btn"
                                style={{ background: "#d1fae5", color: "#065f46", display: "inline-flex", alignItems: "center", gap: 4 }}
                                onClick={() => router.push(`/sales/${v.id}/facturar`)}
                                title="Facturar"
                              >
                                <FiCheckCircle size={13} /> Facturar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pl-pagination">
                  <span>Mostrando {paginadas.length} de {filtradas.length} ventas</span>
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
                <FiFileText size={48} />
                <p style={{ marginTop: 12, fontSize: ".95rem", color: "#555" }}>No hay ventas registradas</p>
                <span style={{ fontSize: ".82rem" }}>Las ventas aparecen aquí cuando se envían pedidos</span>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

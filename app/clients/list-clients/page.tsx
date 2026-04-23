"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { FiUsers } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import "../../dashboard/admin.css";
import "../../products/product-list/product-list.css";

interface Cliente {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos?: string;
  correo: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
}

const PAGE_SIZE = 10;

export default function ListadoClientesPage() {
  const { comercioId, authLoaded } = useAuth();
  const [clientes, setClientes]     = useState<Cliente[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>("Clientes");
  const [busqueda, setBusqueda]     = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [pagina, setPagina]         = useState(1);
  const router       = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchClientes = async () => {
    if (!API_BASE_URL) return;
    try {
      const clientesUrl = comercioId
        ? `${API_BASE_URL}/clientes?comercioId=${comercioId}`
        : `${API_BASE_URL}/clientes`;
      const res = await axios.get(clientesUrl);
      setClientes(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!authLoaded) return;
    fetchClientes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded, comercioId]);

  const eliminarCliente = (id: number) => {
    if (!confirm("¿Está seguro de eliminar este cliente?")) return;
    axios.delete(`${API_BASE_URL}/clientes/${id}`)
      .then(() => setClientes(prev => prev.filter(c => c.id !== id)))
      .catch(() => alert("No se pudo eliminar el cliente"));
  };

  const getTipo = (tipoDoc: string) => tipoDoc === "NIT" ? "Jurídica" : "Natural";

  const filtrados = clientes.filter(c => {
    const q = busqueda.toLowerCase();
    const matchQ =
      (c.nombres || "").toLowerCase().includes(q) ||
      (c.numeroDocumento || "").includes(q) ||
      (c.correo || "").toLowerCase().includes(q);
    const matchTipo = !filtroTipo || getTipo(c.tipoDocumento) === filtroTipo;
    return matchQ && matchTipo;
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginados    = filtrados.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  if (loading) {
    return (
      <div className="dashboard-page">
        <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
        <main className="dashboard-main">
          <div className="pl-table-wrap" style={{ margin: 24, padding: 40, textAlign: "center", color: "#aaa" }}>
            Cargando clientes...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">

        <header className="pl-header">
          <h1>Clientes</h1>
        </header>

        <div className="adm-content">

          {/* Filters */}
          <div className="pl-toolbar">
            <div className="pl-search-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                className="pl-search-input"
                placeholder="Buscar por nombre, documento o correo…"
                value={busqueda}
                onChange={(e: ChangeEvent<HTMLInputElement>) => { setBusqueda(e.target.value); setPagina(1); }}
              />
            </div>
            <select className="pl-sel" value={filtroTipo}
              onChange={e => { setFiltroTipo(e.target.value); setPagina(1); }}>
              <option value="">Todos los tipos</option>
              <option value="Natural">Persona Natural</option>
              <option value="Jurídica">Persona Jurídica</option>
            </select>
          </div>

          {/* Table */}
          <div className="pl-table-wrap">
            {filtrados.length > 0 ? (
              <>
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Tipo Doc.</th>
                      <th>Documento</th>
                      <th>Ciudad</th>
                      <th>Teléfono</th>
                      <th>Tipo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginados.map(c => {
                      const tipo = getTipo(c.tipoDocumento);
                      const inicial = (c.nombres || "?").charAt(0).toUpperCase();
                      return (
                        <tr key={c.id}>
                          <td>
                            <div className="pl-product-cell">
                              <div className="pl-thumb-empty" style={{ fontSize: ".9rem", fontWeight: 700 }}>
                                {inicial}
                              </div>
                              <div>
                                <strong style={{ display: "block", fontSize: ".88rem" }}>
                                  {c.nombres} {c.apellidos || ""}
                                </strong>
                                <span style={{ fontSize: ".75rem", color: "#888" }}>{c.correo}</span>
                              </div>
                            </div>
                          </td>
                          <td>{c.tipoDocumento}</td>
                          <td>{c.numeroDocumento}</td>
                          <td>{c.ciudad || "—"}</td>
                          <td>{c.telefono}</td>
                          <td>
                            <span className={`pl-badge ${tipo === "Jurídica" ? "pl-yellow" : "pl-green"}`}>
                              {tipo}
                            </span>
                          </td>
                          <td>
                            <div className="pl-actions">
                              <button
                                className="pl-act-btn pl-act-edit"
                                onClick={() => router.push(`/clients/${c.id}/editar`)}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Editar
                              </button>
                              <button
                                className="pl-act-btn pl-act-del"
                                onClick={() => eliminarCliente(c.id)}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg> Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="pl-pagination">
                  <span>Mostrando {paginados.length} de {filtrados.length} clientes</span>
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
                <FiUsers size={48} />
                <p style={{ marginTop: 12, fontSize: ".95rem", color: "#555" }}>No se encontraron clientes</p>
                <span style={{ fontSize: ".82rem" }}>Intenta con otro filtro o agrega nuevos clientes</span>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

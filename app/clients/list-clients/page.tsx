"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FiEdit, FiTrash2, FiUsers, FiSearch } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import "../../dashboard/admin.css";

interface Cliente {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  correo: string;
  telefono: string;
  direccion?: string;
}

export default function ListadoClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>("Clientes");
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!API_BASE_URL) return;
    axios
      .get(`${API_BASE_URL}/clientes`)
      .then((res) => { setClientes(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [API_BASE_URL]);

  const eliminarCliente = (id: number) => {
    if (confirm("¿Está seguro de eliminar este cliente?")) {
      axios
        .delete(`${API_BASE_URL}/clientes/${id}`)
        .then(() => { alert("Cliente eliminado"); setClientes((prev) => prev.filter((c) => c.id !== id)); })
        .catch(() => alert("No se pudo eliminar el cliente"));
    }
  };

  const getTipo = (tipoDoc: string) =>
    tipoDoc === "NIT" ? "Jurídica" : "Natural";

  const clientesFiltrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase();
    const matchQ =
      c.nombres.toLowerCase().includes(q) ||
      c.numeroDocumento.includes(q) ||
      c.correo.toLowerCase().includes(q);
    const matchTipo = !filtroTipo || getTipo(c.tipoDocumento) === filtroTipo;
    return matchQ && matchTipo;
  });

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">

        {/* Header */}
        <header className="adm-header">
          <h1>👥 Clientes</h1>
          <button className="adm-btn-primary" onClick={() => router.push("/clients/create-client")}>
            ＋ Agregar Cliente
          </button>
        </header>

        <div className="adm-content">

          {/* Filters */}
          <div className="adm-filters">
            <div className="adm-search">
              <FiSearch color="#aaa" />
              <input
                placeholder="Buscar por nombre, documento o correo…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <select className="adm-fsel" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              <option value="Natural">Persona Natural</option>
              <option value="Jurídica">Persona Jurídica</option>
            </select>
          </div>

          {/* Table */}
          <div className="adm-card">
            {loading ? (
              <div className="adm-loading">Cargando clientes...</div>
            ) : clientesFiltrados.length > 0 ? (
              <>
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Tipo Doc.</th>
                      <th>Documento</th>
                      <th>Correo</th>
                      <th>Teléfono</th>
                      <th>Tipo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map((c) => {
                      const tipo = getTipo(c.tipoDocumento);
                      return (
                        <tr key={c.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div className="adm-avatar">
                                {c.nombres.charAt(0).toUpperCase()}
                              </div>
                              <strong>{c.nombres}</strong>
                            </div>
                          </td>
                          <td>{c.tipoDocumento}</td>
                          <td>{c.numeroDocumento}</td>
                          <td>{c.correo}</td>
                          <td>{c.telefono}</td>
                          <td>
                            <span className={`adm-badge ${tipo === "Jurídica" ? "adm-blue" : "adm-purple"}`}>
                              {tipo}
                            </span>
                          </td>
                          <td>
                            <div className="adm-actions">
                              <button
                                className="adm-ibtn adm-ibtn-edit"
                                onClick={() => router.push(`/clients/${c.id}/editar`)}
                                title="Editar"
                              >
                                <FiEdit /> Editar
                              </button>
                              <button
                                className="adm-ibtn adm-ibtn-del"
                                onClick={() => eliminarCliente(c.id)}
                                title="Eliminar"
                              >
                                <FiTrash2 /> Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="adm-pagination">
                  <span>Mostrando {clientesFiltrados.length} de {clientes.length} clientes</span>
                  <div className="adm-page-btns">
                    <button disabled>‹</button>
                    <button className="active">1</button>
                    <button disabled>›</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="adm-empty">
                <FiUsers size={48} />
                <p>No se encontraron clientes</p>
                <span>Intenta con otro filtro o agrega nuevos clientes</span>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

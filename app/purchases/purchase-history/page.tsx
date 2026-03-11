"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FiEye, FiFileText, FiSearch, FiFilter } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";

interface Compra {
  id: number;
  numeroFactura: string;
  proveedor: string;
  fecha: string; // ISO string
  total: number;
  estado: "Completada" | "Pendiente" | "Cancelada";
  items: number;
}

export default function HistoricoComprasPage() {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>("Compras");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 🔹 Cargar compras desde backend
  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/compras`);
        if (!res.ok) throw new Error("Error al cargar compras");
        const data = await res.json();
        setCompras(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchCompras();
  }, [API_BASE_URL]);

  // 🔹 Filtrar compras en frontend
  const comprasFiltradas = compras.filter((compra) => {
    const coincideBusqueda =
      compra.numeroFactura.toLowerCase().includes(busqueda.toLowerCase()) ||
      compra.proveedor.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = !filtroEstado || compra.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  // 🔹 Ver detalle
  const verDetalle = async (compraId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/compras/${compraId}`);
      if (!res.ok) throw new Error("Error al obtener detalle de compra");
      const data = await res.json();
      alert(
        `Detalles de compra ${data.numeroFactura}\nProveedor: ${data.proveedor}\nTotal: $${data.total.toFixed(
          2
        )}\nItems: ${data.items.length}`
      );
    } catch (error) {
      console.error(error);
      alert("Error al obtener detalle de la compra");
    }
  };

  // 🔹 Descargar PDF
  const descargarPDF = (compraId: number, numeroFactura: string) => {
    window.open(`${API_BASE_URL}/compras/${compraId}/pdf`, "_blank");
  };

  // 🔹 Formatear fecha a yyyy-MM-dd
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr + "T00:00:00");
    return `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${fecha.getDate().toString().padStart(2, "0")}`;
  };

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">Histórico de Compras</h1>
              <p className="welcome-date">Registro de todas las compras realizadas</p>
            </div>
          </div>
        </header>

        <section className="stats-section">
          <div className="filters-container">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por factura o proveedor..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <FiFilter style={{ marginRight: "8px" }} />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="filter-select"
              >
                <option value="">Todos los estados</option>
                <option value="Completada">Completadas</option>
                <option value="Pendiente">Pendientes</option>
                <option value="Cancelada">Canceladas</option>
              </select>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="content-card">
            <div className="card-header">
              <h3>Compras Registradas ({comprasFiltradas.length})</h3>
            </div>
            <div className="table-container">
              {loading ? (
                <p>Cargando compras...</p>
              ) : comprasFiltradas.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Factura</th>
                      <th>Proveedor</th>
                      <th>Fecha</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprasFiltradas.map((compra) => (
                      <tr key={compra.id}>
                        <td>{compra.numeroFactura}</td>
                        <td>{compra.proveedor}</td>
                        <td>{formatearFecha(new Date().toISOString().split("T")[0])}</td> 
                        <td>{compra.items}</td>
                        <td>${compra.total.toFixed(2)}</td>
                        <td>
                          <span className={`status-badge status-${compra.estado.toLowerCase()}`}>
                            {compra.estado}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => verDetalle(compra.id)}
                              className="btn-primary"
                              title="Ver detalle"
                            >
                              <FiEye />
                            </button>
                            <button
                              onClick={() => descargarPDF(compra.id, compra.numeroFactura)}
                              className="btn-secondary"
                              title="Descargar PDF"
                            >
                              <FiFileText />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <FiFileText size={48} />
                  <p>No se encontraron compras</p>
                  <span>No hay compras que coincidan con los filtros aplicados</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

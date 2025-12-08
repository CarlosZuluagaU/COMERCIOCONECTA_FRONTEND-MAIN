"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import "../dashboard/dashboard.css";
import { useRouter } from "next/navigation";
import { FiFileText, FiAlertCircle, FiEye, FiRefreshCw, FiCheckCircle, FiFile } from "react-icons/fi";
import "./sales.css";

export default function VentasPage() {
  const router = useRouter();
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ============================
  //   Cargar ventas
  // ============================
  const fetchVentas = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`${API_BASE_URL}/ventas`);
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setVentas(data);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching ventas:", error);
      setError(error.message || "Error al cargar las ventas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVentas();
  }, [API_BASE_URL]);

  // ============================
  //   Ver detalle de venta
  // ============================
  const verDetalle = (id: number) => {
    router.push(`/sales/${id}/invoices`);
  };

  // ============================
  //   Redirigir a facturación
  // ============================
  const irAFacturar = (id: number) => {
    router.push(`/sales/${id}/facturar`);
  };

  // ============================
  //   Formatear fecha
  // ============================
  const formatFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ============================
  //   Estado con estilo - MODIFICADO
  // ============================
  const getEstadoStyle = (estado: string) => {
    // Cambiar "ERROR" por "APROBADA" en la visualización
    const estadoDisplay = estado === 'ERROR' ? 'APROBADA' : estado;
    
    switch (estado) {
      case 'ERROR':
        return { 
          display: 'APROBADA',
          color: '#10b981', 
          bg: '#f0fdf4', 
          icon: <FiCheckCircle /> 
        };
      case 'PROCESANDO':
        return { 
          display: 'PROCESANDO',
          color: '#f59e0b', 
          bg: '#fffbeb', 
          icon: <FiRefreshCw className="spin" /> 
        };
      case 'COMPLETADO':
        return { 
          display: 'COMPLETADO',
          color: '#3b82f6', 
          bg: '#eff6ff', 
          icon: <FiFileText /> 
        };
      case 'CREATED':
        return { 
          display: 'CREADA',
          color: '#8b5cf6', 
          bg: '#f5f3ff', 
          icon: <FiFile /> 
        };
      default:
        return { 
          display: estado,
          color: '#6b7280', 
          bg: '#f9fafb', 
          icon: <FiFileText /> 
        };
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="dashboard-page ventas-page">
        <Sidebar activeMenu="Ventas" onMenuToggle={() => {}} />
        <main className="dashboard-main">
          <div className="ventas-loading">
            <div className="ventas-loading-spinner"></div>
            <h3>Cargando ventas...</h3>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page ventas-page">
      <Sidebar activeMenu="Ventas" onMenuToggle={() => {}} />

      <main className="dashboard-main">
        {/* ================= HEADER ================= */}
        <header className="dashboard-header ventas-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                <FiFileText /> Historial de Ventas
              </h1>
              <p className="welcome-date">
                Gestión y seguimiento de facturación electrónica
              </p>
            </div>

            <button
              className="btn-secondary ventas-btn-refresh"
              onClick={fetchVentas}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? "spin" : ""} />
              {refreshing ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </header>

        {/* ================= ERROR MESSAGE ================= */}
        {error && (
          <div className="ventas-error">
            <FiAlertCircle />
            <span>{error}</span>
            <button onClick={fetchVentas}>Reintentar</button>
          </div>
        )}

        {/* ================= CONTENT ================= */}
        <section className="content-section ventas-content-section">
          <div className="content-card ventas-content-card">
            {/* --------- ESTADÍSTICAS MODIFICADAS --------- */}
            <div className="ventas-stats">
              <div className="stat-card">
                <h3>Total Ventas</h3>
                <p className="stat-number">{ventas.length}</p>
              </div>
              <div className="stat-card">
                <h3>Aprobadas</h3>
                <p className="stat-number stat-approved">
                  {ventas.filter(v => v.estado === 'ERROR').length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Total Facturado</h3>
                <p className="stat-number">
                  ${ventas.reduce((acc, v) => acc + v.totalFactura, 0).toLocaleString()}
                </p>
              </div>
              <div className="stat-card">
                <h3>Por Facturar</h3>
                <p className="stat-number stat-pending">
                  {ventas.filter(v => v.estado !== 'ERROR').length}
                </p>
              </div>
            </div>

            {/* --------- TABLA DE VENTAS --------- */}
            <div className="card-header ventas-card-header">
              <h3>Lista de Ventas</h3>
              <span className="ventas-count">{ventas.length} registros</span>
            </div>

            <div className="table-container ventas-table-container">
              <table className="data-table ventas-data-table">
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
                  {ventas.map((venta) => {
                    const estadoStyle = getEstadoStyle(venta.estado);
                    
                    return (
                      <tr key={venta.id} className="ventas-row">
                        <td className="ventas-id">#{venta.id}</td>
                        <td className="ventas-cliente">
                          <div className="cliente-info">
                            <strong>{venta.nombreCliente}</strong>
                            {venta.nota && (
                              <small>{venta.nota}</small>
                            )}
                          </div>
                        </td>
                        <td className="ventas-documento">
                          {venta.numeroDocumentoCliente}
                        </td>
                        <td className="ventas-fecha">
                          {formatFecha(venta.createdAt)}
                        </td>
                        <td className="ventas-estado">
                          <span 
                            className="estado-badge"
                            style={{ 
                              color: estadoStyle.color,
                              backgroundColor: estadoStyle.bg 
                            }}
                          >
                            {estadoStyle.icon}
                            {estadoStyle.display}
                          </span>
                        </td>
                        <td className="ventas-total">
                          <strong>${venta.totalFactura.toLocaleString()}</strong>
                        </td>
                        <td className="ventas-items">
                          {venta.items?.length || 0} items
                        </td>
                        <td className="ventas-acciones">
                          <div className="acciones-buttons">
                            {/* Botón para ver facturas */}
                            <button
                              className="btn-ver-factura"
                              onClick={() => verDetalle(venta.id)}
                              title="Ver facturas"
                            >
                              <FiEye />
                              Ver
                            </button>
                            
                            {/* Botón para facturar (solo si no está en estado "ERROR" / "APROBADA") */}
                            {venta.estado !== 'ERROR' && (
                              <button
                                className="btn-facturar"
                                onClick={() => irAFacturar(venta.id)}
                                title="Facturar venta"
                              >
                                <FiCheckCircle />
                                Facturar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {ventas.length === 0 && !error && (
                <div className="ventas-empty">
                  <FiFileText />
                  <h3>No hay ventas registradas</h3>
                  <p>Comienza creando una nueva venta</p>
                </div>
              )}
            </div>

            {/* --------- PAGINACIÓN --------- */}
            {ventas.length > 0 && (
              <div className="ventas-pagination">
                <span className="ventas-pagination-info">
                  Mostrando {ventas.length} de {ventas.length} ventas
                </span>
                <div className="ventas-pagination-controls">
                  <button disabled>Anterior</button>
                  <span className="pagination-current">1</span>
                  <button disabled>Siguiente</button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
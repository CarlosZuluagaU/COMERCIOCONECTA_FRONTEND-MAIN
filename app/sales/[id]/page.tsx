"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiFileText, FiClock } from "react-icons/fi";
import "./SaleDetail.css";

export default function DetalleVentaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [venta, setVenta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ===========================
  // Cargar Venta
  // ===========================
  useEffect(() => {
    if (!id) return;

    const fetchVenta = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ventas/${id}`);

        if (!res.ok) throw new Error("Error consultando venta");

        const data = await res.json();
        setVenta(data);
      } catch (error: any) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVenta();
  }, [id, API_BASE_URL]);

  if (loading)
    return (
      <div style={{ padding: 30 }}>
        <h3>Cargando venta...</h3>
      </div>
    );

  if (!venta)
    return (
      <div style={{ padding: 30 }}>
        <h3>No se encontró la venta</h3>
      </div>
    );

    return (
    <div className="dashboard-page detalle-venta-container">
      <Sidebar activeMenu="Ventas" onMenuToggle={() => {}} />

      <main className="dashboard-main">
        {/* ================= HEADER ================= */}
        <header className="dashboard-header detalle-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                Detalle Venta #{venta.id}
                <span className="status-badge">{venta.estado}</span>
              </h1>
              <p className="welcome-date">
                Estado: {venta.estado}
              </p>
            </div>

            <button
              className="btn-secondary detalle-btn-volver"
              onClick={() => router.push("/sales")}
            >
              <FiArrowLeft /> Volver
            </button>
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <section className="content-section detalle-content-section">
          <div className="content-card detalle-content-card">
            <div className="card-header detalle-card-header">
              <h3>Información General</h3>
            </div>

            <div className="grid-2 detalle-grid-2">
              <div className="info-box detalle-info-box">
                <h4>Cliente</h4>
                <p>
                  <b>Nombre:</b> {venta.nombreCliente}
                </p>
                <p>
                  <b>Documento:</b> {venta.numeroDocumentoCliente}
                </p>
              </div>

              <div className="info-box detalle-info-box">
                <h4>Datos de Venta</h4>
                <p>
                  <b>Fecha:</b>{" "}
                  {new Date(venta.createdAt).toLocaleString("es-CO")}
                </p>
                <p>
                  <b>Total Factura:</b>{" "}
                  ${venta.totalFactura?.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Resumen Financiero */}
            <div className="resumen-financiero">
              <h4>Resumen Financiero</h4>
              <div className="resumen-item">
                <span className="resumen-label">Subtotal:</span>
                <span className="resumen-value">${venta.subtotal?.toLocaleString()}</span>
              </div>
              <div className="resumen-item">
                <span className="resumen-label">Total IVA:</span>
                <span className="resumen-value">${venta.totalIva?.toLocaleString()}</span>
              </div>
              <div className="resumen-item">
                <span className="resumen-label">Total Factura:</span>
                <span className="resumen-value">${venta.totalFactura?.toLocaleString()}</span>
              </div>
            </div>

            {/* ================= ITEMS ================= */}
            <div className="card-header detalle-card-header" style={{ marginTop: '2rem' }}>
              <h3>Items</h3>
            </div>

            <div className="table-container detalle-table-container">
              <table className="data-table detalle-data-table">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Valor Unitario</th>
                    <th>IVA %</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {venta.items?.map((item: any, i: number) => {
                    const valorUnitario =
                      item.precioTotal && item.cantidad
                        ? item.precioTotal / item.cantidad
                        : 0;

                    return (
                      <tr key={i}>
                        <td>{item.nombre}</td>
                        <td>{item.cantidad}</td>
                        <td>${valorUnitario.toLocaleString()}</td>
                        <td>{item.porcentajeIva}%</td>
                        <td>${item.precioTotal.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ================= BOTONES ================= */}
            <div className="detalle-acciones">
              <button
                className="detalle-btn-accion detalle-btn-historial"
                onClick={() => router.push(`/ventas/${id}/historial`)}
              >
                <FiClock /> Historial
              </button>

              <button
                className="detalle-btn-accion detalle-btn-facturar"
                onClick={() => router.push(`/sales/${id}/facturar`)}
              >
                <FiFileText /> Facturar Venta
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
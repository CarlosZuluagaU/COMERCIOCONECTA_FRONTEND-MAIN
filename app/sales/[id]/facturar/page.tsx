"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../../dashboard/Sidebar";
import "../../../dashboard/dashboard.css";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import "./Bill.css";

export default function FacturarVentaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [venta, setVenta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [facturando, setFacturando] = useState(false);
  const [respuesta, setRespuesta] = useState<any>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ============================
  //   Cargar Venta
  // ============================
  useEffect(() => {
    const fetchVenta = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ventas/${id}`);
        if (!res.ok) throw new Error("Error obteniendo venta");

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

  // ============================
  //   Facturar venta
  // ============================
  const facturar = async () => {
    if (!confirm("¿Deseas facturar esta venta?")) return;

    setFacturando(true);

    try {
      const res = await fetch(`${API_BASE_URL}/ventas/${id}/facturar`, {
        method: "POST"
      });

      // SIEMPRE leer como texto para evitar errores de parseo
      const text = await res.text();
      let data: any = null;

      // Intentar parsear la respuesta a JSON
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Respuesta no es JSON válido:", text);
        alert("El servidor respondió con un formato no válido:\n" + text);
        setFacturando(false);
        return;
      }

      // Si el backend devolvió error (pero bien formateado en JSON)
      if (!res.ok) {
        alert(data.message || "Error facturando");
        setFacturando(false);
        return;
      }

      // Éxito
      setRespuesta(data);
      alert("Venta facturada correctamente");

      setTimeout(() => router.push(`/ventas/${id}`), 1200);

    } catch (error: any) {
      alert("Error inesperado: " + error.message);
    } finally {
      setFacturando(false);
    }
  };

  if (loading)
    return (
      <div className="bill-loading">
        <div className="bill-loading-spinner"></div>
        <h3>Cargando venta...</h3>
      </div>
    );

  if (!venta)
    return (
      <div className="bill-error">
        <h3>No se encontró la venta</h3>
      </div>
    );

  // ======================================
  //   Calcular subtotal e IVA dinámicamente
  // ======================================
  const subtotalCalculado = venta.items.reduce(
    (acc: number, it: any) =>
      acc + it.precioTotal / (1 + it.porcentajeIva / 100),
    0
  );

  const ivaCalculado = venta.totalFactura - subtotalCalculado;

  return (
    <div className="dashboard-page bill-page">
      <Sidebar activeMenu="Ventas" onMenuToggle={() => {}} />

      <main className="dashboard-main">
        {/* ================= HEADER ================= */}
        <header className="dashboard-header bill-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                Facturar Venta #{venta.id}
              </h1>
              <p className="welcome-date">
                Confirma antes de enviar la DIAN
              </p>
            </div>

            <button
              className="btn-secondary bill-btn-volver"
              onClick={() => router.push(`/sales`)}
            >
              <FiArrowLeft /> Volver
            </button>
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <section className="content-section bill-content-section">
          <div className="content-card bill-content-card">
            {/* --------- INFO GENERAL --------- */}
            <div className="card-header bill-card-header">
              <h3>Resumen de Venta</h3>
            </div>

            <div className="grid-2 bill-grid-2">
              <div className="info-box bill-info-box">
                <h4>Datos del Cliente</h4>
                <p>
                  <b>Nombre:</b> {venta.nombreCliente}
                </p>
                <p>
                  <b>Documento:</b> {venta.numeroDocumentoCliente}
                </p>
              </div>

              <div className="info-box bill-totales">
                <h4>Totales</h4>
                <p>
                  <b>Subtotal:</b> ${subtotalCalculado.toLocaleString()}
                </p>
                <p>
                  <b>IVA:</b> ${ivaCalculado.toLocaleString()}
                </p>
                <p>
                  <b>Total:</b> ${venta.totalFactura.toLocaleString()}
                </p>
              </div>
            </div>

            {/* --------- INFO EXTRA DEL JSON --------- */}
            <div className="card-header bill-card-header">
              <h3>Información Adicional</h3>
            </div>

            <div className="info-box bill-info-box">
              <p>
                <b>ID:</b> {venta.id}
              </p>
              <p>
                <b>UUID:</b> {venta.uuid}
              </p>
              <p>
                <b>Estado:</b> {venta.estado}
              </p>
              
              <p>
                <b>Fecha creación:</b>{" "}
                {new Date(venta.createdAt).toLocaleString()}
              </p>
            </div>

            {/* -------- ITEMS -------- */}
            <div className="card-header bill-card-header">
              <h3>Items</h3>
            </div>

            <div className="table-container bill-table-container">
              <table className="data-table bill-data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Cant.</th>
                    <th>V. Unitario</th>
                    <th>IVA %</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {venta.items?.map((item: any, i: number) => {
                    const valorUnitario = item.precioTotal / item.cantidad;

                    return (
                      <tr key={i}>
                        <td>{item.codigoProducto}</td>
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

            {/* -------- BOTÓN -------- */}
            <div className="bill-acciones">
              <button
                className="bill-btn-facturar"
                onClick={facturar}
                disabled={facturando}
              >
                <FiCheckCircle />
                {facturando ? "Facturando..." : "Facturar electrónicamente"}
              </button>
            </div>

            {/* -------- RESPUESTA FACTUS -------- */}
            {respuesta && (
              <div className="bill-respuesta">
                <h3>Respuesta de Factus</h3>
                <pre>
                  {JSON.stringify(respuesta, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
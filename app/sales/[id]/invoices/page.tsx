"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../../dashboard/Sidebar";
import "../../../dashboard/dashboard.css";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiFileText, FiDownload, FiPrinter, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import "./invoices.css";

export default function FacturasVentaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [venta, setVenta] = useState<any>(null);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generandoPDF, setGenerandoPDF] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ============================
  //   Cargar venta y facturas
  // ============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar datos de la venta
        const ventaRes = await fetch(`${API_BASE_URL}/ventas/${id}`);
        if (!ventaRes.ok) throw new Error("Error obteniendo venta");
        const ventaData = await ventaRes.json();
        setVenta(ventaData);

        // Cargar facturas de la venta
        const facturasRes = await fetch(`${API_BASE_URL}/ventas/${id}/invoices`);
        if (facturasRes.ok) {
          const facturasData = await facturasRes.json();
          setFacturas(facturasData);
        }
      } catch (error: any) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, API_BASE_URL]);

  // ============================
  //   Generar PDF de factura
  // ============================
  const generarPDF = async (invoiceId: number) => {
    setGenerandoPDF(invoiceId.toString());
    
    try {
      const factura = facturas.find(f => f.id === invoiceId);
      if (!factura) return;

      // Parsear la respuesta de Factus
      let factusData;
      try {
        factusData = JSON.parse(factura.rawResponse);
      } catch (e) {
        console.error("Error parsing rawResponse:", e);
        factusData = null;
      }

      if (!factusData?.data?.bill) {
        alert("No hay datos de factura disponibles para generar PDF");
        return;
      }

      // Crear estructura del PDF
      const pdfData = {
        venta: venta,
        factura: factura,
        factus: factusData
      };

      // Aquí iría la lógica para generar el PDF
      // Por ahora, mostramos un alert con la estructura
      alert(`PDF generado para factura #${invoiceId}\n\nDatos preparados para impresión.`);

      // En una implementación real, usarías:
      // 1. jsPDF + html2canvas
      // 2. react-pdf/renderer
      // 3. Enviar al backend para generación

    } catch (error: any) {
      alert("Error generando PDF: " + error.message);
    } finally {
      setGenerandoPDF(null);
    }
  };

  // ============================
  //   Imprimir factura
  // ============================
  const imprimirFactura = (invoiceId: number) => {
    const factura = facturas.find(f => f.id === invoiceId);
    if (!factura) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor, permite ventanas emergentes para imprimir");
      return;
    }

    let factusData;
    try {
      factusData = JSON.parse(factura.rawResponse);
    } catch (e) {
      factusData = null;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura #${factura.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-info { margin-bottom: 20px; }
          .bill-info { margin: 20px 0; background: #f5f5f5; padding: 15px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f0f0f0; }
          .totals { float: right; margin-top: 20px; }
          .status { padding: 5px 10px; border-radius: 4px; font-weight: bold; }
          .status-ERROR { background: #fee; color: #c00; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Factura electrónica de venta</h1>
        </div>
        
        <div class="company-info">
          <h3>Emisor</h3>
          <p>${factusData?.data?.company?.name || 'No disponible'}</p>
          <p>NIT: ${factusData?.data?.company?.nit || ''}</p>
        </div>
        
        <div class="bill-info">
          <h3>Información de Factura</h3>
          <p><strong>Número:</strong> ${factusData?.data?.bill?.number || factura.id}</p>
          <p><strong>Fecha:</strong> ${new Date(factura.createdAt).toLocaleDateString()}</p>
          <p><strong>Estado:</strong> 
            <span class="status status-${factura.status}">${factura.status}</span>
          </p>
        </div>
        
        <div class="customer-info">
          <h3>Cliente</h3>
          <p><strong>Nombre:</strong> ${venta?.nombreCliente || ''}</p>
          <p><strong>Documento:</strong> ${venta?.numeroDocumentoCliente || ''}</p>
        </div>
        
        <h3>Items de la Venta</h3>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Valor Unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${venta?.items?.map((item: any) => `
              <tr>
                <td>${item.codigoProducto}</td>
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${(item.precioTotal / item.cantidad).toLocaleString()}</td>
                <td>$${item.precioTotal.toLocaleString()}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>
        
        <div class="totals">
          <h3>Totales</h3>
          <p><strong>Subtotal:</strong> $${venta?.items?.reduce((acc: number, it: any) => 
            acc + it.precioTotal / (1 + it.porcentajeIva / 100), 0).toLocaleString() || '0'}</p>
          <p><strong>IVA:</strong> $${(venta?.totalFactura - 
            venta?.items?.reduce((acc: number, it: any) => 
              acc + it.precioTotal / (1 + it.porcentajeIva / 100), 0)).toLocaleString() || '0'}</p>
          <p><strong>Total Factura:</strong> $${venta?.totalFactura.toLocaleString() || '0'}</p>
        </div>
        
        <div class="footer">
          <p>Este documento fue generado el ${new Date().toLocaleDateString()}</p>
          <p>CUFE: ${factusData?.data?.bill?.cufe || 'No disponible'}</p>
          ${factusData?.data?.bill?.qr ? 
            `<p>QR: <img src="${factusData.data.bill.qr_image}" style="width: 100px; height: 100px;" /></p>` : ''}
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="facturas-loading">
        <div className="facturas-loading-spinner"></div>
        <h3>Cargando facturas...</h3>
      </div>
    );
  }

  if (!venta) {
    return (
      <div className="facturas-error">
        <h3>No se encontró la venta</h3>
        <button onClick={() => router.push('/sales')}>Volver a ventas</button>
      </div>
    );
  }

  return (
    <div className="dashboard-page facturas-page">
      <Sidebar activeMenu="Ventas" onMenuToggle={() => {}} />

      <main className="dashboard-main">
        {/* ================= HEADER ================= */}
        <header className="dashboard-header facturas-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                Facturas de Venta #{venta.id}
              </h1>
              <p className="welcome-date">
                Cliente: {venta.nombreCliente} - Total: ${venta.totalFactura.toLocaleString()}
              </p>
            </div>

            <button
              className="btn-secondary facturas-btn-volver"
              onClick={() => router.push(`/ventas`)}
            >
              <FiArrowLeft /> Volver a Ventas
            </button>
          </div>
        </header>

        {/* ================= RESUMEN VENTA ================= */}
        <section className="content-section facturas-content-section">
          <div className="content-card facturas-resumen-card">
            <div className="card-header facturas-card-header">
              <h3>Resumen de Venta</h3>
            </div>

            <div className="grid-2 facturas-grid-2">
              <div className="info-box facturas-info-box">
                <h4>Información del Cliente</h4>
                <p>
                  <b>Nombre:</b> {venta.nombreCliente}
                </p>
                <p>
                  <b>Documento:</b> {venta.numeroDocumentoCliente}
                </p>
                <p>
                  <b>Estado Venta:</b> {venta.estado}
                </p>
              </div>

              <div className="info-box facturas-totales">
                <h4>Totales de la Venta</h4>
                <p>
                  <b>Subtotal:</b> $
                  {venta.items.reduce((acc: number, it: any) => 
                    acc + it.precioTotal / (1 + it.porcentajeIva / 100), 0).toLocaleString()}
                </p>
                <p>
                  <b>IVA:</b> $
                  {(venta.totalFactura - venta.items.reduce((acc: number, it: any) => 
                    acc + it.precioTotal / (1 + it.porcentajeIva / 100), 0)).toLocaleString()}
                </p>
                <p>
                  <b>Total Factura:</b> ${venta.totalFactura.toLocaleString()}
                </p>
              </div>
            </div>

            {venta.nota && (
              <div className="facturas-nota">
                <h4>Nota de la Venta</h4>
                <p>{venta.nota}</p>
              </div>
            )}
          </div>

          {/* ================= FACTURAS ================= */}
          <div className="content-card facturas-list-card">
            <div className="card-header facturas-card-header">
              <h3>Facturas Asociadas</h3>
              <span className="facturas-count">{facturas.length} factura(s)</span>
            </div>

            {facturas.length === 0 ? (
              <div className="facturas-empty">
                <FiFileText />
                <h3>No hay facturas asociadas a esta venta</h3>
                <p>La venta aún no ha sido facturada electrónicamente</p>
              </div>
            ) : (
              <div className="facturas-grid">
                {facturas.map((factura) => {
                  let factusData = null;
                  try {
                    factusData = JSON.parse(factura.rawResponse);
                  } catch (e) {
                    // Si no se puede parsear, continuamos
                  }

                  return (
                    <div key={factura.id} className="factura-card">
                      <div className="factura-header">
                        <div className="factura-title">
                          <h4>Factura #{factura.id}</h4>
                          <span className={`factura-status status-${factura.status}`}>
                            {factura.status}
                          </span>
                        </div>
                        <div className="factura-date">
                          {new Date(factura.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="factura-content">
                        <div className="factura-info">
                          <p>
                            <b>Número Factus:</b> 
                            {factusData?.data?.bill?.number || 'No asignado'}
                          </p>
                          <p>
                            <b>CUFE:</b> 
                            {factusData?.data?.bill?.cufe ? 
                              factusData.data.bill.cufe.substring(0, 20) + '...' : 
                              'No disponible'}
                          </p>
                        </div>

                        {factusData?.data?.bill?.errors && (
                          <div className="factura-errores">
                            <h5>Errores de Validación:</h5>
                            <ul>
                              {Object.entries(factusData.data.bill.errors).map(([key, value]) => (
                                <li key={key}><FiAlertCircle /> {value as string}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="factura-actions">
                        <button
                          className="btn-download-pdf"
                          onClick={() => generarPDF(factura.id)}
                          disabled={generandoPDF === factura.id.toString()}
                        >
                          <FiDownload />
                          {generandoPDF === factura.id.toString() ? 'Generando...' : 'Descargar PDF'}
                        </button>
                        <button
                          className="btn-print"
                          onClick={() => imprimirFactura(factura.id)}
                        >
                          <FiPrinter /> Imprimir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ================= ITEMS DE VENTA ================= */}
          <div className="content-card facturas-items-card">
            <div className="card-header facturas-card-header">
              <h3>Items de la Venta</h3>
              <span className="items-count">{venta.items?.length || 0} items</span>
            </div>

            <div className="table-container facturas-table-container">
              <table className="data-table facturas-data-table">
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
          </div>
        </section>
      </main>
    </div>
  );
}
"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FiEye, FiEdit, FiSearch, FiFilter, FiShoppingBag, FiRefreshCw, FiPackage, FiTruck, FiCheckCircle } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";

interface OrdenItem {
  productoId: number;
  nombre: string;
  cantidad: number;
  priceInCents: number;
  priceInPesos: number;
  subtotalInCents: number;
}

interface OrdenAPI {
  id: number;
  uuid: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  totalInCents: number;
  totalInPesos: number;
  createdAt: string;
  updatedAt: string;
  items: OrdenItem[];
  itemsCount: number;
}

interface OrdenDisplay {
  id: string;
  cliente: string;
  email: string;
  telefono: string;
  fecha: string;
  total: number;
  estado: "Pendiente" | "Confirmada" | "Enviada" | "Entregada" | "Cancelada" | "CREATED" | "PAID" | "PROCESSING";
  items: number;
  metodoPago: string;
  direccionEnvio: string;
  productos: OrdenItem[];
  orderId: number;
  uuid: string;
}

export default function OrdenesEcommercePage() {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>("E-commerce");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [ordenes, setOrdenes] = useState<OrdenDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  // Cargar órdenes desde el endpoint
  const fetchOrdenes = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/checkout/all-orders`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron cargar las órdenes`);
      }
      
      const data: OrdenAPI[] = await response.json();
      
      // Transformar datos de la API al formato de visualización
      const ordenesTransformadas: OrdenDisplay[] = data.map(orden => ({
        id: `ORD-${String(orden.id).padStart(5, '0')}`,
        orderId: orden.id,
        uuid: orden.uuid,
        cliente: orden.customerName,
        email: orden.customerEmail,
        telefono: orden.customerPhone,
        fecha: new Date(orden.createdAt).toLocaleDateString('es-CO'),
        fechaCompleta: orden.createdAt,
        total: orden.totalInPesos,
        estado: mapEstado(orden.status),
        items: orden.itemsCount,
        metodoPago: determinarMetodoPago(orden.status),
        direccionEnvio: "Por confirmar", // Este campo no viene en la API
        productos: orden.items || []
      }));
      
      setOrdenes(ordenesTransformadas);
    } catch (err: any) {
      console.error("Error cargando órdenes:", err);
      setError(err.message || "Error al cargar las órdenes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  // Mapear estados de la API a estados de visualización
  const mapEstado = (estadoAPI: string): OrdenDisplay["estado"] => {
    switch (estadoAPI?.toUpperCase()) {
      case "CREATED":
        return "Pendiente";
      case "PAID":
      case "APPROVED":
        return "Confirmada";
      case "PROCESSING":
        return "Enviada";
      case "COMPLETED":
        return "Entregada";
      case "FAILED":
      case "DECLINED":
        return "Cancelada";
      default:
        return "Pendiente";
    }
  };

  // Determinar método de pago basado en el estado
  const determinarMetodoPago = (estado: string): string => {
    // En una implementación real, esto vendría de la API
    // Por ahora, usamos un método por defecto
    return estado === "PAID" ? "Tarjeta Crédito" : "Por confirmar";
  };

  // Formatear fecha para mostrar
  const formatFechaDetallada = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar órdenes
  const ordenesFiltradas = ordenes.filter(orden => {
    const coincideBusqueda = 
      orden.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.telefono.includes(busqueda);
    
    const coincideEstado = !filtroEstado || orden.estado === filtroEstado;
    
    return coincideBusqueda && coincideEstado;
  });

  const handleBusquedaChange = (event: ChangeEvent<HTMLInputElement>) => {
    setBusqueda(event.target.value);
  };

  const handleEstadoChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFiltroEstado(event.target.value);
  };

  const verDetalleOrden = (orden: OrdenDisplay) => {
    // Crear un modal o página de detalle
    const detalle = `
      Orden: ${orden.id}
      Referencia: ${orden.uuid}
      Cliente: ${orden.cliente}
      Email: ${orden.email}
      Teléfono: ${orden.telefono}
      Fecha: ${formatFechaDetallada(orden.fechaCompleta)}
      Total: $${orden.total.toLocaleString('es-CO')}
      Estado: ${orden.estado}
      Método de Pago: ${orden.metodoPago}
      Items: ${orden.items}
      
      Productos:
      ${orden.productos.map(p => `  • ${p.cantidad}x ${p.nombre} - $${p.priceInPesos.toLocaleString('es-CO')} c/u`).join('\n')}
    `;
    
    alert(detalle);
  };

  const actualizarEstado = async (ordenId: string, nuevoEstado: string) => {
    // En una implementación real, aquí harías una llamada a la API
    // Por ahora, solo actualizamos el estado local
    setOrdenes(prev => prev.map(orden => 
      orden.id === ordenId ? { ...orden, estado: nuevoEstado as any } : orden
    ));
    
    alert(`Orden ${ordenId} actualizada a: ${nuevoEstado}`);
  };

  // Estilo para los badges de estado
  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return { color: '#f59e0b', bg: '#fffbeb', icon: <FiPackage /> };
      case 'Confirmada':
        return { color: '#10b981', bg: '#f0fdf4', icon: <FiCheckCircle /> };
      case 'Enviada':
        return { color: '#3b82f6', bg: '#eff6ff', icon: <FiTruck /> };
      case 'Entregada':
        return { color: '#8b5cf6', bg: '#f5f3ff', icon: <FiCheckCircle /> };
      case 'Cancelada':
        return { color: '#ef4444', bg: '#fef2f2', icon: <FiPackage /> };
      default:
        return { color: '#6b7280', bg: '#f9fafb', icon: <FiPackage /> };
    }
  };

  if (loading && !refreshing) {
    return React.createElement(
      "div",
      { className: "dashboard-page" },
      React.createElement(Sidebar, { activeMenu, onMenuToggle: setActiveMenu }),
      React.createElement(
        "main",
        { className: "dashboard-main" },
        React.createElement(
          "div",
          { className: "loading-state" },
          React.createElement("div", { className: "loading-spinner" }),
          React.createElement("h3", null, "Cargando órdenes...")
        )
      )
    );
  }

  return React.createElement(
    "div",
    { className: "dashboard-page" },
    
    React.createElement(Sidebar, { activeMenu, onMenuToggle: setActiveMenu }),

    React.createElement(
      "main",
      { className: "dashboard-main" },

      // Header
      React.createElement(
        "header",
        { className: "dashboard-header" },
        React.createElement(
          "div",
          { className: "header-content" },
          React.createElement(
            "div",
            { className: "welcome-section" },
            React.createElement("h1", { className: "welcome-title" }, "Gestión de Órdenes E-commerce"),
            React.createElement("p", { className: "welcome-date" }, "Administre las órdenes de la tienda online")
          ),
          React.createElement(
            "button",
            {
              className: "btn-secondary",
              onClick: fetchOrdenes,
              disabled: refreshing,
              style: { display: 'flex', alignItems: 'center', gap: '8px' }
            },
            React.createElement(FiRefreshCw, { className: refreshing ? "spin" : "" }),
            refreshing ? "Actualizando..." : "Actualizar"
          )
        )
      ),

      // Mensaje de error
      error && React.createElement(
        "div",
        { className: "error-message", style: { 
          margin: '0 20px 20px 20px',
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }},
        React.createElement(FiPackage, null),
        React.createElement("span", null, error),
        React.createElement(
          "button",
          {
            onClick: fetchOrdenes,
            style: {
              marginLeft: 'auto',
              padding: '4px 12px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }
          },
          "Reintentar"
        )
      ),

      // Estadísticas
      React.createElement(
        "section",
        { className: "stats-section" },
        React.createElement(
          "div",
          { className: "stats-grid", style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' } },
          React.createElement(
            "div",
            { className: "stat-card" },
            React.createElement("h3", null, "Total Órdenes"),
            React.createElement("p", { className: "stat-number" }, ordenes.length)
          ),
          React.createElement(
            "div",
            { className: "stat-card" },
            React.createElement("h3", null, "Ventas Totales"),
            React.createElement(
              "p",
              { className: "stat-number" },
              `$${ordenes.reduce((sum, orden) => sum + orden.total, 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`
            )
          ),
          React.createElement(
            "div",
            { className: "stat-card" },
            React.createElement("h3", null, "Pendientes"),
            React.createElement(
              "p",
              { className: "stat-number" },
              ordenes.filter(o => o.estado === 'Pendiente').length
            )
          ),
          React.createElement(
            "div",
            { className: "stat-card" },
            React.createElement("h3", null, "Confirmadas"),
            React.createElement(
              "p",
              { className: "stat-number" },
              ordenes.filter(o => o.estado === 'Confirmada').length
            )
          )
        )
      ),

      // Controles de búsqueda
      React.createElement(
        "section",
        { className: "stats-section" },
        React.createElement(
          "div",
          { className: "filters-container" },
          React.createElement(
            "div",
            { className: "search-box" },
            React.createElement(FiSearch, { className: "search-icon" }),
            React.createElement("input", {
              type: "text",
              placeholder: "Buscar por orden, cliente, email o teléfono...",
              value: busqueda,
              onChange: handleBusquedaChange,
              className: "search-input"
            })
          ),
          React.createElement(
            "div",
            { className: "filter-group" },
            React.createElement(FiFilter, { style: { marginRight: "8px" } }),
            React.createElement(
              "select",
              {
                value: filtroEstado,
                onChange: handleEstadoChange,
                className: "filter-select"
              },
              React.createElement("option", { value: "" }, "Todos los estados"),
              React.createElement("option", { value: "Pendiente" }, "Pendientes"),
              React.createElement("option", { value: "Confirmada" }, "Confirmadas"),
              React.createElement("option", { value: "Enviada" }, "Enviadas"),
              React.createElement("option", { value: "Entregada" }, "Entregadas"),
              React.createElement("option", { value: "Cancelada" }, "Canceladas")
            )
          )
        )
      ),

      // Tabla de órdenes
      React.createElement(
        "section",
        { className: "content-section" },
        React.createElement(
          "div",
          { className: "content-card" },
          React.createElement(
            "div",
            { className: "card-header" },
            React.createElement("h3", null, `Órdenes (${ordenesFiltradas.length})`),
            React.createElement("span", { className: "subtitle" }, `Total: ${ordenes.length} órdenes`)
          ),
          React.createElement(
            "div",
            { className: "table-container" },
            ordenesFiltradas.length > 0 ? 
              React.createElement(
                "table",
                { className: "data-table" },
                React.createElement(
                  "thead",
                  null,
                  React.createElement(
                    "tr",
                    null,
                    React.createElement("th", null, "Orden ID"),
                    React.createElement("th", null, "Cliente"),
                    React.createElement("th", null, "Fecha"),
                    React.createElement("th", null, "Total"),
                    React.createElement("th", null, "Productos"),
                    React.createElement("th", null, "Estado"),
                    React.createElement("th", null, "Acciones")
                  )
                ),
                React.createElement(
                  "tbody",
                  null,
                  ordenesFiltradas.map(orden => {
                    const estadoStyle = getEstadoStyle(orden.estado);
                    
                    return React.createElement(
                      "tr",
                      { key: orden.id },
                      React.createElement(
                        "td",
                        null,
                        React.createElement("strong", null, orden.id),
                        React.createElement("br"),
                        React.createElement("small", { style: { color: "var(--text-gray)", fontSize: "12px" } }, orden.uuid)
                      ),
                      React.createElement(
                        "td",
                        null,
                        React.createElement("strong", null, orden.cliente),
                        React.createElement("br"),
                        React.createElement("small", { style: { color: "var(--text-gray)" } }, orden.email),
                        React.createElement("br"),
                        React.createElement("small", { style: { color: "var(--text-gray)" } }, orden.telefono)
                      ),
                      React.createElement("td", null, orden.fecha),
                      React.createElement(
                        "td",
                        null,
                        React.createElement("strong", null, `$${orden.total.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`)
                      ),
                      React.createElement(
                        "td",
                        null,
                        React.createElement("div", { style: { maxWidth: '200px' } },
                          React.createElement("strong", null, `${orden.items} productos`),
                          orden.productos.slice(0, 2).map((p, idx) => 
                            React.createElement("div", { key: idx, style: { fontSize: '12px', color: '#666' } },
                              `${p.cantidad}x ${p.nombre.substring(0, 30)}${p.nombre.length > 30 ? '...' : ''}`
                            )
                          ),
                          orden.productos.length > 2 && 
                            React.createElement("small", { style: { color: '#888', fontStyle: 'italic' } },
                              `+${orden.productos.length - 2} más`
                            )
                        )
                      ),
                      React.createElement(
                        "td",
                        null,
                        React.createElement(
                          "span",
                          { 
                            className: "status-badge",
                            style: { 
                              backgroundColor: estadoStyle.bg,
                              color: estadoStyle.color,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }
                          },
                          estadoStyle.icon,
                          orden.estado
                        )
                      ),
                      React.createElement(
                        "td",
                        null,
                        React.createElement(
                          "div",
                          { className: "action-buttons", style: { display: 'flex', gap: '8px', alignItems: 'center' } },
                          React.createElement(
                            "button",
                            {
                              onClick: () => verDetalleOrden(orden),
                              className: "btn-primary",
                              title: "Ver detalle completo"
                            },
                            React.createElement(FiEye)
                          ),
                          React.createElement(
                            "select",
                            {
                              onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                                actualizarEstado(orden.id, e.currentTarget.value),
                              className: "status-select",
                              defaultValue: orden.estado,
                              style: { padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }
                            },
                            React.createElement("option", { value: "Pendiente" }, "Pendiente"),
                            React.createElement("option", { value: "Confirmada" }, "Confirmada"),
                            React.createElement("option", { value: "Enviada" }, "Enviada"),
                            React.createElement("option", { value: "Entregada" }, "Entregada"),
                            React.createElement("option", { value: "Cancelada" }, "Cancelada")
                          )
                        )
                      )
                    );
                  })
                )
              ) :
              React.createElement(
                "div",
                { className: "empty-state" },
                React.createElement(FiShoppingBag, { size: 48 }),
                React.createElement("p", null, error ? "Error al cargar órdenes" : "No se encontraron órdenes"),
                React.createElement("span", null, error || "No hay órdenes que coincidan con los filtros aplicados")
              )
          )
        )
      )
    )
  );
}
"use client";
import React, { useState, ChangeEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { FiEye, FiEdit, FiSearch, FiFilter, FiShoppingBag } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";

interface Orden {
  id: string;
  cliente: string;
  email: string;
  telefono: string;
  fecha: string;
  total: number;
  estado: "Pendiente" | "Confirmada" | "Enviada" | "Entregada" | "Cancelada";
  items: number;
  metodoPago: string;
  direccionEnvio: string;
}

export default function OrdenesEcommercePage() {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>("E-commerce");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const ordenes: Orden[] = [
    {
      id: "ORD-00125",
      cliente: "María González",
      email: "maria@email.com",
      telefono: "+57 300 123 4567",
      fecha: "2024-01-15",
      total: 156.80,
      estado: "Entregada",
      items: 3,
      metodoPago: "Tarjeta Crédito",
      direccionEnvio: "Calle 123 #45-67, Bogotá"
    },
    {
      id: "ORD-00124",
      cliente: "Carlos Rodríguez",
      email: "carlos@email.com",
      telefono: "+57 310 987 6543",
      fecha: "2024-01-15",
      total: 89.50,
      estado: "Enviada",
      items: 2,
      metodoPago: "PayPal",
      direccionEnvio: "Av. Principal #89-10, Medellín"
    },
    {
      id: "ORD-00123",
      cliente: "Ana Martínez",
      email: "ana@email.com",
      telefono: "+57 320 456 7890",
      fecha: "2024-01-14",
      total: 234.20,
      estado: "Confirmada",
      items: 5,
      metodoPago: "Tarjeta Débito",
      direccionEnvio: "Carrera 56 #12-34, Cali"
    },
    {
      id: "ORD-00122",
      cliente: "Laura Hernández",
      email: "laura@email.com",
      telefono: "+57 315 234 5678",
      fecha: "2024-01-14",
      total: 67.90,
      estado: "Pendiente",
      items: 1,
      metodoPago: "Efectivo",
      direccionEnvio: "Diagonal 78 #23-45, Barranquilla"
    }
  ];

  const ordenesFiltradas = ordenes.filter(orden => {
    const coincideBusqueda = orden.id.toLowerCase().includes(busqueda.toLowerCase()) ||
                           orden.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
                           orden.email.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = !filtroEstado || orden.estado === filtroEstado;
    
    return coincideBusqueda && coincideEstado;
  });

  const handleBusquedaChange = (event: ChangeEvent<HTMLInputElement>) => {
    setBusqueda(event.target.value);
  };

  const handleEstadoChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFiltroEstado(event.target.value);
  };

  const verDetalleOrden = (orden: Orden) => {
    alert(`Detalles de orden ${orden.id}\nCliente: ${orden.cliente}\nTotal: $${orden.total}\nEstado: ${orden.estado}`);
  };

  const actualizarEstado = (ordenId: string, nuevoEstado: string) => {
    alert(`Orden ${ordenId} actualizada a: ${nuevoEstado}`);
  };

  return React.createElement(
    "div",
    { className: "dashboard-page" },
    
    React.createElement(Sidebar, {
      activeMenu: activeMenu,
      onMenuToggle: setActiveMenu
    }),

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
            React.createElement("h1", { className: "welcome-title" }, "Gestión de Órdenes"),
            React.createElement("p", { className: "welcome-date" }, "Administre las órdenes de la tienda online")
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
              placeholder: "Buscar por orden, cliente o email...",
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
            React.createElement("h3", null, `Órdenes (${ordenesFiltradas.length})`)
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
                    React.createElement("th", null, "Método Pago"),
                    React.createElement("th", null, "Estado"),
                    React.createElement("th", null, "Acciones")
                  )
                ),
                React.createElement(
                  "tbody",
                  null,
                  ordenesFiltradas.map(orden => 
                    React.createElement(
                      "tr",
                      { key: orden.id },
                      React.createElement("td", null, orden.id),
                      React.createElement(
                        "td",
                        null,
                        React.createElement("strong", null, orden.cliente),
                        React.createElement("br"),
                        React.createElement("small", { style: { color: "var(--text-gray)" } }, orden.email)
                      ),
                      React.createElement("td", null, new Date(orden.fecha).toLocaleDateString()),
                      React.createElement("td", null, `$${orden.total.toFixed(2)}`),
                      React.createElement("td", null, orden.metodoPago),
                      React.createElement(
                        "td",
                        null,
                        React.createElement(
                          "span",
                          { 
                            className: `status-badge status-${orden.estado.toLowerCase()}` 
                          },
                          orden.estado
                        )
                      ),
                      React.createElement(
                        "td",
                        null,
                        React.createElement(
                          "div",
                          { className: "action-buttons" },
                          React.createElement(
                            "button",
                            {
                              onClick: () => verDetalleOrden(orden),
                              className: "btn-primary",
                              title: "Ver detalle"
                            },
                            React.createElement(FiEye)
                          ),
                          React.createElement(
  "select",
  {
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
      actualizarEstado(orden.id, e.currentTarget.value),
    className: "status-select",
    defaultValue: orden.estado
  },


                            
                            React.createElement("option", { value: "Pendiente" }, "Pendiente"),
                            React.createElement("option", { value: "Confirmada" }, "Confirmada"),
                            React.createElement("option", { value: "Enviada" }, "Enviada"),
                            React.createElement("option", { value: "Entregada" }, "Entregada"),
                            React.createElement("option", { value: "Cancelada" }, "Cancelada")
                          )
                        )
                      )
                    )
                  )
                )
              ) :
              React.createElement(
                "div",
                { className: "empty-state" },
                React.createElement(FiShoppingBag, { size: 48 }),
                React.createElement("p", null, "No se encontraron órdenes"),
                React.createElement("span", null, "No hay órdenes que coincidan con los filtros aplicados")
              )
          )
        )
      )
    )
  );
}
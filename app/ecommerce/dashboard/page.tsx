"use client";
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FiShoppingBag, FiTrendingUp, FiUsers, FiDollarSign, FiPackage } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";

interface MetricCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

interface OrdenReciente {
  id: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: string;
  items: number;
}

export default function EcommerceDashboardPage() {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>("E-commerce");

  const metricas: MetricCard[] = [
    { 
      title: "Ventas Hoy", 
      value: "$2,845", 
      change: "+12.5%", 
      icon: React.createElement(FiDollarSign), 
      color: "#00d4aa" 
    },
    { 
      title: "Órdenes", 
      value: "24", 
      change: "+8.2%", 
      icon: React.createElement(FiShoppingBag), 
      color: "#1F3B4D" 
    },
    { 
      title: "Clientes Nuevos", 
      value: "15", 
      change: "+5.1%", 
      icon: React.createElement(FiUsers), 
      color: "#00a88f" 
    },
    { 
      title: "Productos Vendidos", 
      value: "89", 
      change: "+15.3%", 
      icon: React.createElement(FiPackage), 
      color: "#2c3e50" 
    },
  ];

  const ordenesRecientes: OrdenReciente[] = [
    { id: "ORD-00125", cliente: "María González", fecha: "2024-01-15", total: 156.80, estado: "Completada", items: 3 },
    { id: "ORD-00124", cliente: "Carlos Rodríguez", fecha: "2024-01-15", total: 89.50, estado: "Enviada", items: 2 },
    { id: "ORD-00123", cliente: "Ana Martínez", fecha: "2024-01-14", total: 234.20, estado: "Procesando", items: 5 },
    { id: "ORD-00122", cliente: "Laura Hernández", fecha: "2024-01-14", total: 67.90, estado: "Completada", items: 1 },
  ];

  const productosPopulares = [
    { nombre: "Crema Hidratante Nivea", ventas: 45, stock: 12 },
    { nombre: "Shampoo Head & Shoulders", ventas: 38, stock: 25 },
    { nombre: "Labial Matte MAC", ventas: 32, stock: 8 },
    { nombre: "Protector Solar 50FPS", ventas: 28, stock: 15 },
  ];

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
            React.createElement("h1", { className: "welcome-title" }, "Dashboard E-commerce"),
            React.createElement("p", { className: "welcome-date" }, "Resumen de ventas y rendimiento de la tienda online")
          )
        )
      ),

      // Métricas
      React.createElement(
        "section",
        { className: "stats-section" },
        React.createElement(
          "div",
          { className: "stats-grid" },
          metricas.map((metrica, index) =>
            React.createElement(
              "div",
              { 
                key: index, 
                className: "stats-card",
                style: { '--accent-color': metrica.color } as React.CSSProperties
              },
              React.createElement(
                "div",
                { className: "stats-content" },
                React.createElement(
                  "div",
                  { className: "stats-info" },
                  React.createElement("h3", { className: "stats-title" }, metrica.title),
                  React.createElement("p", { className: "stats-value" }, metrica.value),
                  React.createElement("p", { 
                    className: `stats-change ${metrica.change.startsWith('+') ? 'positive' : 'negative'}`
                  }, metrica.change)
                ),
                React.createElement(
                  "div",
                  { 
                    className: "stats-icon",
                    style: { backgroundColor: `${metrica.color}15` }
                  },
                  React.createElement("span", { 
                    style: { color: metrica.color } 
                  }, metrica.icon)
                )
              )
            )
          )
        )
      ),

      // Contenido Principal
      React.createElement(
        "section",
        { className: "content-section" },
        React.createElement(
          "div",
          { className: "content-grid", style: { gridTemplateColumns: "2fr 1fr" } },

          // Órdenes Recientes
          React.createElement(
            "div",
            { className: "content-card" },
            React.createElement(
              "div",
              { className: "card-header" },
              React.createElement("h3", null, "Órdenes Recientes"),
              React.createElement("button", { className: "btn-text" }, "Ver todas")
            ),
            React.createElement(
              "div",
              { className: "table-container" },
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
                    React.createElement("th", null, "Estado")
                  )
                ),
                React.createElement(
                  "tbody",
                  null,
                  ordenesRecientes.map(orden => 
                    React.createElement(
                      "tr",
                      { key: orden.id },
                      React.createElement("td", null, orden.id),
                      React.createElement("td", null, orden.cliente),
                      React.createElement("td", null, new Date(orden.fecha).toLocaleDateString()),
                      React.createElement("td", null, `$${orden.total.toFixed(2)}`),
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
                      )
                    )
                  )
                )
              )
            )
          ),

          // Productos Populares
          React.createElement(
            "div",
            { className: "content-card" },
            React.createElement(
              "div",
              { className: "card-header" },
              React.createElement("h3", null, "Productos Populares")
            ),
            React.createElement(
              "div",
              { className: "popular-products" },
              productosPopulares.map((producto, index) =>
                React.createElement(
                  "div",
                  { key: index, className: "popular-product-item" },
                  React.createElement(
                    "div",
                    { className: "product-info" },
                    React.createElement("h4", null, producto.nombre),
                    React.createElement("span", null, `${producto.ventas} ventas`)
                  ),
                  React.createElement(
                    "span",
                    { 
                      className: `stock-badge stock-${producto.stock > 10 ? 'normal' : 'bajo'}` 
                    },
                    `${producto.stock} en stock`
                  )
                )
              )
            )
          )
        )
      )
    )
  );
}
"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FiTrendingUp, FiUsers, FiShoppingCart, FiPackage, FiCreditCard, FiBarChart2, FiDollarSign, FiCheckCircle, FiTruck } from "react-icons/fi";
import Sidebar from "./Sidebar";
import "./dashboard.css";

interface StatsCard {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [statsData, setStatsData] = useState({
    totalVentas: 0,
    totalOrdenes: 0,
    totalProductos: 0,
    ventasPendientes: 0,
    comprasTotales: 0,
    proveedoresActivos: 0,
    ordenesPendientes: 0,
    ordenesConfirmadas: 0
  });
  const [loading, setLoading] = useState(true);

  // Función para cargar datos del dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
      
      // Cargar múltiples endpoints en paralelo
      const [ordenesRes, productosRes, comprasRes, ventasRes] = await Promise.all([
        fetch(`${API_BASE_URL}/checkout/all-orders`).catch(() => ({ ok: false })),
        fetch(`${API_BASE_URL}/productos`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }).catch(() => ({ ok: false })),
        fetch(`${API_BASE_URL}/purchases`).catch(() => ({ ok: false })),
        fetch(`${API_BASE_URL}/sales`).catch(() => ({ ok: false }))
      ]);

      let totalVentas = 0;
      let totalOrdenes = 0;
      let totalProductos = 0;
      let ventasPendientes = 0;
      let comprasTotales = 0;
      let ordenesPendientes = 0;
      let ordenesConfirmadas = 0;

      // Procesar órdenes e-commerce
      if (ordenesRes.ok) {
        const ordenesData = await ordenesRes.json();
        totalOrdenes = ordenesData.length;
        ordenesPendientes = ordenesData.filter((orden: any) => 
          orden.status === "CREATED" || orden.status === "Pendiente"
        ).length;
        ordenesConfirmadas = ordenesData.filter((orden: any) => 
          orden.status === "PAID" || orden.status === "APPROVED" || orden.status === "Confirmada"
        ).length;
      }

      // Procesar productos
      if (productosRes.ok) {
        const productosData = await productosRes.json();
        totalProductos = productosData.length;
      }

      // Procesar compras
      if (comprasRes.ok) {
        const comprasData = await comprasRes.json();
        comprasTotales = comprasData.length;
      }

      // Procesar ventas
      if (ventasRes.ok) {
        const ventasData = await ventasRes.json();
        totalVentas = ventasData.reduce((acc: number, venta: any) => acc + (venta.totalFactura || 0), 0);
        ventasPendientes = ventasData.filter((venta: any) => venta.estado !== 'ERROR').length;
      }

      setStatsData({
        totalVentas,
        totalOrdenes,
        totalProductos,
        ventasPendientes,
        comprasTotales,
        proveedoresActivos: 0, // Necesitaríamos endpoint de proveedores
        ordenesPendientes,
        ordenesConfirmadas
      });

    } catch (error) {
      console.error("Error cargando datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Actualizar datos cada 60 segundos
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const statsCards: StatsCard[] = [
    { 
      title: "Ventas Totales", 
      value: loading ? "Cargando..." : `$${statsData.totalVentas.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`,
      change: "+12.5%", 
      icon: React.createElement(FiTrendingUp), 
      color: "#00d4aa",
      loading
    },
    { 
      title: "Órdenes E-commerce", 
      value: loading ? "Cargando..." : statsData.totalOrdenes.toString(),
      change: statsData.totalOrdenes > 0 ? `✓ ${statsData.ordenesConfirmadas} confirmadas` : "",
      icon: React.createElement(FiShoppingCart), 
      color: "#1F3B4D",
      loading
    },
    { 
      title: "Productos en Inventario", 
      value: loading ? "Cargando..." : statsData.totalProductos.toString(),
      change: "+2.4%", 
      icon: React.createElement(FiPackage), 
      color: "#00a88f",
      loading
    },
    { 
      title: "Ventas por Facturar", 
      value: loading ? "Cargando..." : statsData.ventasPendientes.toString(),
      change: statsData.ventasPendientes > 0 ? "Requieren atención" : "✓ Al día",
      icon: React.createElement(FiCreditCard), 
      color: "#2c3e50",
      loading
    },
  ];

  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return React.createElement(
    "div",
    { className: "dashboard-page" },
    
    // Sidebar
    React.createElement(Sidebar, {
      activeMenu: activeMenu,
      onMenuToggle: setActiveMenu
    }),

    // Main content
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
            React.createElement("h1", { className: "welcome-title" }, "Bienvenido, ", React.createElement("strong", null, user || "Usuario")),
            React.createElement("p", { className: "welcome-date" }, today)
          ),
          React.createElement(
            "div",
            { className: "header-actions" },
            React.createElement("button", { 
              className: "btn-notification",
              onClick: fetchDashboardData,
              disabled: loading
            }, loading ? "🔄" : "🔔"),
            React.createElement("div", { className: "user-avatar" }, 
              (user || "U").charAt(0).toUpperCase()
            )
          )
        )
      ),

      // Stats Grid
      React.createElement(
        "section",
        { className: "stats-section" },
        React.createElement(
          "div",
          { className: "stats-grid" },
          statsCards.map((card, index) =>
            React.createElement(
              "div",
              { 
                key: index, 
                className: "stats-card",
                style: { '--accent-color': card.color } as React.CSSProperties
              },
              React.createElement(
                "div",
                { className: "stats-content" },
                React.createElement(
                  "div",
                  { className: "stats-info" },
                  React.createElement("h3", { className: "stats-title" }, card.title),
                  React.createElement("p", { className: "stats-value" }, card.value),
                  card.change && React.createElement("p", { 
                    className: `stats-change ${
                      card.change.includes('+') || card.change.includes('✓') ? 'positive' : 
                      card.change.includes('-') ? 'negative' : 'neutral'
                    }`
                  }, card.change)
                ),
                React.createElement(
                  "div",
                  { 
                    className: "stats-icon",
                    style: { backgroundColor: `${card.color}15` }
                  },
                  React.createElement("span", { 
                    style: { color: card.color } 
                  }, card.icon)
                )
              )
            )
          )
        )
      ),

      // Main Content Area
      React.createElement(
        "section",
        { className: "content-section" },
        React.createElement(
          "div",
          { className: "content-grid" },
          
          // Gráfico placeholder
          React.createElement(
            "div",
            { className: "content-card chart-card" },
            React.createElement(
              "div",
              { className: "card-header" },
              React.createElement("h3", null, "Resumen General"),
              React.createElement("button", { 
                className: "btn-text",
                onClick: fetchDashboardData
              }, "Actualizar datos")
            ),
            React.createElement(
              "div",
              { className: "chart-placeholder" },
              !loading ? React.createElement(
                "div",
                { className: "dashboard-summary" },
                React.createElement("div", { className: "summary-item" },
                  React.createElement(FiShoppingCart, { size: 20 }),
                  React.createElement("span", null, `${statsData.totalOrdenes} órdenes en total`)
                ),
                React.createElement("div", { className: "summary-item" },
                  React.createElement(FiCheckCircle, { size: 20, color: "#10b981" }),
                  React.createElement("span", null, `${statsData.ordenesConfirmadas} órdenes confirmadas`)
                ),
                React.createElement("div", { className: "summary-item" },
                  React.createElement(FiPackage, { size: 20 }),
                  React.createElement("span", null, `${statsData.totalProductos} productos en inventario`)
                ),
                React.createElement("div", { className: "summary-item" },
                  React.createElement(FiDollarSign, { size: 20, color: "#00d4aa" }),
                  React.createElement("span", null, `$${statsData.totalVentas.toLocaleString('es-CO')} en ventas`)
                )
              ) : React.createElement(
                "div",
                null,
                React.createElement(FiBarChart2, { size: 48 }),
                React.createElement("p", null, "Cargando datos...")
              )
            )
          ),

          // Actividad reciente
          React.createElement(
            "div",
            { className: "content-card activity-card" },
            React.createElement(
              "div",
              { className: "card-header" },
              React.createElement("h3", null, "Actividad Reciente")
            ),
            React.createElement(
              "div",
              { className: "activity-list" },
              React.createElement(
                "div",
                { className: "activity-item" },
                React.createElement("div", { className: "activity-icon" }, React.createElement(FiShoppingCart)),
                React.createElement("div", { className: "activity-content" },
                  React.createElement("p", null, `${statsData.ordenesPendientes} órdenes pendientes`),
                  React.createElement("span", null, "E-commerce")
                )
              ),
              React.createElement(
                "div",
                { className: "activity-item" },
                React.createElement("div", { className: "activity-icon" }, React.createElement(FiCreditCard)),
                React.createElement("div", { className: "activity-content" },
                  React.createElement("p", null, `${statsData.ventasPendientes} ventas por facturar`),
                  React.createElement("span", null, "Sistema de ventas")
                )
              ),
              React.createElement(
                "div",
                { className: "activity-item" },
                React.createElement("div", { className: "activity-icon" }, React.createElement(FiPackage)),
                React.createElement("div", { className: "activity-content" },
                  React.createElement("p", null, `${statsData.totalProductos} productos registrados`),
                  React.createElement("span", null, "Inventario actual")
                )
              )
            )
          )
        )
      )
    )
  );
}
"use client";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FiTrendingUp, FiUsers, FiShoppingCart, FiPackage, FiCreditCard, FiBarChart2 } from "react-icons/fi";
import Sidebar from "./Sidebar";
import "./dashboard.css";

interface StatsCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const statsCards: StatsCard[] = [
    { 
      title: "Ventas Totales", 
      value: "$24,580", 
      change: "+12.5%", 
      icon: React.createElement(FiTrendingUp), 
      color: "#00d4aa" 
    },
    { 
      title: "Clientes Activos", 
      value: "1,248", 
      change: "+5.2%", 
      icon: React.createElement(FiUsers), 
      color: "#1F3B4D" 
    },
    { 
      title: "Pedidos Pendientes", 
      value: "24", 
      change: "-3.1%", 
      icon: React.createElement(FiShoppingCart), 
      color: "#00a88f" 
    },
    { 
      title: "Inventario", 
      value: "1,847", 
      change: "+2.4%", 
      icon: React.createElement(FiPackage), 
      color: "#2c3e50" 
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
            React.createElement("button", { className: "btn-notification" }, "🔔"),
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
                  React.createElement("p", { 
                    className: `stats-change ${card.change.startsWith('+') ? 'positive' : 'negative'}`
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
              React.createElement("h3", null, "Resumen de Ventas"),
              React.createElement("button", { className: "btn-text" }, "Ver reporte")
            ),
            React.createElement(
              "div",
              { className: "chart-placeholder" },
              React.createElement(FiBarChart2, { size: 48 }),
              React.createElement("p", null, "Selecciona una opción del menú para ver los datos")
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
                  React.createElement("p", null, "Nuevo pedido #00125"),
                  React.createElement("span", null, "Hace 5 minutos")
                )
              ),
              React.createElement(
                "div",
                { className: "activity-item" },
                React.createElement("div", { className: "activity-icon" }, React.createElement(FiUsers)),
                React.createElement("div", { className: "activity-content" },
                  React.createElement("p", null, "Cliente registrado"),
                  React.createElement("span", null, "Hace 1 hora")
                )
              ),
              React.createElement(
                "div",
                { className: "activity-item" },
                React.createElement("div", { className: "activity-icon" }, React.createElement(FiCreditCard)),
                React.createElement("div", { className: "activity-content" },
                  React.createElement("p", null, "Pago procesado"),
                  React.createElement("span", null, "Hace 2 horas")
                )
              )
            )
          )
        )
      )
    )
  );
}
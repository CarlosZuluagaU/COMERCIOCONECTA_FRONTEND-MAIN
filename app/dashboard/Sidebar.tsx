"use client";
import React, { useState } from "react";
import { 
  FiChevronDown, 
  FiChevronUp, 
  FiUsers, 
  FiFileText, 
  FiBox, 
  FiHome, 
  FiSettings, 
  FiPackage, 
  FiShoppingBag,
  FiLogOut // <-- Agregar este icono
} from "react-icons/fi";
import { useRouter } from "next/navigation"; // <-- Importar useRouter

interface SubOption {
  label: string;
  path: string;
}

interface MenuItem {
  label: string;
  options: SubOption[];
  icon: React.ReactNode;
  path?: string;
}

interface SidebarProps {
  activeMenu?: string | null;
  onMenuToggle?: (menu: string | null) => void;
}

export default function Sidebar({ activeMenu, onMenuToggle }: SidebarProps) {
  const [localActiveMenu, setLocalActiveMenu] = useState<string | null>(null);
  const router = useRouter(); // <-- Inicializar router

  const menuItems: MenuItem[] = [
    { label: "Dashboard", options: [], icon: React.createElement(FiHome), path: "/dashboard" },
    { 
      label: "Productos", 
      options: [
        { label: "Agregar productos", path: "../products/add-product" },
        { label: "Listado de productos", path: "../products/product-list" },
      ], 
      icon: React.createElement(FiPackage) 
    },
    { 
      label: "E-commerce", 
      options: [
        { label: "Dashboard", path: "../store" },
        { label: "Órdenes", path: "../ecommerce/orders" },
      ], 
      icon: React.createElement(FiShoppingBag) 
    },
    { 
      label: "Clientes", 
      options: [
        { label: "Agregar cliente", path: "../clients/create-client" },
        { label: "Listado de clientes", path: "../clients/list-clients" },
      ], 
      icon: React.createElement(FiUsers) 
    },
    { 
      label: "Facturación", 
      options: [
        { label: "Crear venta", path: "../sales/create" },
        { label: "Ver ventas", path: "../sales" },
      ], 
      icon: React.createElement(FiFileText) 
    },
    { 
      label: "Compras", 
      options: [
        { label: "Realizar compra", path: "../purchases/create-purchase" },
        { label: "Histórico de compras", path: "../purchases/purchase-history" },
        { label: "Proveedores", path: "../purchases/suppliers" }
      ], 
      icon: React.createElement(FiBox) 
    },
  ];

  const handleMenuClick = (menuLabel: string) => {
    const newActiveMenu = (activeMenu ?? localActiveMenu) === menuLabel ? null : menuLabel;
    if (onMenuToggle) {
      onMenuToggle(newActiveMenu);
    } else {
      setLocalActiveMenu(newActiveMenu);
    }
  };

  // <-- Función para cerrar sesión
  const handleLogout = () => {
    // Limpiar el token de localStorage
    localStorage.removeItem("token");
    
    // Opcional: Limpiar otros datos de sesión
    // localStorage.removeItem("user");
    // localStorage.removeItem("userRole");
    
    // Redirigir al login
    router.push("/login");
  };

  const currentActiveMenu = activeMenu ?? localActiveMenu;

  return React.createElement(
    "aside",
    { className: "dashboard-sidebar" },
    
    // HEADER
    React.createElement(
      "div",
      { className: "sidebar-header" },
      React.createElement(
        "h1", 
        { className: "brand-title" },
        "Comercios",
        React.createElement("span", { className: "brand-accent" }, "Conecta")
      ),
      React.createElement("div", { className: "brand-subtitle" }, "Suite empresarial")
    ),

    // NAVIGATION
    React.createElement(
      "nav",
      { className: "sidebar-nav" },
      React.createElement(
        "ul",
        { className: "menu-list" },
        menuItems.map(menu =>
          React.createElement(
            "li",
            { key: menu.label, className: "menu-item" },
            
            // Botón principal
            React.createElement(
              menu.path ? "a" : "button",
              {
                className: `menu-button ${currentActiveMenu === menu.label ? "active" : ""}`,
                onClick: menu.options.length > 0 ? () => handleMenuClick(menu.label) : undefined,
                href: menu.path || undefined
              },
              React.createElement("span", { className: "menu-icon" }, menu.icon),
              React.createElement("span", { className: "menu-label" }, menu.label),
              menu.options.length > 0 && 
                React.createElement("span", { className: "chevron" }, 
                  currentActiveMenu === menu.label ? React.createElement(FiChevronUp) : React.createElement(FiChevronDown)
                )
            ),

            // Submenú
            currentActiveMenu === menu.label && menu.options.length > 0 &&
              React.createElement(
                "ul",
                { className: "submenu-list" },
                menu.options.map(option =>
                  React.createElement(
                    "li",
                    { key: option.label, className: "submenu-item" },
                    React.createElement(
                      "a",
                      { href: option.path, className: "submenu-link" },
                      option.label
                    )
                  )
                )
              )
          )
        )
      )
    ),

    // FOOTER CON BOTÓN DE CERRAR SESIÓN
    React.createElement(
      "div",
      { className: "sidebar-footer" },
      React.createElement(
        "button",
        {
          onClick: handleLogout,
          className: "logout-button",
          style: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: "12px 16px",
            backgroundColor: "#f56565",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "background-color 0.2s ease"
          }
        },
        React.createElement(FiLogOut, { size: 18 }),
        "Cerrar sesión"
      ),
      React.createElement(
        "div",
        { 
          className: "user-info",
          style: { marginTop: "10px", fontSize: "12px", color: "#666" }
        }, 
        "Sistema v1.0.0"
      )
    )
  );
}
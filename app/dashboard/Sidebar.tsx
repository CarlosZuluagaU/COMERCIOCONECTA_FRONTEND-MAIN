"use client";
import React, { useState, useEffect } from "react";
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
  FiLogOut,
  FiSun,
  FiMoon
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";

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
  const [businessName, setBusinessName] = useState<string>("");
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Primero intenta obtener del backend
    const fetchBusinessName = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
        const token = localStorage.getItem("token");
        
        if (!token) {
          // Si no hay token, usar localStorage
          setBusinessName(localStorage.getItem("businessName") || "");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/comercios`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const comercios = await response.json();
          // Si hay comercios, usar el primero (el del usuario actual)
          if (Array.isArray(comercios) && comercios.length > 0) {
            setBusinessName(comercios[0].nombre);
            localStorage.setItem("businessName", comercios[0].nombre);
          } else {
            setBusinessName(localStorage.getItem("businessName") || "");
          }
        } else {
          // Si falla, usar localStorage
          setBusinessName(localStorage.getItem("businessName") || "");
        }
      } catch (error) {
        // En caso de error, usar localStorage
        setBusinessName(localStorage.getItem("businessName") || "");
      }
    };

    fetchBusinessName();

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      setBusinessName(localStorage.getItem("businessName") || "");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
        { label: "Dashboard", path: "../store2" },
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

    // COMERCIO ACTUAL
    React.createElement(
      "div",
      { className: "sidebar-commerce-info" },
      React.createElement("p", { className: "commerce-label" }, "📍 Comercio actual"),
      React.createElement("p", { className: "commerce-name" }, businessName || "No registrado")
    ),
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
      // Botón de cambio de tema
      React.createElement(
        "button",
        {
          onClick: toggleTheme,
          className: "logout-button",
          style: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: "12px 16px",
            backgroundColor: theme === "dark" ? "#334155" : "rgba(255,255,255,0.15)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "background-color 0.2s ease",
            marginBottom: "8px"
          }
        },
        theme === "dark"
          ? React.createElement(FiSun, { size: 18 })
          : React.createElement(FiMoon, { size: 18 }),
        theme === "dark" ? "Modo claro" : "Modo oscuro"
      ),
      // Botón de cerrar sesión
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
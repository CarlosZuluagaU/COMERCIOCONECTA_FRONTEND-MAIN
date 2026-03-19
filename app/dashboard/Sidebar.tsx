"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import "./sidebar.css";

interface SidebarProps {
  activeMenu?: string | null;
  onMenuToggle?: (menu: string | null) => void;
}

const menu = [
  {
    label: "Estadísticas",
    icon: "📊",
    path: "/dashboard",
    sub: [],
  },
  {
    label: "Productos",
    icon: "📦",
    sub: [
      { label: "Listado de productos", path: "/products/product-list" },
      { label: "Agregar producto",     path: "/products/add-product" },
    ],
  },
  {
    label: "Pedidos",
    icon: "🛒",
    sub: [
      { label: "Ver pedidos", path: "/ecommerce/orders" },
    ],
  },
  {
    label: "Clientes",
    icon: "👥",
    sub: [
      { label: "Listado de clientes", path: "/clients/list-clients" },
      { label: "Agregar cliente",     path: "/clients/create-client" },
    ],
  },
  {
    label: "Facturación",
    icon: "🧾",
    sub: [
      { label: "Ver ventas",  path: "/sales" },
      { label: "Crear venta", path: "/sales/create" },
    ],
  },
  {
    label: "Compras",
    icon: "📋",
    sub: [
      { label: "Histórico de compras", path: "/purchases/purchase-history" },
      { label: "Realizar compra",      path: "/purchases/create-purchase" },
      { label: "Proveedores",          path: "/purchases/suppliers" },
    ],
  },
  {
    label: "Personalización",
    icon: "🎨",
    sub: [
      { label: "Apariencia de la tienda", path: "/personalization/store" },
    ],
  },
];

export default function Sidebar({ activeMenu, onMenuToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (label: string) => setOpen(prev => prev === label ? null : label);

  const handleLogout = () => {
    ["token", "refreshToken", "user", "googleUser"].forEach(k => localStorage.removeItem(k));
    router.push("/login");
  };

  return (
    <aside className="sb">
      <div className="sb-brand">
        <h1>Comercios<span>Conecta</span></h1>
        <p>Suite empresarial</p>
      </div>

      <nav className="sb-nav">
        {menu.map(item => {
          const isActive = item.path
            ? pathname === item.path
            : item.sub.some(s => pathname.startsWith(s.path));
          const isOpen = open === item.label;

          return (
            <div key={item.label}>
              {item.path && item.sub.length === 0 ? (
                <a
                  href={item.path}
                  className={`sb-item ${isActive ? "active" : ""}`}
                >
                  <span className="sb-icon">{item.icon}</span>
                  {item.label}
                </a>
              ) : (
                <button
                  className={`sb-item ${isActive ? "active" : ""}`}
                  onClick={() => toggle(item.label)}
                >
                  <span className="sb-icon">{item.icon}</span>
                  {item.label}
                  <span className="sb-chevron">{isOpen ? "▴" : "▾"}</span>
                </button>
              )}

              {isOpen && item.sub.length > 0 && (
                <div className="sb-sub">
                  {item.sub.map(s => (
                    <a
                      key={s.path}
                      href={s.path}
                      className={`sb-sub-link ${pathname === s.path ? "active" : ""}`}
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sb-footer">
        <button className="sb-logout" onClick={handleLogout}>
          🚪 Cerrar sesión
        </button>
        <p className="sb-version">Sistema v1.0.0</p>
      </div>
    </aside>
  );
}

"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FiBarChart2,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiFileText,
  FiPackage,
  FiTruck,
  FiSliders,
  FiExternalLink,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";
import "./sidebar.css";

interface SidebarProps {
  activeMenu?: string | null;
  onMenuToggle?: (menu: string | null) => void;
}

const menu = [
  {
    label: "Estadísticas",
    icon: <FiBarChart2 size={16} />,
    path: "/dashboard",
    sub: [],
  },
  {
    label: "Productos",
    icon: <FiBox size={16} />,
    sub: [
      { label: "Listado de productos", path: "/products/product-list" },
      { label: "Agregar producto",     path: "/products/add-product" },
    ],
  },
  {
    label: "Pedidos",
    icon: <FiShoppingBag size={16} />,
    sub: [
      { label: "Ver pedidos", path: "/ecommerce/orders" },
    ],
  },
  {
    label: "Clientes",
    icon: <FiUsers size={16} />,
    sub: [
      { label: "Listado de clientes", path: "/clients/list-clients" },
    ],
  },
  {
    label: "Facturación",
    icon: <FiFileText size={16} />,
    sub: [
      { label: "Ver ventas", path: "/sales" },
    ],
  },
  {
    label: "Compras",
    icon: <FiPackage size={16} />,
    sub: [
      { label: "Histórico de compras", path: "/purchases/purchase-history" },
      { label: "Realizar compra",      path: "/purchases/create-purchase" },
      { label: "Proveedores",          path: "/purchases/suppliers" },
    ],
  },
  {
    label: "Envíos",
    icon: <FiTruck size={16} />,
    sub: [
      { label: "Gestionar envíos",        path: "/shipping/manage" },
      { label: "Configuración de envíos", path: "/shipping/config" },
    ],
  },
  {
    label: "Personalización",
    icon: <FiSliders size={16} />,
    sub: [
      { label: "Apariencia de la tienda", path: "/personalization/store" },
    ],
  },
];

export default function Sidebar({ activeMenu, onMenuToggle }: SidebarProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (label: string) => {
    setOpen(prev => (prev === label ? null : label));
  };

  const handleLogout = () => {
    ["token", "refreshToken", "user", "googleUser"].forEach(k =>
      localStorage.removeItem(k)
    );
    router.push("/login");
  };

  return (
    <aside className="sb">

      {/* ── Brand ── */}
      <a href="/dashboard" className="sb-brand">
        <img
          src="/logo-mark.svg"
          width={32}
          height={32}
          alt="ComerciosConecta"
          className="sb-brand-logo"
        />
        <div className="sb-brand-text">
          <p className="sb-brand-name">
            Comercios<span>Conecta</span>
          </p>
          <p className="sb-brand-sub">Suite empresarial</p>
        </div>
      </a>

      {/* ── Nav ── */}
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
                  <span className={`sb-chevron ${isOpen ? "open" : ""}`}>
                    <FiChevronDown size={13} />
                  </span>
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

      {/* ── Tienda online ── */}
      <div className="sb-store-section">
        <p className="sb-store-label">Tu tienda online</p>
        <a href="/store" target="_blank" className="sb-store-btn">
          <FiExternalLink size={14} />
          Ver mi Tienda
        </a>
      </div>

      {/* ── Footer ── */}
      <div className="sb-footer">
        <button className="sb-logout" onClick={handleLogout}>
          <FiLogOut size={15} />
          Cerrar sesión
        </button>
        <p className="sb-version">v1.0.0</p>
      </div>

    </aside>
  );
}

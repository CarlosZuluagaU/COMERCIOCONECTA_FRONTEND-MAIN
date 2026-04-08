"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { FiPlus, FiEdit, FiTrash2, FiPhone, FiMail, FiMapPin, FiSearch, FiUsers } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import "../../dashboard/admin.css";
import "./suppliers.css";

interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  tipo: "Cosméticos" | "Farmacéutico" | "General";
  estado: "Activo" | "Inactivo";
  productos: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export default function ProveedoresPage() {
  const { token, comercioId } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>("Compras");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proveedorEdit, setProveedorEdit] = useState<Proveedor | null>(null);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const [formData, setFormData] = useState<Omit<Proveedor, "id" | "productos">>({
    nombre: "", contacto: "", telefono: "", email: "",
    direccion: "", tipo: "Cosméticos", estado: "Activo",
  });

  const fetchProveedores = async () => {
    if (!token) return;
    try {
      const cid = comercioId ?? localStorage.getItem("comercioId");
      const url = cid ? `${API_BASE_URL}/proveedores?comercioId=${cid}` : `${API_BASE_URL}/proveedores`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const text = await res.text();
      setProveedores(text ? JSON.parse(text) : []);
    } catch { setProveedores([]); }
  };

  useEffect(() => { fetchProveedores(); }, [token]);

  const proveedoresFiltrados = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.contacto.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.tipo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirFormulario = (p?: Proveedor) => {
    setProveedorEdit(p || null);
    setFormData(p ? { ...p } : { nombre: "", contacto: "", telefono: "", email: "", direccion: "", tipo: "Cosméticos", estado: "Activo" });
    setMostrarFormulario(true);
  };

  const guardarProveedor = async () => {
    if (!token) return;
    try {
      const metodo = proveedorEdit ? "PUT" : "POST";
      const url = proveedorEdit ? `${API_BASE_URL}/proveedores/${proveedorEdit.id}` : `${API_BASE_URL}/proveedores`;
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          productos: proveedorEdit?.productos || [],
          comercioId: (comercioId ?? Number(localStorage.getItem("comercioId"))) || null,
        }),
      });
      if (!res.ok) throw new Error();
      await fetchProveedores();
      setMostrarFormulario(false);
    } catch { alert("No se pudo guardar el proveedor"); }
  };

  const eliminarProveedor = async (id: string) => {
    if (!token || !confirm("¿Eliminar este proveedor?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/proveedores/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setProveedores(prev => prev.filter(p => p.id !== id));
    } catch { alert("No se pudo eliminar el proveedor"); }
  };

  const field = (f: keyof typeof formData) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData(prev => ({ ...prev, [f]: e.target.value }));

  const inicial = (nombre: string) => (nombre || "?").charAt(0).toUpperCase();

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">

        {/* Header */}
        <header className="sup-header">
          <div className="sup-header-left">
            <h1>🏢 Gestión de Proveedores</h1>
            <p>Administra los proveedores de tu negocio</p>
          </div>
          <button className="sup-btn-new" onClick={() => abrirFormulario()}>
            <FiPlus /> Nuevo Proveedor
          </button>
        </header>

        <div className="adm-content">

          {/* Stats */}
          <div className="adm-stats-3">
            <div className="adm-stat" style={{ "--sc": "#00d4aa" } as React.CSSProperties}>
              <h4>Total Proveedores</h4>
              <div className="adm-val">{proveedores.length}</div>
            </div>
            <div className="adm-stat" style={{ "--sc": "#10b981" } as React.CSSProperties}>
              <h4>Activos</h4>
              <div className="adm-val">{proveedores.filter(p => p.estado === "Activo").length}</div>
            </div>
            <div className="adm-stat" style={{ "--sc": "#6b7280" } as React.CSSProperties}>
              <h4>Inactivos</h4>
              <div className="adm-val">{proveedores.filter(p => p.estado === "Inactivo").length}</div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="sup-toolbar">
            <div className="sup-search-wrap">
              <FiSearch color="#aaa" />
              <input
                className="sup-search-input"
                placeholder="Buscar por nombre, contacto o tipo…"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
            <span className="sup-count">{proveedoresFiltrados.length} proveedor{proveedoresFiltrados.length !== 1 ? "es" : ""}</span>
          </div>

          {/* Grid de tarjetas */}
          <div className="sup-grid">
            {proveedoresFiltrados.length === 0 ? (
              <div className="sup-empty">
                <FiUsers size={48} />
                <p>No hay proveedores</p>
                <span>Agrega tu primer proveedor con el botón "Nuevo Proveedor"</span>
              </div>
            ) : proveedoresFiltrados.map(p => (
              <div key={p.id} className="sup-card">
                {/* Top oscuro */}
                <div className="sup-card-top">
                  <div className="sup-avatar">{inicial(p.nombre)}</div>
                  <div className="sup-card-name">
                    <h3>{p.nombre}</h3>
                    <span className="sup-tipo-badge">{p.tipo}</span>
                  </div>
                  <span className={`sup-estado-badge ${p.estado === "Activo" ? "sup-estado-activo" : "sup-estado-inactivo"}`}>
                    {p.estado}
                  </span>
                </div>

                {/* Info de contacto */}
                <div className="sup-card-info">
                  {p.contacto && (
                    <div className="sup-info-row">
                      <span className="sup-info-label">Contacto</span>
                      <span>{p.contacto}</span>
                    </div>
                  )}
                  {p.telefono && (
                    <div className="sup-info-row">
                      <FiPhone size={13} />
                      <span>{p.telefono}</span>
                    </div>
                  )}
                  {p.email && (
                    <div className="sup-info-row">
                      <FiMail size={13} />
                      <span>{p.email}</span>
                    </div>
                  )}
                  {p.direccion && (
                    <div className="sup-info-row">
                      <FiMapPin size={13} />
                      <span>{p.direccion}</span>
                    </div>
                  )}
                </div>

                {/* Tags productos */}
                <div className="sup-products">
                  <div className="sup-products-label">Productos</div>
                  {p.productos && p.productos.length > 0 ? (
                    <div className="sup-tags">
                      {p.productos.map((prod, i) => (
                        <span key={i} className="sup-tag">{prod}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="sup-no-products">Sin productos asignados</span>
                  )}
                </div>

                {/* Acciones */}
                <div className="sup-card-actions">
                  <button className="sup-act-btn sup-act-edit" onClick={() => abrirFormulario(p)}>
                    <FiEdit size={13} /> Editar
                  </button>
                  <button className="sup-act-btn sup-act-del" onClick={() => eliminarProveedor(p.id)}>
                    <FiTrash2 size={13} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Modal */}
        {mostrarFormulario && (
          <div className="sup-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setMostrarFormulario(false); }}>
            <div className="sup-modal">
              <div className="sup-modal-header">
                <h3>{proveedorEdit ? "✏️ Editar Proveedor" : "➕ Nuevo Proveedor"}</h3>
                <button className="sup-modal-close" onClick={() => setMostrarFormulario(false)}>✕</button>
              </div>
              <div className="sup-modal-body">
                <div className="sup-modal-fields">
                  <div className="sup-field">
                    <label>Nombre *</label>
                    <input className="sup-input" placeholder="Ej: Distribuidora Beauty" value={formData.nombre} onChange={field("nombre")} />
                  </div>
                  <div className="sup-field">
                    <label>Persona de Contacto *</label>
                    <input className="sup-input" placeholder="Ej: María González" value={formData.contacto} onChange={field("contacto")} />
                  </div>
                  <div className="sup-field">
                    <label>Teléfono</label>
                    <input className="sup-input" placeholder="+57 300 123 4567" value={formData.telefono} onChange={field("telefono")} />
                  </div>
                  <div className="sup-field">
                    <label>Email</label>
                    <input type="email" className="sup-input" placeholder="ejemplo@proveedor.com" value={formData.email} onChange={field("email")} />
                  </div>
                  <div className="sup-field full">
                    <label>Dirección</label>
                    <textarea className="sup-input" placeholder="Dirección completa" rows={2} value={formData.direccion} onChange={field("direccion")} />
                  </div>
                  <div className="sup-field">
                    <label>Tipo</label>
                    <select className="sup-input" value={formData.tipo} onChange={field("tipo")}>
                      <option value="Cosméticos">Cosméticos</option>
                      <option value="Farmacéutico">Farmacéutico</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div className="sup-field">
                    <label>Estado</label>
                    <select className="sup-input" value={formData.estado} onChange={field("estado")}>
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="sup-modal-footer">
                <button className="sup-btn-cancel" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
                <button
                  className="sup-btn-submit"
                  onClick={guardarProveedor}
                  disabled={!formData.nombre || !formData.contacto}
                >
                  {proveedorEdit ? "Actualizar" : "Crear Proveedor"}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

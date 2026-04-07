"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiPhone,
  FiMail,
  FiMapPin,
  FiSearch,
} from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";

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
  const { user, token, comercioId } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>("Compras");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proveedorEdit, setProveedorEdit] = useState<Proveedor | null>(null);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const [formData, setFormData] = useState<Omit<Proveedor, "id" | "productos">>({
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    tipo: "Cosméticos",
    estado: "Activo",
  });

  // ===== Fetch proveedores seguro =====
  const fetchProveedores = async () => {
    if (!token) return;

    try {
      const cid = comercioId ?? localStorage.getItem("comercioId");
      const url = cid
        ? `${API_BASE_URL}/proveedores?comercioId=${cid}`
        : `${API_BASE_URL}/proveedores`;
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Error en la solicitud:", response.status, response.statusText);
        setProveedores([]);
        return;
      }

      const text = await response.text();
      const data: Proveedor[] = text ? JSON.parse(text) : [];
      setProveedores(data);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      setProveedores([]);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, [token]);

  // ===== Filtrado =====
  const proveedoresFiltrados = proveedores.filter(
    (proveedor) =>
      proveedor.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.contacto.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.tipo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ===== Abrir formulario =====
  const abrirFormulario = (proveedor?: Proveedor) => {
    if (proveedor) {
      setProveedorEdit(proveedor);
      setFormData({ ...proveedor });
    } else {
      setProveedorEdit(null);
      setFormData({
        nombre: "",
        contacto: "",
        telefono: "",
        email: "",
        direccion: "",
        tipo: "Cosméticos",
        estado: "Activo",
      });
    }
    setMostrarFormulario(true);
  };

  // ===== Guardar proveedor =====
  const guardarProveedor = async () => {
    if (!token) return;

    try {
      const metodo = proveedorEdit ? "PUT" : "POST";
      const url = proveedorEdit
        ? `${API_BASE_URL}/proveedores/${proveedorEdit.id}`
        : `${API_BASE_URL}/proveedores`;

      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          productos: proveedorEdit?.productos || [],
          comercioId: (comercioId ?? Number(localStorage.getItem("comercioId"))) || null,
        }),
      });

      if (!response.ok) throw new Error("Error guardando proveedor");

      await fetchProveedores();
      setMostrarFormulario(false);
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el proveedor");
    }
  };

  // ===== Eliminar proveedor =====
  const eliminarProveedor = async (id: string) => {
    if (!token) return;
    if (!confirm("¿Está seguro de eliminar este proveedor?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error eliminando proveedor");

      setProveedores(proveedores.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el proveedor");
    }
  };

  // ===== Handlers de formulario =====
  const handleBusquedaChange = (event: ChangeEvent<HTMLInputElement>) =>
    setBusqueda(event.target.value);

  const handleFormChange =
    (field: keyof typeof formData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));

  const handleTipoChange = (event: ChangeEvent<HTMLSelectElement>) =>
    setFormData((prev) => ({ ...prev, tipo: event.target.value as any }));

  const handleEstadoChange = (event: ChangeEvent<HTMLSelectElement>) =>
    setFormData((prev) => ({ ...prev, estado: event.target.value as any }));

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">Gestión de Proveedores</h1>
              <p className="welcome-date">Administre los proveedores de su negocio</p>
              <button onClick={() => abrirFormulario()} className="btn-primary compact">
                <FiPlus style={{ marginRight: "8px" }} /> Nuevo Proveedor
              </button>
            </div>
          </div>
        </header>

        <section className="stats-section">
          <div className="search-container">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar proveedores..."
                value={busqueda}
                onChange={handleBusquedaChange}
                className="search-input"
              />
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="suppliers-grid">
            {proveedoresFiltrados.map((proveedor) => (
              <div key={proveedor.id} className="supplier-card">
                <div className="supplier-header">
                  <div>
                    <h3>{proveedor.nombre}</h3>
                    <span className={`type-badge type-${proveedor.tipo.toLowerCase()}`}>
                      {proveedor.tipo}
                    </span>
                  </div>
                  <span className={`status-badge status-${proveedor.estado.toLowerCase()}`}>
                    {proveedor.estado}
                  </span>
                </div>
                <div className="supplier-info">
                  <div className="info-item">
                    <FiPhone className="info-icon" /> <span>{proveedor.telefono}</span>
                  </div>
                  <div className="info-item">
                    <FiMail className="info-icon" /> <span>{proveedor.email}</span>
                  </div>
                  <div className="info-item">
                    <FiMapPin className="info-icon" /> <span>{proveedor.direccion}</span>
                  </div>
                  <div className="info-item">
                    <strong>Contacto: </strong> <span>{proveedor.contacto}</span>
                  </div>
                </div>
                <div className="supplier-products">
                  <strong>Productos: </strong>
                  <div className="product-tags">
                    {proveedor.productos.map((producto, index) => (
                      <span key={index} className="product-tag">
                        {producto}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="supplier-actions">
                  <button onClick={() => abrirFormulario(proveedor)} className="btn-secondary">
                    <FiEdit />
                  </button>
                  <button onClick={() => eliminarProveedor(proveedor.id)} className="btn-danger">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {mostrarFormulario && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>{proveedorEdit ? "Editar Proveedor" : "Nuevo Proveedor"}</h3>
                <button onClick={() => setMostrarFormulario(false)} className="close-button">
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre del Proveedor</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={handleFormChange("nombre")}
                      className="form-input"
                      placeholder="Ej: Distribuidora Beauty"
                    />
                  </div>
                  <div className="form-group">
                    <label>Persona de Contacto</label>
                    <input
                      type="text"
                      value={formData.contacto}
                      onChange={handleFormChange("contacto")}
                      className="form-input"
                      placeholder="Ej: María González"
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={handleFormChange("telefono")}
                      className="form-input"
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange("email")}
                      className="form-input"
                      placeholder="ejemplo@proveedor.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Dirección</label>
                    <textarea
                      value={formData.direccion}
                      onChange={handleFormChange("direccion")}
                      className="form-input"
                      placeholder="Dirección completa"
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo</label>
                    <select value={formData.tipo} onChange={handleTipoChange} className="form-input">
                      <option value="Cosméticos">Cosméticos</option>
                      <option value="Farmacéutico">Farmacéutico</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select value={formData.estado} onChange={handleEstadoChange} className="form-input">
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setMostrarFormulario(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button
                  onClick={guardarProveedor}
                  className="btn-primary"
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

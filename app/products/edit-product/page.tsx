"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import axios from "axios";
import { useParams } from "next/navigation";

interface Producto {
  id: number;
  nombre: string;
  referencia: string;
  precioCompra: number;
  precioVenta: number;
  iva: number;
  categoria: string;
  marca: string;
  almacenamiento: string;
  estado: "Activo" | "Inactivo";
  stock: number;
  stockMinimo: number;
  proveedor: string;
  descripcion: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ModificarProductoPage() {
  const { user } = useAuth();
  const params = useParams() as { id: string };
  const id = params.id;
  const productoId = Number(id);

  const [activeMenu, setActiveMenu] = useState<string | null>("Productos");
  const [formData, setFormData] = useState<Producto | null>(null);

  useEffect(() => {
    if (productoId) {
      axios
        .get(`${API_BASE_URL}/productos/${productoId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => setFormData(res.data))
        .catch((err) => {
          console.error("Error cargando producto:", err);
          alert("No se pudo cargar el producto");
        });
    }
  }, [productoId]);

  const handleFormChange =
    (field: keyof Producto) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const value = event.target.value;
      setFormData((prev) =>
        prev
          ? {
              ...prev,
              [field]:
                field.includes("precio") ||
                field.includes("iva") ||
                field.includes("stock")
                  ? Number(value)
                  : value,
            }
          : prev
      );
    };

  const handleEstadoChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) =>
      prev ? { ...prev, estado: event.target.value as "Activo" | "Inactivo" } : prev
    );
  };

  const actualizarProducto = () => {
    if (!formData) return;

    if (!formData.nombre || !formData.referencia || !formData.categoria) {
      alert("Por favor complete los campos obligatorios");
      return;
    }

    if (formData.precioVenta <= formData.precioCompra) {
      alert("El precio de venta debe ser mayor al precio de compra");
      return;
    }

    axios
      .put(`${API_BASE_URL}/productos/${formData.id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(() => {
        alert(`Producto "${formData.nombre}" actualizado exitosamente`);
      })
      .catch((err) => {
        console.error("Error al actualizar producto:", err);
        alert("Hubo un error al actualizar el producto");
      });
  };

  const volverAlListado = () => {
    if (
      confirm(
        "¿Está seguro de que desea volver? Los cambios no guardados se perderán."
      )
    ) {
      window.history.back();
    }
  };

  if (!formData) return <p>Cargando producto...</p>;

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />

      <main className="dashboard-main">
        {/* 🔹 Encabezado */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">Modificar Producto</h1>
              <p className="welcome-date">
                Actualice la información del producto seleccionado
              </p>
            </div>
            <button onClick={volverAlListado} className="btn-secondary">
              <FiArrowLeft style={{ marginRight: "8px" }} />
              Volver al Listado
            </button>
          </div>
        </header>

        {/* 🔹 Contenido principal */}
        <section className="content-section">
          <div className="content-card">
            <div className="card-header">
              <h3>Editando: {formData.nombre}</h3>
              <span className="form-subtitle">
                Referencia: {formData.referencia} | ID: {formData.id}
              </span>
            </div>

            <div className="form-container">
              {/* Ejemplo de inputs */}
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={handleFormChange("nombre")}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Referencia</label>
                <input
                  type="text"
                  value={formData.referencia}
                  onChange={handleFormChange("referencia")}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Precio Compra</label>
                <input
                  type="number"
                  value={formData.precioCompra}
                  onChange={handleFormChange("precioCompra")}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Precio Venta</label>
                <input
                  type="number"
                  value={formData.precioVenta}
                  onChange={handleFormChange("precioVenta")}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select
                  value={formData.estado}
                  onChange={handleEstadoChange}
                  className="form-input"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              {/* Campo de descripción */}
              <div className="form-group full-width">
                <label>Descripción / Observaciones</label>
                <textarea
                  value={formData.descripcion}
                  onChange={handleFormChange("descripcion")}
                  className="form-input"
                  placeholder="Ingrese observaciones adicionales sobre el producto..."
                  rows={3}
                />
              </div>

              {/* Info de auditoría */}
              <div className="audit-info">
                <h4>Información de Auditoría</h4>
                <div className="audit-grid">
                  <div className="audit-item">
                    <strong>ID del Producto:</strong>
                    <span>{formData.id}</span>
                  </div>
                  <div className="audit-item">
                    <strong>Última Actualización:</strong>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="audit-item">
                    <strong>Usuario:</strong>
                    <span>{user || "Administrador"}</span>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="form-actions">
                <button onClick={volverAlListado} className="btn-secondary">
                  Cancelar
                </button>
                <button
                  onClick={actualizarProducto}
                  className="btn-primary large"
                  disabled={
                    !formData.nombre ||
                    !formData.referencia ||
                    !formData.categoria ||
                    formData.precioCompra <= 0
                  }
                >
                  <FiSave style={{ marginRight: "8px" }} />
                  Actualizar Producto
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

"use client";
import React, { useState, ChangeEvent } from "react";
import { useAuth } from "../../context/AuthContext"; 
import { FiSave } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";

interface Producto {
  id: string;
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
}

export default function AgregarProductoPage() {
  const { user, token } = useAuth(); // token necesario para enviar al backend
  const [activeMenu, setActiveMenu] = useState<string | null>("Productos");

  const [formData, setFormData] = useState<Omit<Producto, "id">>({
    nombre: "",
    referencia: "",
    precioCompra: 0,
    precioVenta: 0,
    iva: 19,
    categoria: "",
    marca: "",
    almacenamiento: "",
    estado: "Activo",
    stock: 0,
    stockMinimo: 5,
    proveedor: "",
  });

  const categorias = [
    "Medicamentos",
    "Cuidado Personal",
    "Cosméticos",
    "Maquillaje",
    "Suplementos",
    "Cuidado Capilar",
    "Higiene",
    "Accesorios",
  ];

  const marcas = [
    "Nivea",
    "L'Oréal",
    "Dove",
    "Head & Shoulders",
    "MAC",
    "Maybelline",
    "Bayer",
    "Pfizer",
    "Genérico",
  ];

  const condicionesAlmacenamiento = [
    "Temperatura ambiente",
    "Refrigerado (2-8°C)",
    "Protegido de la luz",
    "Ambiente seco",
    "Congelado",
  ];

  const proveedores = [
    "Distribuidora Beauty",
    "Farmacéutica Central",
    "Proveedor Salud",
    "Mayorista Cosmetic",
  ];

  const handleFormChange =
    (field: keyof Omit<Producto, "id">) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]:
          field.includes("precio") || field.includes("iva") || field.includes("stock")
            ? Number(value)
            : value,
      }));
    };

  const handleEstadoChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      estado: event.target.value as "Activo" | "Inactivo",
    }));
  };

  const calcularPrecioVenta = (precioCompra: number) => {
    const precioConIva = precioCompra * (1 + formData.iva / 100);
    const margen = precioConIva * 0.3; // 30% de margen
    return precioConIva + margen;
  };

  const handlePrecioCompraChange = (event: ChangeEvent<HTMLInputElement>) => {
    const precioCompra = Number(event.target.value);
    setFormData((prev) => ({
      ...prev,
      precioCompra,
      precioVenta: calcularPrecioVenta(precioCompra),
    }));
  };

  const guardarProducto = async () => {
    // Validaciones básicas
    if (!formData.nombre || !formData.referencia || !formData.categoria) {
      alert("Por favor complete los campos obligatorios");
      return;
    }

    if (formData.precioCompra <= 0 || formData.precioVenta <= 0) {
      alert("Los precios deben ser mayores a cero");
      return;
    }

    if (formData.precioVenta <= formData.precioCompra) {
      alert("El precio de venta debe ser mayor al precio de compra");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // importante enviar el token JWT
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el producto");
      }

      const nuevoProducto = await response.json();

      alert(`Producto "${nuevoProducto.nombre}" guardado exitosamente`);
      console.log("Producto guardado en backend:", nuevoProducto);

      // Resetear formulario
      setFormData({
        nombre: "",
        referencia: "",
        precioCompra: 0,
        precioVenta: 0,
        iva: 19,
        categoria: "",
        marca: "",
        almacenamiento: "",
        estado: "Activo",
        stock: 0,
        stockMinimo: 5,
        proveedor: "",
      });
    } catch (error) {
      console.error(error);
      alert("Hubo un error al guardar el producto");
    }
  };

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />

      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">Agregar Producto</h1>
              <p className="welcome-date">Registre nuevos productos en el inventario</p>
            </div>
          </div>
        </header>

        {/* Formulario de producto */}
        <section className="content-section">
          <div className="content-card">
            <div className="card-header">
              <h3>Información del Producto</h3>
              <span className="form-subtitle">Complete todos los campos requeridos</span>
            </div>

            <div className="form-container">
              <div className="form-grid">
                {/* Nombre */}
                <div className="form-group">
                  <label>Nombre del Producto *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={handleFormChange("nombre")}
                    className="form-input"
                    placeholder="Ej: Crema Hidratante Nivea"
                  />
                </div>
                {/* Referencia */}
                <div className="form-group">
                  <label>Referencia *</label>
                  <input
                    type="text"
                    value={formData.referencia}
                    onChange={handleFormChange("referencia")}
                    className="form-input"
                    placeholder="Ej: NIV-CREM-001"
                  />
                </div>
                {/* Categoría */}
                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    value={formData.categoria}
                    onChange={handleFormChange("categoria")}
                    className="form-input"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Marca */}
                <div className="form-group">
                  <label>Marca</label>
                  <select
                    value={formData.marca}
                    onChange={handleFormChange("marca")}
                    className="form-input"
                  >
                    <option value="">Seleccionar marca</option>
                    {marcas.map((marca) => (
                      <option key={marca} value={marca}>
                        {marca}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Precio compra */}
                <div className="form-group">
                  <label>Precio de Compra *</label>
                  <input
                    type="number"
                    value={formData.precioCompra}
                    onChange={handlePrecioCompraChange}
                    className="form-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                {/* IVA */}
                <div className="form-group">
                  <label>IVA (%) *</label>
                  <input
                    type="number"
                    value={formData.iva}
                    onChange={handleFormChange("iva")}
                    className="form-input"
                    placeholder="19"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                {/* Precio venta */}
                <div className="form-group">
                  <label>Precio de Venta *</label>
                  <input
                    type="number"
                    value={formData.precioVenta.toFixed(2)}
                    onChange={handleFormChange("precioVenta")}
                    className="form-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Stock inicial */}
                <div className="form-group">
                  <label>Stock Inicial</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={handleFormChange("stock")}
                    className="form-input"
                    placeholder="0"
                    min="0"
                  />
                </div>
                {/* Stock mínimo */}
                <div className="form-group">
                  <label>Stock Mínimo</label>
                  <input
                    type="number"
                    value={formData.stockMinimo}
                    onChange={handleFormChange("stockMinimo")}
                    className="form-input"
                    placeholder="5"
                    min="0"
                  />
                </div>

                {/* Proveedor */}
                <div className="form-group">
                  <label>Proveedor</label>
                  <select
                    value={formData.proveedor}
                    onChange={handleFormChange("proveedor")}
                    className="form-input"
                  >
                    <option value="">Seleccionar proveedor</option>
                    {proveedores.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condiciones de almacenamiento */}
                <div className="form-group">
                  <label>Condiciones de Almacenamiento</label>
                  <select
                    value={formData.almacenamiento}
                    onChange={handleFormChange("almacenamiento")}
                    className="form-input"
                  >
                    <option value="">Seleccionar condición</option>
                    {condicionesAlmacenamiento.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estado */}
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
              </div>

              {/* Resumen de precios */}
              <div className="price-summary">
                <h4>Resumen de Precios</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span>Precio Compra:</span>
                    <span>${formData.precioCompra.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span>IVA:</span>
                    <span>{formData.iva}%</span>
                  </div>
                  <div className="summary-item">
                    <span>Valor IVA:</span>
                    <span>${(formData.precioCompra * formData.iva / 100).toFixed(2)}</span>
                  </div>
                  <div className="summary-item total">
                    <span>Precio Venta:</span>
                    <span>${formData.precioVenta.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="form-actions">
                <button
                  onClick={() =>
                    setFormData({
                      nombre: "",
                      referencia: "",
                      precioCompra: 0,
                      precioVenta: 0,
                      iva: 19,
                      categoria: "",
                      marca: "",
                      almacenamiento: "",
                      estado: "Activo",
                      stock: 0,
                      stockMinimo: 5,
                      proveedor: "",
                    })
                  }
                  className="btn-secondary"
                >
                  Limpiar Formulario
                </button>
                <button
                  onClick={guardarProducto}
                  className="btn-primary large"
                  disabled={
                    !formData.nombre ||
                    !formData.referencia ||
                    !formData.categoria ||
                    formData.precioCompra <= 0
                  }
                >
                  <FiSave style={{ marginRight: "8px" }} />
                  Guardar Producto
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

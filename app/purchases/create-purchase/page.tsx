"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FiPlus, FiTrash2, FiSave } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precioCompra: number;
  precioVenta: number;
  stock: number; // <--- ahora coincide con tu entidad
  stockMinimo: number;
  iva: number;
}

interface Proveedor {
  id: number;
  nombre: string;
}

interface ItemCompra {
  id: string;
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

export default function RealizarCompraPage() {
  const { token: authToken } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>("Compras");

  const [numeroFactura, setNumeroFactura] = useState("");
  const [proveedor, setProveedor] = useState(""); // guardaremos id como string
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<ItemCompra[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ===== Obtener token válido =====
  const getToken = () => authToken || localStorage.getItem("token");

  // ===== Fetch productos y proveedores =====
  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const [prodRes, provRes] = await Promise.all([
          fetch(`${API_BASE_URL}/productos`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }),
          fetch(`${API_BASE_URL}/proveedores`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }),
        ]);

        if (!prodRes.ok) throw new Error(`Error al cargar productos: ${prodRes.status}`);
        if (!provRes.ok) throw new Error(`Error al cargar proveedores: ${provRes.status}`);

        const productosData: Producto[] = await prodRes.json();
        const proveedoresData: Proveedor[] = await provRes.json();

        setProductos(productosData);
        setProveedores(proveedoresData);
      } catch (error: any) {
        console.error("Error cargando datos:", error.message || error);
        alert(`No se pudieron cargar los datos: ${error.message || error}`);
      }
    };
    fetchData();
  }, [API_BASE_URL, authToken]);

  // ===== Agregar / eliminar productos =====
  const agregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) return;

    const subtotal = (productoSeleccionado.precioCompra + (productoSeleccionado.precioCompra * productoSeleccionado.iva) / 100) * cantidad;

    const nuevoItem: ItemCompra = {
      id: Date.now().toString(),
      producto: { ...productoSeleccionado },
      cantidad,
      subtotal,
    };

    setItems([...items, nuevoItem]);
    setProductoSeleccionado(null);
    setCantidad(1);
  };

  const eliminarItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // ===== Calcular totales =====
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalIVA = items.reduce((sum, item) => sum + (item.producto.iva / 100) * item.producto.precioCompra * item.cantidad, 0);
  const total = subtotal;

  // ===== Guardar compra =====
  const guardarCompra = async () => {
    if (!numeroFactura || !proveedor || items.length === 0) {
      alert("Complete todos los campos");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("No hay token de autorización");
      return;
    }

    try {
      const compraDTO = {
        numeroFactura,
        proveedorId: proveedor, 
        fechaCompra,
        subtotal,
        iva: Math.round(totalIVA),
        total,
        estado: "Pendiente",
        items: items.map((item) => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
          precioUnitario: item.producto.precioCompra,
        })),
      };

      const res = await fetch(`${API_BASE_URL}/compras`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(compraDTO),
      });

      if (!res.ok) throw new Error(`Error al guardar la compra: ${res.status}`);

      alert("Compra guardada exitosamente");
      setItems([]);
      setNumeroFactura("");
      setProveedor("");
    } catch (error: any) {
      console.error(error);
      alert(`Hubo un error al guardar la compra: ${error.message}`);
    }
  };

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">Realizar Compra</h1>
              <p className="welcome-date">Gestión de compras de inventario</p>
            </div>
          </div>
        </header>

        <section className="content-section">
          <div className="content-grid" style={{ gridTemplateColumns: "1fr 400px" }}>
            {/* Detalles de compra */}
            <div className="content-card">
              <div className="card-header"><h3>Detalles de la Compra</h3></div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Número de Factura</label>
                  <input type="text" value={numeroFactura} onChange={(e) => setNumeroFactura(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Proveedor</label>
                  <select value={proveedor} onChange={(e) => setProveedor(e.target.value)} className="form-input">
                    <option value="">Seleccionar proveedor</option>
                    {proveedores.map((prov) => (
                      <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha de Compra</label>
                  <input type="date" value={fechaCompra} onChange={(e) => setFechaCompra(e.target.value)} className="form-input" />
                </div>
              </div>

              {/* Agregar productos */}
              <div className="add-product-section">
                <h4>Agregar Productos</h4>
                <div className="add-product-form">
                  <div className="form-group">
                    <label>Producto</label>
                    <select value={productoSeleccionado?.id || ""} onChange={(e) => {
                      const prod = productos.find(p => p.id === parseInt(e.target.value));
                      setProductoSeleccionado(prod || null);
                    }} className="form-input">
                      <option value="">Seleccionar producto</option>
                      {productos.map((prod) => (
                        <option key={prod.id} value={prod.id}>{prod.nombre} - ${prod.precioCompra.toFixed(2)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Cantidad</label>
                    <input type="number" min={1} value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value) || 1)} className="form-input" />
                  </div>
                  <button onClick={agregarProducto} className="btn-primary" disabled={!productoSeleccionado}>
                    <FiPlus style={{ marginRight: "8px" }} /> Agregar Producto
                  </button>
                </div>
              </div>

              {/* Lista de productos */}
              {items.length > 0 && (
                <div className="products-list">
                  <h4>Productos en la Compra</h4>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio Compra</th>
                          <th>IVA</th>
                          <th>Subtotal</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td>{item.producto.nombre}</td>
                            <td>{item.cantidad}</td>
                            <td>${item.producto.precioCompra.toFixed(2)}</td>
                            <td>{item.producto.iva}%</td>
                            <td>${item.subtotal.toFixed(2)}</td>
                            <td>
                              <button onClick={() => eliminarItem(item.id)} className="btn-danger"><FiTrash2 /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Resumen de compra */}
            <div className="content-card">
              <div className="card-header"><h3>Resumen de Compra</h3></div>
              <div className="summary-details">
                <div className="summary-row"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="summary-row"><span>IVA:</span><span>${totalIVA.toFixed(2)}</span></div>
                <div className="summary-row total"><span>Total:</span><span>${total.toFixed(2)}</span></div>
                <div className="summary-actions">
                  <button onClick={guardarCompra} className="btn-primary large" disabled={items.length === 0 || !proveedor || !numeroFactura}>
                    <FiSave style={{ marginRight: "8px" }} /> Guardar Compra
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

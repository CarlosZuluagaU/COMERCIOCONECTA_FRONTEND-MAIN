"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FiPlus, FiTrash2, FiSave, FiShoppingCart } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import "./create-purchase.css";

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
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
  const { token: authToken, comercioId } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>("Compras");

  const [numeroFactura, setNumeroFactura] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<ItemCompra[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [saving, setSaving] = useState(false);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const getToken = () => authToken || localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const cid = comercioId ?? localStorage.getItem("comercioId");
        const provUrl = cid ? `${API_BASE_URL}/proveedores?comercioId=${cid}` : `${API_BASE_URL}/proveedores`;
        const [prodRes, provRes] = await Promise.all([
          fetch(`${API_BASE_URL}/productos`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(provUrl,                      { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setProductos(prodRes.ok ? await prodRes.json() : []);
        setProveedores(provRes.ok ? await provRes.json() : []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [API_BASE_URL, authToken]);

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) return;
    const subtotal = (productoSeleccionado.precioCompra + (productoSeleccionado.precioCompra * productoSeleccionado.iva) / 100) * cantidad;
    setItems(prev => [...prev, { id: Date.now().toString(), producto: { ...productoSeleccionado }, cantidad, subtotal }]);
    setProductoSeleccionado(null);
    setCantidad(1);
  };

  const eliminarItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const subtotal  = items.reduce((s, i) => s + i.subtotal, 0);
  const totalIVA  = items.reduce((s, i) => s + (i.producto.iva / 100) * i.producto.precioCompra * i.cantidad, 0);
  const total     = subtotal;

  const guardarCompra = async () => {
    if (!numeroFactura || !proveedor || items.length === 0) {
      alert("Complete todos los campos y agrega al menos un producto");
      return;
    }
    const token = getToken();
    if (!token) { alert("No hay sesión activa"); return; }

    setSaving(true);
    try {
      const cid = (comercioId ?? Number(localStorage.getItem("comercioId"))) || null;
      const res = await fetch(`${API_BASE_URL}/compras`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          numeroFactura,
          proveedorId: proveedor,
          comercioId: cid,
          fechaCompra,
          subtotal,
          iva: Math.round(totalIVA),
          total,
          estado: "Pendiente",
          items: items.map(i => ({
            productoId: i.producto.id,
            cantidad: i.cantidad,
            precioUnitario: i.producto.precioCompra,
          })),
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      alert("✅ Compra registrada exitosamente");
      setItems([]);
      setNumeroFactura("");
      setProveedor("");
    } catch (e: any) {
      alert(`Error al guardar la compra: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const canSave = !!numeroFactura && !!proveedor && items.length > 0;

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">

        {/* Header */}
        <header className="cp-header">
          <div>
            <h1>🛒 Realizar Compra</h1>
            <p>Registro de compras de inventario</p>
          </div>
        </header>

        <div className="cp-layout">

          {/* ── Columna principal ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Datos de la compra */}
            <div className="cp-card">
              <div className="cp-card-title">📋 Detalles de la Compra</div>
              <div className="cp-card-body">
                <div className="cp-fields">
                  <div className="cp-field">
                    <label>N° de Factura</label>
                    <input
                      className="cp-input"
                      placeholder="Ej: FAC-001"
                      value={numeroFactura}
                      onChange={e => setNumeroFactura(e.target.value)}
                    />
                  </div>
                  <div className="cp-field">
                    <label>Proveedor</label>
                    <select className="cp-input" value={proveedor} onChange={e => setProveedor(e.target.value)}>
                      <option value="">Seleccionar proveedor</option>
                      {proveedores.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="cp-field">
                    <label>Fecha de Compra</label>
                    <input
                      type="date"
                      className="cp-input"
                      value={fechaCompra}
                      onChange={e => setFechaCompra(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Agregar productos */}
            <div className="cp-card">
              <div className="cp-card-title">📦 Agregar Productos</div>
              <div className="cp-card-body">
                <div className="cp-add-section">
                  <div className="cp-add-row">
                    <div className="cp-field">
                      <label>Producto</label>
                      <select
                        className="cp-input"
                        value={productoSeleccionado?.id || ""}
                        onChange={e => setProductoSeleccionado(productos.find(p => p.id === Number(e.target.value)) || null)}
                      >
                        <option value="">Seleccionar producto</option>
                        {productos.map(p => (
                          <option key={p.id} value={p.id}>{p.nombre} — ${p.precioCompra.toLocaleString()}</option>
                        ))}
                      </select>
                    </div>
                    <div className="cp-field">
                      <label>Cantidad</label>
                      <input
                        type="number"
                        min={1}
                        className="cp-input"
                        value={cantidad}
                        onChange={e => setCantidad(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <button
                      className="cp-btn-add"
                      onClick={agregarProducto}
                      disabled={!productoSeleccionado}
                      style={{ marginTop: 22 }}
                    >
                      <FiPlus /> Agregar
                    </button>
                  </div>
                </div>

                {items.length > 0 ? (
                  <>
                    <p className="cp-items-title">Productos en la compra ({items.length})</p>
                    <div className="cp-table-wrap">
                      <table className="cp-table">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cant.</th>
                            <th>P. Compra</th>
                            <th>IVA</th>
                            <th>Subtotal</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(item => (
                            <tr key={item.id}>
                              <td><strong>{item.producto.nombre}</strong></td>
                              <td>{item.cantidad}</td>
                              <td>${item.producto.precioCompra.toLocaleString()}</td>
                              <td>{item.producto.iva}%</td>
                              <td><strong>${item.subtotal.toLocaleString()}</strong></td>
                              <td>
                                <button className="cp-btn-del" onClick={() => eliminarItem(item.id)}>
                                  <FiTrash2 />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="cp-empty-hint">
                    📦 Aún no has agregado productos a esta compra
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Columna resumen ── */}
          <div className="cp-card" style={{ position: "sticky", top: 20 }}>
            <div className="cp-card-title">💰 Resumen de Compra</div>
            <div className="cp-card-body">
              <div className="cp-summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="cp-summary-row">
                <span>IVA estimado</span>
                <span>${totalIVA.toLocaleString()}</span>
              </div>
              <div className="cp-summary-total">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <button
                className="cp-btn-save"
                onClick={guardarCompra}
                disabled={!canSave || saving}
              >
                <FiSave /> {saving ? "Guardando…" : "Guardar Compra"}
              </button>
              {!canSave && (
                <p style={{ fontSize: ".76rem", color: "#aaa", textAlign: "center", marginTop: 10 }}>
                  Completa factura, proveedor y al menos un producto
                </p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

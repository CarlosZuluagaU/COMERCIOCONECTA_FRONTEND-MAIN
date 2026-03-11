"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import { FiPlus, FiTrash2, FiSave } from "react-icons/fi";
import "./create.css";

interface Cliente {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  correo: string;
  telefono: string;
  direccion?: string;
}

interface Producto {
  id: number;
  nombre: string;
  referencia: string;
  precioCompra: number;
  precioVenta: number;
  iva: number;
  categoria: string;
  marca?: string;
  almacenamiento?: string;
  estado: string;
  stock: number;
  stockMinimo: number;
  proveedor?: string;
  descripcion?: string;
}

interface ItemVenta {
  id?: string;
  codigoProducto: string;
  nombre: string;
  cantidad: number;
  precioSinImpuestos: number;
  precioTotal: number;
  porcentajeIva: number;
}

export default function CrearVentaPage() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [activeMenu, setActiveMenu] = useState<string | null>("Ventas");

  // Estados para cargar datos
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);

  // Campos del cliente (se mantienen igual)
  const [numeroDocumentoCliente, setDocumento] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");

  // Campos de venta (se mantienen igual)
  const [nota, setNota] = useState("");
  const [referencia, setReferencia] = useState("");

  // Items (se mantienen igual)
  const [items, setItems] = useState<ItemVenta[]>([]);
  const [itemActual, setItemActual] = useState<ItemVenta>({
    codigoProducto: "",
    nombre: "",
    cantidad: 1,
    precioSinImpuestos: 0,
    precioTotal: 0,
    porcentajeIva: 19,
  });

  // 🔹 Cargar clientes desde la base de datos
  useEffect(() => {
    if (!API) return;
    
    setLoadingClientes(true);
    fetch(`${API}/clientes`)
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar clientes");
        return res.json();
      })
      .then((data: Cliente[]) => {
        setClientes(data);
        setLoadingClientes(false);
      })
      .catch(err => {
        console.error("Error cargando clientes:", err);
        setLoadingClientes(false);
      });
  }, [API]);

  //  Cargar productos desde la base de datos
  useEffect(() => {
    if (!API) return;
    
    setLoadingProductos(true);
    fetch(`${API}/productos`)
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then((data: Producto[]) => {
        setProductos(data);
        setLoadingProductos(false);
      })
      .catch(err => {
        console.error("Error cargando productos:", err);
        setLoadingProductos(false);
      });
  }, [API]);

  //  Cuando se escribe el documento, buscar y autocompletar cliente
  const handleDocumentoChange = (doc: string) => {
    setDocumento(doc);
    
    if (doc.trim() && clientes.length > 0) {
      const clienteEncontrado = clientes.find(c => 
        c.numeroDocumento.includes(doc)
      );
      
      if (clienteEncontrado) {
        setNombreCliente(clienteEncontrado.nombres);
        setEmailCliente(clienteEncontrado.correo || "");
        setTelefonoCliente(clienteEncontrado.telefono || "");
      }
    }
  };

  // 🔹 Cuando se escribe el código del producto, buscar y autocompletar
  const handleCodigoProductoChange = (codigo: string) => {
    setItemActual({...itemActual, codigoProducto: codigo});
    
    if (codigo.trim() && productos.length > 0) {
      const productoEncontrado = productos.find(p => 
        p.referencia.toLowerCase().includes(codigo.toLowerCase())
      );
      
      if (productoEncontrado) {
        setItemActual(prev => ({
          ...prev,
          nombre: productoEncontrado.nombre,
          precioSinImpuestos: productoEncontrado.precioVenta,
          porcentajeIva: productoEncontrado.iva
        }));
      }
    }
  };

  // 🔹 Cuando se escribe el nombre del producto, buscar y autocompletar
  const handleNombreProductoChange = (nombre: string) => {
    setItemActual({...itemActual, nombre: nombre});
    
    if (nombre.trim() && productos.length > 0) {
      const productoEncontrado = productos.find(p => 
        p.nombre.toLowerCase().includes(nombre.toLowerCase())
      );
      
      if (productoEncontrado) {
        setItemActual(prev => ({
          ...prev,
          codigoProducto: productoEncontrado.referencia,
          precioSinImpuestos: productoEncontrado.precioVenta,
          porcentajeIva: productoEncontrado.iva
        }));
      }
    }
  };

  // Las funciones restantes se mantienen EXACTAMENTE igual
  const agregarItem = () => {
    if (!itemActual.codigoProducto || !itemActual.nombre) return;

    const totalItem =
      itemActual.precioSinImpuestos * itemActual.cantidad +
      itemActual.precioSinImpuestos *
        itemActual.cantidad *
        (itemActual.porcentajeIva / 100);

    const nuevo: ItemVenta = {
      ...itemActual,
      id: Date.now().toString(),
      precioTotal: totalItem,
    };

    setItems([...items, nuevo]);

    setItemActual({
      codigoProducto: "",
      nombre: "",
      cantidad: 1,
      precioSinImpuestos: 0,
      precioTotal: 0,
      porcentajeIva: 19,
    });
  };

  const eliminarItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((s, i) => s + i.precioSinImpuestos * i.cantidad, 0);
  const totalIva = items.reduce(
    (s, i) => s + (i.precioSinImpuestos * i.cantidad * i.porcentajeIva) / 100,
    0
  );
  const totalFactura = subtotal + totalIva;

  const guardarVenta = async () => {
    if (!numeroDocumentoCliente || !nombreCliente || items.length === 0) {
      alert("Campos incompletos");
      return;
    }

    const itemsParaEnviar = items.map(({ id, ...rest }) => rest);

    const venta = {
      numeroDocumentoCliente,
      nombreCliente,
      dvCliente: "1",
      emailCliente,
      telefonoCliente,
      subtotal,
      totalIva,
      totalFactura,
      nota,
      referencia,
      paymentMethodCode: 10,
      legalOrganizationId: 2,
      tributeId: 21,
      identificationDocumentId: 3,
      municipalityId: 980,
      establecimientoNombre: "SuperMarket",
      establecimientoDireccion: "calle 10 # 3-13",
      establecimientoTelefono: "0987654321",
      establecimientoEmail: "supermarket@gmail.com",
      establecimientoMunicipioId: 980,
      estado: "CREATED",
      items: itemsParaEnviar,
    };

    try {
      const res = await fetch(`${API}/ventas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(venta),
      });

      if (!res.ok) throw new Error(await res.text());
      alert("Venta creada");

      window.location.href = "/sales";
    } catch (err: any) {
      alert("Error al crear venta: " + err.message);
    }
  };

  return (
    <div className="dashboard-page crear-venta-container">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />

      <main className="dashboard-main">
        <header className="dashboard-header venta-header">
          <h1 className="welcome-title">Crear Venta</h1>
        </header>

        <section className="content-section">
          <div className="content-grid venta-content-grid">
            
            {/* Cliente - Solo se cambian los handlers */}
            <div className="content-card venta-card">
              <h3>Datos del Cliente</h3>

              <div className="form-grid">
                <div className="form-group venta-form-group">
                  <label>Documento</label>
                  <input
                    className="form-input venta-form-input"
                    value={numeroDocumentoCliente}
                    onChange={(e) => handleDocumentoChange(e.target.value)}
                    placeholder={loadingClientes ? "Cargando clientes..." : "Ingrese documento"}
                  />
                  {loadingClientes && (
                    <small style={{color: '#666', fontStyle: 'italic'}}>
                      Cargando lista de clientes...
                    </small>
                  )}
                </div>

                <div className="form-group venta-form-group">
                  <label>Nombre</label>
                  <input
                    className="form-input venta-form-input"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    placeholder="Nombre completo"
                  />
                </div>

                <div className="form-group venta-form-group">
                  <label>Email</label>
                  <input
                    className="form-input venta-form-input"
                    value={emailCliente}
                    onChange={(e) => setEmailCliente(e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="form-group venta-form-group">
                  <label>Teléfono</label>
                  <input
                    className="form-input venta-form-input"
                    value={telefonoCliente}
                    onChange={(e) => setTelefonoCliente(e.target.value)}
                    placeholder="Teléfono de contacto"
                  />
                </div>
              </div>
            </div>

            {/* Ítems - Solo se cambian los handlers */}
            <div className="content-card venta-card">
              <h3>Items</h3>

              <div className="form-grid">
                <div className="form-group venta-form-group">
                  <label>Código</label>
                  <input
                    className="form-input venta-form-input"
                    value={itemActual.codigoProducto}
                    onChange={(e) => handleCodigoProductoChange(e.target.value)}
                    placeholder={loadingProductos ? "Cargando productos..." : "Ingrese código"}
                  />
                  {loadingProductos && (
                    <small style={{color: '#666', fontStyle: 'italic'}}>
                      Cargando lista de productos...
                    </small>
                  )}
                </div>

                <div className="form-group venta-form-group">
                  <label>Nombre</label>
                  <input
                    className="form-input venta-form-input"
                    value={itemActual.nombre}
                    onChange={(e) => handleNombreProductoChange(e.target.value)}
                    placeholder="Nombre del producto"
                  />
                </div>

                <div className="form-group venta-form-group">
                  <label>Cantidad</label>
                  <input
                    type="number"
                    className="form-input venta-form-input"
                    value={itemActual.cantidad}
                    onChange={(e) =>
                      setItemActual({
                        ...itemActual,
                        cantidad: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="form-group venta-form-group">
                  <label>Precio</label>
                  <input
                    type="number"
                    className="form-input venta-form-input"
                    value={itemActual.precioSinImpuestos}
                    onChange={(e) =>
                      setItemActual({
                        ...itemActual,
                        precioSinImpuestos: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <button className="btn-primary venta-btn-primary" onClick={agregarItem}>
                <FiPlus /> Agregar Item
              </button>

              {items.length > 0 && (
                <table className="data-table venta-table" style={{ marginTop: 20 }}>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Cant</th>
                      <th>Precio</th>
                      <th>IVA</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => (
                      <tr key={i.id}>
                        <td>{i.codigoProducto}</td>
                        <td>{i.nombre}</td>
                        <td>{i.cantidad}</td>
                        <td>${i.precioSinImpuestos}</td>
                        <td>{i.porcentajeIva}%</td>
                        <td>${i.precioTotal.toLocaleString()}</td>
                        <td>
                          <button
                            className="btn-danger venta-btn-danger"
                            onClick={() => eliminarItem(i.id!)}
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Totales - NO SE CAMBIA NADA */}
            <div className="content-card venta-card totales-section">
              <h3>Totales</h3>

              <div className="total-item">
                <span className="total-label">Subtotal:</span>
                <span className="total-value">${subtotal.toLocaleString()}</span>
              </div>
              <div className="total-item">
                <span className="total-label">Total IVA:</span>
                <span className="total-value">${totalIva.toLocaleString()}</span>
              </div>
              <div className="total-item">
                <span className="total-label">Total Factura:</span>
                <span className="total-value">${totalFactura.toLocaleString()}</span>
              </div>

              <button className="btn-primary venta-btn-primary" onClick={guardarVenta} style={{ marginTop: '1.5rem', width: '100%' }}>
                <FiSave style={{ marginRight: 8 }} /> Guardar Venta
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FiPackage } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import "../../dashboard/admin.css";
import "./product-list.css";

interface Producto {
  id: number;
  nombre: string;
  referencia: string;
  precioCompra: number;
  precioVenta: number;
  categoria: string;
  marca?: string;
  estado: string;
  stock: number;
  stockMinimo: number;
  imagenUrl?: string;
}

const CATEGORIAS = [
  "Medicamentos","Cuidado Personal","Cosméticos","Maquillaje",
  "Suplementos","Cuidado Capilar","Higiene","Accesorios",
];

const PAGE_SIZE = 10;

export default function ListadoProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>("Productos");
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [pagina, setPagina] = useState(1);
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/productos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(res => { setProductos(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [API_BASE_URL]);

  const eliminarProducto = (id: number) => {
    if (!confirm("¿Eliminar este producto?")) return;
    axios
      .delete(`${API_BASE_URL}/productos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => setProductos(prev => prev.filter(p => p.id !== id)))
      .catch(() => alert("No se pudo eliminar el producto"));
  };

  const productosFiltrados = productos.filter(p => {
    const q = busqueda.toLowerCase();
    const matchQ = p.nombre.toLowerCase().includes(q) || p.referencia.toLowerCase().includes(q) || (p.marca || "").toLowerCase().includes(q);
    const matchCat = !filtroCategoria || p.categoria === filtroCategoria;
    const matchEst = !filtroEstado || p.estado === filtroEstado;
    return matchQ && matchCat && matchEst;
  });

  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginados = productosFiltrados.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  const stockBadge = (stock: number, min: number) => {
    if (stock <= 0) return { text: "0 und", cls: "pl-badge pl-red" };
    if (stock <= min) return { text: `${stock} und`, cls: "pl-badge pl-yellow" };
    return { text: `${stock} und`, cls: "pl-badge pl-green" };
  };

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">

        <header className="pl-header">
          <h1>📦 Listado de Productos</h1>
          <button className="pl-btn-add" onClick={() => router.push("/products/add-product")}>
            ＋ Agregar Producto
          </button>
        </header>

        <div className="adm-content">

          {/* Filtros */}
          <div className="pl-toolbar">
            <div className="pl-search-wrap">
              <span>🔍</span>
              <input
                className="pl-search-input"
                placeholder="Buscar por nombre, referencia, marca…"
                value={busqueda}
                onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
              />
            </div>
            <select className="pl-sel" value={filtroCategoria} onChange={e => { setFiltroCategoria(e.target.value); setPagina(1); }}>
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="pl-sel" value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPagina(1); }}>
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          {/* Tabla */}
          <div className="pl-table-wrap">
            {loading ? (
              <div className="adm-loading">Cargando productos...</div>
            ) : productosFiltrados.length > 0 ? (
              <>
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Referencia</th>
                      <th>Categoría</th>
                      <th>Precio compra</th>
                      <th>Precio venta</th>
                      <th>Stock</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginados.map(p => {
                      const sb = stockBadge(p.stock, p.stockMinimo);
                      return (
                        <tr key={p.id}>
                          <td>
                            <div className="pl-product-cell">
                              {p.imagenUrl
                                ? <img src={p.imagenUrl} alt={p.nombre} className="pl-thumb" />
                                : <div className="pl-thumb-empty">📦</div>
                              }
                              <strong>{p.nombre}</strong>
                            </div>
                          </td>
                          <td>{p.referencia}</td>
                          <td>{p.categoria}</td>
                          <td>${p.precioCompra.toLocaleString()}</td>
                          <td>${p.precioVenta.toLocaleString()}</td>
                          <td><span className={sb.cls}>{sb.text}</span></td>
                          <td>
                            <span className={`pl-badge ${p.estado === "Activo" ? "pl-green" : "pl-gray"}`}>
                              {p.estado}
                            </span>
                          </td>
                          <td>
                            <div className="pl-actions">
                              <button className="pl-act-btn pl-act-edit" onClick={() => router.push(`/products/edit-product?id=${p.id}`)}>✏️</button>
                              <button className="pl-act-btn pl-act-del" onClick={() => eliminarProducto(p.id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="pl-pagination">
                  <span>Mostrando {paginados.length} de {productosFiltrados.length} productos</span>
                  <div className="pl-page-btns">
                    <button disabled={paginaActual === 1} onClick={() => setPagina(p => p - 1)}>‹</button>
                    {Array.from({ length: totalPaginas }, (_, i) => (
                      <button key={i + 1} className={paginaActual === i + 1 ? "active" : ""} onClick={() => setPagina(i + 1)}>{i + 1}</button>
                    ))}
                    <button disabled={paginaActual === totalPaginas} onClick={() => setPagina(p => p + 1)}>›</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="adm-empty">
                <FiPackage size={48} color="#ccc" />
                <p>No se encontraron productos</p>
                <span>Ajusta los filtros o agrega nuevos productos</span>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

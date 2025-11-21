"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FiEye, FiEdit, FiTrash2, FiPackage } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";

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

export default function ListadoProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>("Productos");
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 🔹 Cargar productos desde el backend
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/productos`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setProductos(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar productos:", err);
        setLoading(false);
      });
  }, [API_BASE_URL]);

  const eliminarProducto = (id: number) => {
    if (confirm("¿Está seguro de eliminar este producto?")) {
      axios
        .delete(`${API_BASE_URL}/productos/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then(() => {
          alert("Producto eliminado");
          setProductos((prev) => prev.filter((p) => p.id !== id));
        })
        .catch((err) => {
          console.error("Error al eliminar producto:", err);
          alert("No se pudo eliminar el producto");
        });
    }
  };

  const editarProducto = (producto: Producto) => {
    router.push(`/productos/${producto.id}`);
  };

  const verDetalle = (producto: Producto) => {
    router.push(`/productos/${producto.id}?view=detalle`);
  };

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />

      <main className="dashboard-main">
        {/* 🔹 Encabezado */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">Listado de Productos</h1>
              <p className="welcome-date">Gestión y control de inventario</p>
            </div>
          </div>
        </header>

        {/* 🔹 Contenido principal */}
        <section className="content-section">
          <div className="content-card">
            <div className="card-header">
              <h3>Productos Registrados ({productos.length})</h3>
            </div>

            <div className="table-container">
              {loading ? (
                <p>Cargando productos...</p>
              ) : productos.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Referencia</th>
                      <th>Precio Venta</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((producto) => (
                      <tr key={producto.id}>
                        <td>{producto.id}</td>
                        <td>{producto.nombre}</td>
                        <td>{producto.referencia}</td>
                        <td>${producto.precioVenta}</td>
                        <td>{producto.stock}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => editarProducto(producto)}
                              className="btn-primary"
                              title="Editar producto"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => eliminarProducto(producto.id)}
                              className="btn-danger"
                              title="Eliminar producto"
                            >
                              <FiTrash2 />
                            </button>
                            <button
                              onClick={() => verDetalle(producto)}
                              className="btn-secondary"
                              title="Ver detalle"
                            >
                              <FiEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <FiPackage size={48} />
                  <p>No se encontraron productos</p>
                  <span>No hay productos registrados en el sistema</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

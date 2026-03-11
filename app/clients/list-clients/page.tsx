"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FiEye, FiEdit, FiTrash2, FiUsers } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";

interface Cliente {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  correo: string;
  telefono: string;
  direccion?: string;
}

export default function ListadoClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>("Clientes");
  const router = useRouter();

  //  Leer la variable de entorno definida en .env.local
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  //  Cargar clientes desde el backend
  useEffect(() => {
    if (!API_BASE_URL) {
      console.error("⚠️ No se encontró NEXT_PUBLIC_API_BASE_URL en las variables de entorno");
      return;
    }

    axios
      .get(`${API_BASE_URL}/clientes`)
      .then((res) => {
        setClientes(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar clientes:", err);
        setLoading(false);
      });
  }, [API_BASE_URL]);

  // 🔹 Eliminar cliente
  const eliminarCliente = (id: number) => {
    if (confirm("¿Está seguro de eliminar este cliente?")) {
      axios
        .delete(`${API_BASE_URL}/clientes/${id}`)
        .then(() => {
          alert("Cliente eliminado correctamente");
          setClientes((prev) => prev.filter((c) => c.id !== id));
        })
        .catch((err) => {
          console.error("Error al eliminar cliente:", err);
          alert("No se pudo eliminar el cliente");
        });
    }
  };

  // 🔹 Editar cliente
  const editarCliente = (cliente: Cliente) => {
    router.push(`/clientes/${cliente.id}/editar`);
  };

  // 🔹 Ver detalle del cliente
  const verDetalle = (cliente: Cliente) => {
    router.push(`/clientes/${cliente.id}`);
  };

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />

      <main className="dashboard-main">
        {/* 🔹 Encabezado */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">Listado de Clientes</h1>
              <p className="welcome-date">Gestión y control de clientes registrados</p>
            </div>
          </div>
        </header>

        {/* 🔹 Contenido principal */}
        <section className="content-section">
          <div className="content-card">
            <div className="card-header">
              <h3>Clientes Registrados ({clientes.length})</h3>
              <button
                onClick={() => router.push("/clientes/registro")}
                className="btn-primary"
              >
                + Nuevo Cliente
              </button>
            </div>

            <div className="table-container">
              {loading ? (
                <p>Cargando clientes...</p>
              ) : clientes.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tipo Doc.</th>
                      <th>Número</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Teléfono</th>
                      <th>Dirección</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((cliente) => (
                      <tr key={cliente.id}>
                        <td>{cliente.id}</td>
                        <td>{cliente.tipoDocumento}</td>
                        <td>{cliente.numeroDocumento}</td>
                        <td>{cliente.nombres}</td>
                        <td>{cliente.correo}</td>
                        <td>{cliente.telefono}</td>
                        <td>{cliente.direccion || "—"}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => editarCliente(cliente)}
                              className="btn-primary"
                              title="Editar cliente"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => eliminarCliente(cliente.id)}
                              className="btn-danger"
                              title="Eliminar cliente"
                            >
                              <FiTrash2 />
                            </button>
                            <button
                              onClick={() => verDetalle(cliente)}
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
                  <FiUsers size={48} />
                  <p>No se encontraron clientes</p>
                  <span>No hay clientes registrados en el sistema</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

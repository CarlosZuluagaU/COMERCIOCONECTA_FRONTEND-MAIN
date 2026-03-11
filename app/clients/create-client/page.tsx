"use client";
import React, { useState, ChangeEvent } from "react";
import { FiSave } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";

interface Cliente {
  id?: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  telefono: string;
  correo: string;
  direccion: string;
}

export default function AgregarClientePage() {
  const [activeMenu, setActiveMenu] = useState<string | null>("Clientes");
  const [formData, setFormData] = useState<Cliente>({
    tipoDocumento: "",
    numeroDocumento: "",
    nombres: "",
    telefono: "",
    correo: "",
    direccion: "",
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const tiposDocumento = ["CC", "CE", "NIT", "Pasaporte"];

  const handleFormChange =
    (field: keyof Cliente) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const guardarCliente = async () => {
    if (!formData.tipoDocumento || !formData.numeroDocumento || !formData.nombres) {
      alert("Por favor complete los campos obligatorios (*)");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Error al guardar el cliente");

      const nuevoCliente = await response.json();
      alert(`Cliente "${nuevoCliente.nombres}" registrado exitosamente`);

      setFormData({
        tipoDocumento: "",
        numeroDocumento: "",
        nombres: "",
        telefono: "",
        correo: "",
        direccion: "",
      });
    } catch (error) {
      console.error(error);
      alert("Hubo un error al guardar el cliente");
    }
  };

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">Registrar Cliente</h1>
              <p className="welcome-date">Agregue nuevos clientes al sistema</p>
            </div>
          </div>
        </header>

        <section className="content-section">
          <div className="content-card">
            <div className="card-header">
              <h3>Información del Cliente</h3>
              <span className="form-subtitle">Complete los campos requeridos</span>
            </div>

            <div className="form-container">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tipo de Documento *</label>
                  <select
                    value={formData.tipoDocumento}
                    onChange={handleFormChange("tipoDocumento")}
                    className="form-input"
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposDocumento.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Número de Documento *</label>
                  <input
                    type="text"
                    value={formData.numeroDocumento}
                    onChange={handleFormChange("numeroDocumento")}
                    className="form-input"
                    placeholder="Ej: 1234567890"
                  />
                </div>

                <div className="form-group">
                  <label>Nombre completo *</label>
                  <input
                    type="text"
                    value={formData.nombres}
                    onChange={handleFormChange("nombres")}
                    className="form-input"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={handleFormChange("telefono")}
                    className="form-input"
                    placeholder="Ej: 3001234567"
                  />
                </div>

                <div className="form-group">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={handleFormChange("correo")}
                    className="form-input"
                    placeholder="Ej: cliente@email.com"
                  />
                </div>

                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={handleFormChange("direccion")}
                    className="form-input"
                    placeholder="Ej: Calle 123 #45-67"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  onClick={() =>
                    setFormData({
                      tipoDocumento: "",
                      numeroDocumento: "",
                      nombres: "",
                      telefono: "",
                      correo: "",
                      direccion: "",
                    })
                  }
                  className="btn-secondary"
                >
                  Limpiar Formulario
                </button>

                <button
                  onClick={guardarCliente}
                  className="btn-primary large"
                  disabled={
                    !formData.tipoDocumento ||
                    !formData.numeroDocumento ||
                    !formData.nombres
                  }
                >
                  <FiSave style={{ marginRight: "8px" }} />
                  Guardar Cliente
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

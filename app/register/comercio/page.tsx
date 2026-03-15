"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../register.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export default function RegisterComercioPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    direccion: "",
    telefono: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Protección: si no hay token (no completó step 1), redirigir
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/register";
    }
    // Pre-llenar email con el del usuario si existe
    const userEmail = localStorage.getItem("user");
    if (userEmail) {
      setFormData((prev) => ({ ...prev, email: userEmail }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/comercios`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Registro completo → guardar nombre del comercio y ir al dashboard
      localStorage.setItem("businessName", formData.nombre);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al registrar el comercio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-box">

        {/* Panel izquierdo */}
        <div className="register-left">
          <h1 className="brand-title">Comercios<strong>Conecta</strong></h1>
          <p className="have-account-text"><strong>¿Ya tienes una cuenta?</strong></p>
          <a href="/login" className="login-button">Iniciar sesión</a>
        </div>

        {/* Formulario Step 2 */}
        <div className="register-right">
          {/* Indicador de pasos */}
          <div className="steps-indicator">
            <div className="step completed">
              <span className="step-number">✓</span>
              <span className="step-label">Tu cuenta</span>
            </div>
            <div className="step-line completed" />
            <div className="step active">
              <span className="step-number">2</span>
              <span className="step-label">Tu comercio</span>
            </div>
          </div>

          <h2 className="register-title">Datos de tu comercio</h2>
          <p className="register-subtitle">Cuéntanos sobre tu negocio para completar el registro</p>

          {error && <div className="error-message">{error}</div>}

          <form className="register-form" onSubmit={handleSubmit}>
            <label>Nombre del comercio</label>
            <input
              type="text"
              name="nombre"
              placeholder="Ej: Tienda El Sol"
              value={formData.nombre}
              onChange={handleChange}
              required
            />

            <label>NIT</label>
            <input
              type="text"
              name="nit"
              placeholder="Ej: 900123456-7"
              value={formData.nit}
              onChange={handleChange}
              required
            />

            <label>Dirección</label>
            <input
              type="text"
              name="direccion"
              placeholder="Ej: Calle 123 # 45-67"
              value={formData.direccion}
              onChange={handleChange}
              required
            />

            <label>Teléfono</label>
            <input
              type="text"
              name="telefono"
              placeholder="Ej: 3001234567"
              value={formData.telefono}
              onChange={handleChange}
              required
            />

            <label>Correo del comercio</label>
            <input
              type="email"
              name="email"
              placeholder="comercio@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="form-actions">
              <a href="/register" className="btn-back">← Volver</a>
              <button type="submit" disabled={loading} style={{ width: "auto", flex: 1 }}>
                {loading ? "Registrando..." : "Finalizar registro"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

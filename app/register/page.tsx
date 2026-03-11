"use client";
import React, { useState } from "react";
import axios from "axios";
import "./register.css";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    direccion: "",
    telefono: "",
    email: "",
    
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`${API_BASE_URL}/comercios`, formData);
      setSuccess("Registro exitoso. Pronto nos contactaremos con usted.");
      setFormData({
        nombre: "",
        nit: "",
        direccion: "",
        telefono: "",
        email: "",
        
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al registrar el comercio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-box">
        <div className="register-left">
          <h1 className="brand-title">Comercios<strong>Conecta</strong></h1>
          <p className="have-account-text"><strong>¿Ya tienes una cuenta?</strong></p>
          <a href="/login" className="login-button">Iniciar sesión</a>
        </div>

        <div className="register-right">
          <h2 className="register-title">Registro de Comercio</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form className="register-form" onSubmit={handleSubmit}>
            <label>Nombre del Comercio</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />

            <label>NIT</label>
            <input
              type="text"
              name="nit"
              value={formData.nit}
              onChange={handleChange}
              required
            />

            <label>Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
            />

            <label>Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />

            <label>Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            

            <button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Registrar comercio"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

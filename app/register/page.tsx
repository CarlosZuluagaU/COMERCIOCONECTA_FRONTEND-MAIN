"use client";
import React, { useState } from "react";
import axios from "axios";
import "./register.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
      });

      // Guardar tokens igual que en login para que el paso 2 esté autenticado
      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", formData.email);
      localStorage.setItem("userName", formData.nombre);

      // Ir al paso 2: registro del comercio
      window.location.href = "/register/comercio";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al crear la cuenta");
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

        {/* Formulario Step 1 */}
        <div className="register-right">
          {/* Indicador de pasos */}
          <div className="steps-indicator">
            <div className="step active">
              <span className="step-number">1</span>
              <span className="step-label">Tu cuenta</span>
            </div>
            <div className="step-line" />
            <div className="step">
              <span className="step-number">2</span>
              <span className="step-label">Tu comercio</span>
            </div>
          </div>

          <h2 className="register-title">Crea tu cuenta</h2>
          <p className="register-subtitle">Ingresa tus datos personales para comenzar</p>

          {error && <div className="error-message">{error}</div>}

          <form className="register-form" onSubmit={handleSubmit}>
            <label>Nombre completo</label>
            <input
              type="text"
              name="nombre"
              placeholder="Ej: Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
              required
            />

            <label>Correo electrónico</label>
            <input
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label>Confirmar contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Creando cuenta..." : "Continuar ->"}
            </button>
          </form>

          <div className="oauth-divider">
            <span>o regístrate con</span>
          </div>
          <button className="btn-google" type="button" disabled>
            <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 8 }}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continuar con Google <span className="coming-soon">(próximamente)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

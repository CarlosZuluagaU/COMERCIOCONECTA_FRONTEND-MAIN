"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "../register.css";
import "./complete-profile.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export default function CompleteProfilePage() {
  const { googleUser, authLoaded } = useAuth();
  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    direccion: "",
    telefono: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wait for auth to load from localStorage before checking googleUser.
  // Without this wait, the page would see googleUser=null on first render
  // (before the AuthContext useEffect runs) and redirect immediately.
  useEffect(() => {
    if (!authLoaded) return;
    if (!googleUser) {
      window.location.href = "/login";
    }
  }, [googleUser, authLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser) return;
    setLoading(true);
    setError(null);
    try {
      // Register creates both the user account and comercio, and returns tokens
      const googlePassword = `google_${googleUser.sub}`;
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        nombre: googleUser.name,
        email: googleUser.email,
        password: googlePassword,
        comercioNombre: formData.nombre,
        nit: formData.nit,
        direccion: formData.direccion,
        telefono: formData.telefono || "N/A",
      });
      const { accessToken, refreshToken, comercioId: cid, nombre } = res.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", nombre || googleUser.name || googleUser.email);
      if (cid != null) localStorage.setItem("comercioId", String(cid));

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al registrar la cuenta");
    } finally {
      setLoading(false);
    }
  };

  // Show nothing while auth is loading to avoid flash redirect
  if (!authLoaded || !googleUser) return null;

  return (
    <div className="register-page">
      <div className="complete-profile-box">
        <div className="complete-profile-header">
          <div className="google-avatar">
            {googleUser.picture ? (
              <img src={googleUser.picture} alt={googleUser.name} referrerPolicy="no-referrer" />
            ) : (
              <span>{googleUser.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h2 className="register-title" style={{ marginBottom: 4 }}>
              ¡Hola, {googleUser.name.split(" ")[0]}!
            </h2>
            <p className="subtitle-text">Ya casi terminamos. Cuéntanos sobre tu comercio.</p>
          </div>
        </div>

        <div className="google-info-bar">
          <span className="google-check">✓ Google</span>
          <span className="google-email">{googleUser.email}</span>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section-title">Tu comercio</div>
            <div className="form-row">
              <div className="form-col">
                <label>Nombre del comercio</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Mi Tienda S.A.S."
                  required
                />
              </div>
              <div className="form-col">
                <label>NIT</label>
                <input
                  type="text"
                  name="nit"
                  value={formData.nit}
                  onChange={handleChange}
                  placeholder="900.123.456-7"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <label>Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Calle 123 #45-67"
                  required
                />
              </div>
              <div className="form-col">
                <label>Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+57 300 123 4567"
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Configurando tu cuenta..." : "Comenzar a usar ComerciosConecta"}
          </button>
        </form>

        <p className="back-link">
          <a href="/login">← Volver al inicio de sesión</a>
        </p>
      </div>
    </div>
  );
}

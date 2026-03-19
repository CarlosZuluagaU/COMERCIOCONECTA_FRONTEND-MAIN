"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "../register.css";
import "./complete-profile.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export default function CompleteProfilePage() {
  const { googleUser } = useAuth();
  const [resolvedGoogleUser, setResolvedGoogleUser] = useState<typeof googleUser>(null);
  const [checkingGoogleSession, setCheckingGoogleSession] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    direccion: "",
    telefono: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (googleUser) {
      setResolvedGoogleUser(googleUser);
      setCheckingGoogleSession(false);
      return;
    }

    const savedGoogleUser = localStorage.getItem("googleUser");
    if (savedGoogleUser) {
      try {
        setResolvedGoogleUser(JSON.parse(savedGoogleUser));
        setCheckingGoogleSession(false);
        return;
      } catch {
        localStorage.removeItem("googleUser");
      }
    }

    setCheckingGoogleSession(false);
    window.location.href = "/login";
  }, [googleUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedGoogleUser) return;
    setLoading(true);
    setError(null);

    const googlePassword = `google_${resolvedGoogleUser.sub}`;
    const registerPayload = {
      nombre: resolvedGoogleUser.name,
      email: resolvedGoogleUser.email,
      password: googlePassword,
      comercioNombre: formData.nombre,
      nit: formData.nit,
      direccion: formData.direccion,
      telefono: formData.telefono,
    };

    try {
      const registerRes = await axios.post(`${API_BASE_URL}/auth/register`, registerPayload);
      const { accessToken, refreshToken } = registerRes.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", resolvedGoogleUser.email);
      window.location.href = "/dashboard";
    } catch (err: any) {
      const msg = err?.response?.data?.message || "";
      const alreadyExists = String(msg).toLowerCase().includes("existe") || err?.response?.status === 400;

      if (alreadyExists) {
        try {
          const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: resolvedGoogleUser.email,
            password: googlePassword,
          });
          const { accessToken, refreshToken } = loginRes.data;
          localStorage.setItem("token", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("user", resolvedGoogleUser.email);
          window.location.href = "/dashboard";
          return;
        } catch {
          setError("Tu cuenta de Google ya existe, pero no fue posible iniciar sesión automáticamente.");
        }
      } else {
        setError(msg || "Error al completar el registro con Google");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingGoogleSession || !resolvedGoogleUser) return null;

  return (
    <div className="register-page">
      <div className="complete-profile-box">
        <div className="complete-profile-header">
          <div className="google-avatar">
            {resolvedGoogleUser.picture ? (
              <img src={resolvedGoogleUser.picture} alt={resolvedGoogleUser.name} referrerPolicy="no-referrer" />
            ) : (
              <span>{resolvedGoogleUser.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h2 className="register-title" style={{ marginBottom: 4 }}>¡Hola, {resolvedGoogleUser.name.split(" ")[0]}!</h2>
            <p className="subtitle-text">Ya casi terminamos. Cuéntanos sobre tu comercio.</p>
          </div>
        </div>

        <div className="google-info-bar">
          <span className="google-check">✓ Google</span>
          <span className="google-email">{resolvedGoogleUser.email}</span>
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
                  required
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

"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "../register.css";
import "./complete-profile.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// ── NIT DIAN validation ────────────────────────────────────────────────────
function calcDV(nit9: string): number {
  const factors = [3, 7, 13, 17, 19, 23, 29, 37, 41];
  const sum = nit9.split("").reduce((acc, d, i) => acc + Number(d) * factors[8 - i], 0);
  const rem = sum % 11;
  return rem <= 1 ? rem : 11 - rem;
}
function formatNIT(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  return digits.length <= 9 ? digits : digits.slice(0, 9) + "-" + digits.slice(9);
}
function validateNIT(value: string): string | null {
  const m = value.match(/^(\d{9})-(\d)$/);
  if (!m) return "Formato requerido: 9 dígitos + dígito de verificación (ej: 900123456-7)";
  const expected = calcDV(m[1]);
  if (Number(m[2]) !== expected) return `Dígito de verificación incorrecto — debería ser ${expected}`;
  return null;
}
// ──────────────────────────────────────────────────────────────────────────

const CATEGORIAS = [
  "Salud y Belleza","Ropa y Moda","Alimentos y Bebidas","Tecnología","Ferretería",
  "Papelería","Hogar y Decoración","Deportes y Aire Libre","Juguetes y Entretenimiento",
  "Mascotas","Arte y Cultura","Servicios Profesionales","Educación y Formación",
  "Automotriz","Turismo y Experiencias","Electrodomésticos y Electrónica",
  "Joyería y Accesorios","Otro",
];

export default function CompleteProfilePage() {
  const { googleUser, authLoaded } = useAuth();
  const [formData, setFormData] = useState({
    nombre: "",
    tipoDocumento: "NIT",
    nit: "",
    ciudad: "",
    categoria: "Salud y Belleza",
    direccion: "",
    telefono: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nitError, setNitError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoaded) return;
    if (!googleUser) window.location.href = "/login";
  }, [googleUser, authLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNIT(e.target.value);
    setFormData(prev => ({ ...prev, nit: formatted }));
    if (formData.tipoDocumento === "NIT") {
      setNitError(formatted.length === 11 ? validateNIT(formatted) : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser) return;
    if (formData.tipoDocumento === "NIT") {
      const err = validateNIT(formData.nit);
      if (err) { setNitError(err); return; }
    }
    setLoading(true);
    setError(null);
    try {
      const googlePassword = `google_${googleUser.sub}`;
      const nameParts = googleUser.name.trim().split(" ");
      const primerNombre = nameParts[0];
      const apellidoGoogle = nameParts.slice(1).join(" ");
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        nombre: primerNombre,
        apellido: apellidoGoogle,
        email: googleUser.email,
        password: googlePassword,
        comercioNombre: formData.nombre,
        tipoDocumento: formData.tipoDocumento,
        nit: formData.nit,
        ciudad: formData.ciudad,
        categoria: formData.categoria,
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

  if (!authLoaded || !googleUser) return null;

  const firstName = googleUser.name.split(" ")[0];

  return (
    <div className="auth-page cp-page">
      <div className="cp-card">

        {/* Logo */}
        <a href="/" className="auth-brand" style={{ marginBottom: 24 }}>
          <div className="auth-brand-icon">🛍</div>
          <div className="auth-brand-name">Comercios<span>Conecta</span></div>
        </a>

        {/* Header */}
        <div className="cp-header">
          <div className="cp-avatar">
            {googleUser.picture
              ? <img src={googleUser.picture} alt={googleUser.name} referrerPolicy="no-referrer" />
              : <span>{firstName.charAt(0).toUpperCase()}</span>}
          </div>
          <div>
            <h2 className="cp-title">¡Hola, {firstName}!</h2>
            <p className="cp-sub">Ya casi terminamos. Cuéntanos sobre tu comercio.</p>
          </div>
        </div>

        {/* Google badge */}
        <div className="cp-google-bar">
          <span className="cp-google-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" style={{ display: "block" }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </span>
          <span className="cp-google-email">{googleUser.email}</span>
          <span className="cp-google-check">✓ Verificado</span>
        </div>

        {error && <div className="auth-error" style={{ marginTop: 0 }}>{error}</div>}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-section-label">Tu comercio</div>

          <div className="fg">
            <label>Nombre del comercio</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange}
              placeholder="Ej: Farmacia La Salud" required />
          </div>

          <div className="form-row">
            <div className="fg">
              <label>Tipo de documento</label>
              <select name="tipoDocumento" value={formData.tipoDocumento} onChange={e => {
                  setFormData(prev => ({ ...prev, tipoDocumento: e.target.value, nit: "" }));
                  setNitError(null);
                }}>
                <option>NIT</option>
                <option>CC</option>
                <option>CE</option>
              </select>
            </div>
            <div className="fg">
              <label>Número {formData.tipoDocumento === "NIT" && <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: ".72rem" }}>9 dígitos + DV</span>}</label>
              <input type="text" name="nit" value={formData.nit} onChange={handleNitChange}
                placeholder={formData.tipoDocumento === "NIT" ? "900123456-7" : "Número de documento"}
                style={nitError ? { borderColor: "#ef4444" } : formData.nit.length === 11 && !nitError ? { borderColor: "#10b981" } : {}}
                required />
              {nitError && <span style={{ fontSize: ".72rem", color: "#ef4444", marginTop: 2 }}>{nitError}</span>}
              {formData.tipoDocumento === "NIT" && !nitError && formData.nit.length === 11 && (
                <span style={{ fontSize: ".72rem", color: "#10b981", marginTop: 2 }}>✓ NIT válido</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="fg">
              <label>Ciudad</label>
              <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange}
                placeholder="Bogotá" required />
            </div>
            <div className="fg">
              <label>Categoría</label>
              <select name="categoria" value={formData.categoria} onChange={handleChange}>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="fg">
              <label>Dirección</label>
              <input type="text" name="direccion" value={formData.direccion} onChange={handleChange}
                placeholder="Calle 123 #45-67" />
            </div>
            <div className="fg">
              <label>Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange}
                placeholder="+57 300 123 4567" />
            </div>
          </div>

          <button type="submit" className="cp-btn-submit" disabled={loading}>
            {loading ? "Configurando tu cuenta…" : "Comenzar a usar ComerciosConecta →"}
          </button>
        </form>

        <p className="auth-bottom" style={{ marginTop: 16 }}>
          <a href="/login">← Volver al inicio de sesión</a>
        </p>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import "./register.css";

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
  "Salud y Belleza",
  "Ropa y Moda",
  "Alimentos y Bebidas",
  "Tecnología",
  "Ferretería",
  "Papelería",
  "Hogar y Decoración",
  "Deportes y Aire Libre",
  "Juguetes y Entretenimiento",
  "Mascotas",
  "Arte y Cultura",
  "Servicios Profesionales",
  "Educación y Formación",
  "Automotriz",
  "Turismo y Experiencias",
  "Electrodomésticos y Electrónica",
  "Joyería y Accesorios",
  "Otro",
];

function getStrength(val: string) {
  let score = 0;
  if (val.length > 5) score++;
  if (val.length > 9) score++;
  if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
  if (/[!@#$%^&*]/.test(val)) score++;
  return score;
}

const strengthLabels = ["", "Débil", "Regular", "Buena", "Muy segura 🔒"];
const strengthColors = ["", "#ef4444", "#f59e0b", "#00d4aa", "#10b981"];

export default function RegisterPage() {
  const { loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    comercioNombre: "",
    tipoDocumento: "NIT",
    nit: "",
    ciudad: "",
    categoria: "Salud y Belleza",
    direccion: "",
    telefono: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nitError, setNitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (formData.tipoDocumento === "NIT") {
      const err = validateNIT(formData.nit);
      if (err) { setNitError(err); return; }
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email,
        password: formData.password,
        comercioNombre: formData.comercioNombre,
        tipoDocumento: formData.tipoDocumento,
        nit: formData.nit,
        ciudad: formData.ciudad,
        direccion: formData.direccion,
        categoria: formData.categoria,
        telefono: formData.telefono || "N/A",
      };
      const res = await axios.post(`${API_BASE_URL}/auth/register`, payload);
      const { accessToken, refreshToken, comercioId: cid, nombre } = res.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", nombre || formData.nombre || formData.email);
      if (cid != null) localStorage.setItem("comercioId", String(cid));
      setSuccess("¡Cuenta creada! Redirigiendo...");
      setTimeout(() => { window.location.href = "/dashboard"; }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError(null);
      setLoading(true);
      try {
        const { isNew } = await loginWithGoogle(tokenResponse.access_token);
        window.location.href = isNew ? "/register/complete-profile" : "/dashboard";
      } catch {
        setError("Error al registrarse con Google");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Error al conectar con Google"),
  });

  const pwStrength = getStrength(formData.password);

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <a href="/" className="auth-brand">
          <div className="auth-brand-icon">🛍</div>
          <div className="auth-brand-name">Comercios<span>Conecta</span></div>
        </a>

        <div className="auth-title">Crea tu cuenta</div>
        <div className="auth-sub">Empieza a vender en minutos</div>

        {error && <div className="auth-error" style={{ marginTop: 16 }}>{error}</div>}
        {success && <div className="auth-success" style={{ marginTop: 16 }}>{success}</div>}

        <button className="btn-google" onClick={() => googleLogin()} type="button">
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Registrarse con Google
        </button>

        <div className="auth-divider"><span>o crea tu cuenta con correo</span></div>

        <form className="auth-form" onSubmit={handleSubmit}>

          {/* ── Tus datos ── */}
          <div className="form-section-label">Tus datos</div>

          <div className="form-row">
            <div className="fg">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan"
                required
              />
            </div>
            <div className="fg">
              <label>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Pérez"
                required
              />
            </div>
          </div>

          <div className="fg">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div className="fg">
            <label>Contraseña</label>
            <div className="input-wrap">
              <input
                type={showPw ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
              />
              <button type="button" className="toggle-pw" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {showPw ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {formData.password && (
              <>
                <div className="pw-strength">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="pw-bar"
                      style={{ background: i < pwStrength ? strengthColors[pwStrength] : undefined }}
                    />
                  ))}
                </div>
                <div className="pw-label">{strengthLabels[pwStrength] || "Ingresa una contraseña"}</div>
              </>
            )}
          </div>

          {/* ── Tu comercio ── */}
          <div className="form-section-label" style={{ marginTop: 4 }}>Tu comercio</div>

          <div className="fg">
            <label>Nombre del comercio</label>
            <input
              type="text"
              name="comercioNombre"
              value={formData.comercioNombre}
              onChange={handleChange}
              placeholder="Ej: Farmacia La Salud"
              required
            />
          </div>

          <div className="form-row">
            <div className="fg">
              <label>Tipo de documento</label>
              <select name="tipoDocumento" value={formData.tipoDocumento} onChange={e => {
                handleChange(e);
                setNitError(null);
                setFormData(prev => ({ ...prev, tipoDocumento: e.target.value, nit: "" }));
              }}>
                <option>NIT</option>
                <option>CC</option>
                <option>CE</option>
              </select>
            </div>
            <div className="fg">
              <label>Número {formData.tipoDocumento === "NIT" && <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: ".72rem" }}>9 dígitos + dígito verificación</span>}</label>
              <input
                type="text"
                name="nit"
                value={formData.nit}
                onChange={handleNitChange}
                placeholder={formData.tipoDocumento === "NIT" ? "900123456-7" : "Número de documento"}
                style={nitError ? { borderColor: "#ef4444" } : formData.nit.length === 11 && !nitError ? { borderColor: "#10b981" } : {}}
                required
              />
              {nitError && <span style={{ fontSize: ".72rem", color: "#ef4444", marginTop: 2 }}>{nitError}</span>}
              {formData.tipoDocumento === "NIT" && !nitError && formData.nit.length === 11 && (
                <span style={{ fontSize: ".72rem", color: "#10b981", marginTop: 2 }}>✓ NIT válido</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="fg">
              <label>Ciudad</label>
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                placeholder="Bogotá"
                required
              />
            </div>
            <div className="fg">
              <label>Categoría</label>
              <select name="categoria" value={formData.categoria} onChange={handleChange}>
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="fg">
              <label>Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Calle 123 #45-67"
              />
            </div>
            <div className="fg">
              <label>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+57 300 123 4567"
              />
            </div>
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta →"}
          </button>
        </form>

        <p className="auth-bottom">
          ¿Ya tienes cuenta? <a href="/login">Iniciar sesión</a>
        </p>
        <p className="auth-terms">
          Al registrarte aceptas nuestros Términos de servicio y Política de privacidad.
        </p>
      </div>
    </div>
  );
}

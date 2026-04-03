"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../dashboard/Sidebar";
import "../dashboard/dashboard.css";
import "../dashboard/admin.css";
import "./profile.css";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

const empty = {
  nombre: "", apellido: "", email: "", telefono: "",
  tipoDocumento: "Cédula de ciudadanía", numeroDocumento: "",
  fechaNacimiento: "", ciudad: "", direccion: "", biografia: "",
};

function pwdStrength(v: string) {
  let s = 0;
  if (v.length >= 6) s++;
  if (v.length >= 10) s++;
  if (/[A-Z]/.test(v) && /[0-9]/.test(v)) s++;
  if (/[!@#$%^&*]/.test(v)) s++;
  return s;
}
const strengthLabel = ["", "Débil", "Regular", "Buena", "Fuerte"];
const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

export default function ProfilePage() {
  const { user, token, logout, updateUser } = useAuth();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [pwd, setPwd] = useState({ actual: "", nueva: "", confirmar: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [msgPwd, setMsgPwd] = useState<{ text: string; ok: boolean } | null>(null);
  const [showNueva, setShowNueva] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) setForm({
          nombre:          d.nombre          || "",
          apellido:        d.apellido        || "",
          email:           d.email           || "",
          telefono:        d.telefono        || "",
          tipoDocumento:   d.tipoDocumento   || "Cédula de ciudadanía",
          numeroDocumento: d.numeroDocumento || "",
          fechaNacimiento: d.fechaNacimiento || "",
          ciudad:          d.ciudad          || "",
          direccion:       d.direccion       || "",
          biografia:       d.biografia       || "",
        });
      })
      .finally(() => setLoading(false));
  }, [token]);

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const guardar = async () => {
    if (!form.nombre.trim()) { setMsg({ text: "El nombre no puede estar vacío", ok: false }); return; }
    if (!form.email.trim())  { setMsg({ text: "El correo no puede estar vacío", ok: false }); return; }
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar");
      const fullName = [data.nombre, data.apellido].filter(Boolean).join(" ");
      updateUser(fullName || form.nombre, data.accessToken, data.refreshToken);
      setMsg({ text: "Perfil actualizado correctamente", ok: true });
    } catch (e: any) {
      setMsg({ text: e.message, ok: false });
    } finally {
      setSaving(false);
    }
  };

  const cambiarPwd = async () => {
    if (!pwd.nueva)                      { setMsgPwd({ text: "Ingresa la nueva contraseña", ok: false }); return; }
    if (pwd.nueva !== pwd.confirmar)     { setMsgPwd({ text: "Las contraseñas no coinciden", ok: false }); return; }
    if (pwd.nueva.length < 6)            { setMsgPwd({ text: "Mínimo 6 caracteres", ok: false }); return; }
    setSavingPwd(true); setMsgPwd(null);
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: pwd.nueva }),
      });
      if (!res.ok) throw new Error("Error al cambiar contraseña");
      setMsgPwd({ text: "Contraseña actualizada. Redirigiendo…", ok: true });
      setPwd({ actual: "", nueva: "", confirmar: "" });
      setTimeout(() => { logout(); router.push("/login"); }, 2000);
    } catch (e: any) {
      setMsgPwd({ text: e.message, ok: false });
    } finally {
      setSavingPwd(false);
    }
  };

  const inicial = (form.nombre || user || "U").charAt(0).toUpperCase();
  const nombreCompleto = [form.nombre, form.apellido].filter(Boolean).join(" ") || user || "Usuario";
  const strength = pwdStrength(pwd.nueva);

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">

        <header className="adm-header">
          <h1 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.05rem" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00a88f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            Mi Perfil
          </h1>
          <button className="adm-btn-secondary" style={{ width: "auto" }} onClick={() => router.push("/dashboard")}>
            ← Volver
          </button>
        </header>

        {loading ? (
          <div className="adm-content"><div className="adm-loading">Cargando perfil…</div></div>
        ) : (
          <div className="adm-content prf-content">

            {/* HERO */}
            <div className="prf-hero">
              <div className="prf-hero-avatar">{inicial}</div>
              <div className="prf-hero-info">
                <h2>{nombreCompleto}</h2>
                <p>{form.email || "—"}{form.ciudad ? ` · ${form.ciudad}` : ""}</p>
                <div className="prf-hero-badges">
                  <span className="prf-badge prf-badge-green">● Activo</span>
                  <span className="prf-badge prf-badge-dim">Administrador</span>
                </div>
              </div>
            </div>

            <div className="prf-grid">
              {/* COLUMNA IZQUIERDA */}
              <div className="prf-left">

                {/* INFORMACIÓN PERSONAL */}
                <div className="adm-fcard">
                  <div className="prf-card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    Información Personal
                  </div>

                  <div className="adm-row">
                    <div className="adm-field">
                      <label>Nombre *</label>
                      <input value={form.nombre} onChange={f("nombre")} placeholder="Tu nombre" />
                    </div>
                    <div className="adm-field">
                      <label>Apellido</label>
                      <input value={form.apellido} onChange={f("apellido")} placeholder="Tu apellido" />
                    </div>
                  </div>

                  <div className="adm-row" style={{ marginTop: 14 }}>
                    <div className="adm-field">
                      <label>Correo electrónico *</label>
                      <input type="email" value={form.email} onChange={f("email")} placeholder="correo@ejemplo.com" />
                      <span className="prf-hint">Si cambias el correo, tu sesión se actualizará</span>
                    </div>
                    <div className="adm-field">
                      <label>Teléfono</label>
                      <input type="tel" value={form.telefono} onChange={f("telefono")} placeholder="+57 300 000 0000" />
                    </div>
                  </div>

                  <div className="adm-row cols-3" style={{ marginTop: 14 }}>
                    <div className="adm-field">
                      <label>Tipo de documento</label>
                      <select value={form.tipoDocumento} onChange={f("tipoDocumento")}>
                        <option>Cédula de ciudadanía</option>
                        <option>NIT</option>
                        <option>Cédula de extranjería</option>
                        <option>Pasaporte</option>
                      </select>
                    </div>
                    <div className="adm-field">
                      <label>Número de documento</label>
                      <input value={form.numeroDocumento} onChange={f("numeroDocumento")} placeholder="1234567890" />
                    </div>
                    <div className="adm-field">
                      <label>Fecha de nacimiento</label>
                      <input type="date" value={form.fechaNacimiento} onChange={f("fechaNacimiento")} />
                    </div>
                  </div>

                  <div className="adm-row" style={{ marginTop: 14 }}>
                    <div className="adm-field">
                      <label>Ciudad</label>
                      <input value={form.ciudad} onChange={f("ciudad")} placeholder="Tu ciudad" />
                    </div>
                    <div className="adm-field">
                      <label>Dirección</label>
                      <input value={form.direccion} onChange={f("direccion")} placeholder="Cra 10 #45-20" />
                    </div>
                  </div>

                  <div className="adm-row" style={{ marginTop: 14 }}>
                    <div className="adm-field adm-field-full">
                      <label>Biografía</label>
                      <textarea value={form.biografia} onChange={f("biografia")} placeholder="Cuéntanos un poco sobre ti o tu rol en el negocio…" rows={3} />
                      <span className="prf-hint">Visible en el perfil interno</span>
                    </div>
                  </div>

                  {msg && (
                    <div className={`prf-msg ${msg.ok ? "prf-msg-ok" : "prf-msg-err"}`}>
                      {msg.ok ? "✅" : "❌"} {msg.text}
                    </div>
                  )}

                  <button className="prf-btn-save" onClick={guardar} disabled={saving}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    {saving ? "Guardando…" : "Guardar cambios"}
                  </button>
                </div>

              </div>

              {/* COLUMNA DERECHA */}
              <div className="prf-right">

                {/* SEGURIDAD */}
                <div className="adm-fcard">
                  <div className="prf-card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Seguridad
                  </div>

                  <div className="adm-field" style={{ marginBottom: 14 }}>
                    <label>Nueva contraseña</label>
                    <div className="prf-pwd-wrap">
                      <input
                        type={showNueva ? "text" : "password"}
                        value={pwd.nueva}
                        onChange={e => setPwd(p => ({ ...p, nueva: e.target.value }))}
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button className="prf-eye" onClick={() => setShowNueva(v => !v)} type="button">
                        {showNueva ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {pwd.nueva && (
                      <div className="prf-strength">
                        <div className="prf-strength-bar">
                          <div style={{ width: `${strength * 25}%`, background: strengthColor[strength], height: "100%", borderRadius: 2, transition: "width .3s" }} />
                        </div>
                        <span style={{ color: strengthColor[strength], fontSize: ".68rem", fontWeight: 700 }}>
                          {strengthLabel[strength]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="adm-field" style={{ marginBottom: 14 }}>
                    <label>Confirmar contraseña</label>
                    <input
                      type="password"
                      value={pwd.confirmar}
                      onChange={e => setPwd(p => ({ ...p, confirmar: e.target.value }))}
                      placeholder="Repite la contraseña"
                    />
                    {pwd.confirmar && pwd.nueva !== pwd.confirmar && (
                      <span className="prf-hint" style={{ color: "#ef4444" }}>Las contraseñas no coinciden</span>
                    )}
                  </div>

                  {msgPwd && (
                    <div className={`prf-msg ${msgPwd.ok ? "prf-msg-ok" : "prf-msg-err"}`}>
                      {msgPwd.ok ? "✅" : "❌"} {msgPwd.text}
                    </div>
                  )}

                  <button className="prf-btn-dark" onClick={cambiarPwd} disabled={savingPwd}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    {savingPwd ? "Guardando…" : "Cambiar contraseña"}
                  </button>
                </div>

                {/* ZONA DE PELIGRO */}
                <div className="adm-fcard prf-danger-card">
                  <div className="prf-card-title prf-card-title-danger">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Zona de Peligro
                  </div>
                  <div className="prf-danger-item">
                    <div>
                      <p>Cerrar todas las sesiones</p>
                      <span>Cierra sesión en todos los dispositivos activos</span>
                    </div>
                    <button className="prf-btn-outline-danger" onClick={() => { logout(); router.push("/login"); }}>
                      Cerrar
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";
import { useState, useEffect, useRef } from "react";
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

function getBrowserInfo(): string {
  if (typeof navigator === "undefined") return "";
  const ua = navigator.userAgent;
  let browser = "Navegador";
  let os = "Dispositivo";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Macintosh/.test(ua)) os = "Mac";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";
  return `${browser} / ${os}`;
}

function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return "Ahora mismo";
  if (mins < 60) return `Hace ${mins} min`;
  if (hours < 24) return `Hace ${hours} h`;
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

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
  const { user, token, logout, updateUser, googleUser } = useAuth();
  const isGoogle = !!googleUser;
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
  const [deactivating, setDeactivating] = useState(false);
  const [activity, setActivity] = useState<{ dot: string; text: string; time: string }[]>([]);
  const [prefs, setPrefs] = useState({ moneda: "COP", zonaHoraria: "America/Bogota", idioma: "Español", formatoFecha: "DD/MM/AAAA" });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [comercioNombre, setComercioNombre] = useState("");
  const [miembroDesde, setMiembroDesde] = useState("");
  const [totalPedidos, setTotalPedidos] = useState<number | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [msgPrefs, setMsgPrefs] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    // Record/read current session
    const sessionKey = "prf_session";
    const browserInfo = getBrowserInfo();
    const now = Date.now();
    const existing = localStorage.getItem(sessionKey);
    if (!existing) {
      localStorage.setItem(sessionKey, JSON.stringify({ ts: now, browser: browserInfo }));
    }
    const session = JSON.parse(localStorage.getItem(sessionKey) || "{}");

    const items: { dot: string; text: string; time: string }[] = [];
    items.push({ dot: "#10b981", text: "Inicio de sesión exitoso", time: `${relTime(session.ts || now)} · ${session.browser || browserInfo}` });

    const lastSave = localStorage.getItem("prf_last_save");
    if (lastSave) items.push({ dot: "#3b82f6", text: "Perfil actualizado", time: relTime(parseInt(lastSave)) });

    const lastPwd = localStorage.getItem("prf_last_pwd");
    if (lastPwd) items.push({ dot: "#f59e0b", text: "Contraseña cambiada", time: relTime(parseInt(lastPwd)) });

    setActivity(items);

    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem("prf_prefs");
    if (savedPrefs) setPrefs(JSON.parse(savedPrefs));

    // Load stored avatar
    const stored = localStorage.getItem("prf_avatar");
    if (stored) setAvatarUrl(stored);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          setForm({
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
          if (d.comercioNombre) setComercioNombre(d.comercioNombre);
          if (d.createdAt) {
            const dt = new Date(d.createdAt);
            setMiembroDesde(dt.toLocaleDateString("es-CO", { month: "long", year: "numeric" }));
          }
          // Fetch orders count
          if (d.comercioId) {
            fetch(`${API}/checkout/all-orders?comercioId=${d.comercioId}`, { headers: { Authorization: `Bearer ${token}` } })
              .then(r => r.ok ? r.json() : [])
              .then((orders: any[]) => setTotalPedidos(orders.length))
              .catch(() => {});
          }
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      localStorage.setItem("prf_avatar", dataUrl);
      setAvatarUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

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
      // Actualizar el form con lo que la DB realmente guardó
      setForm(prev => ({
        ...prev,
        nombre:          data.nombre          ?? prev.nombre,
        apellido:        data.apellido        ?? prev.apellido,
        telefono:        data.telefono        ?? prev.telefono,
        tipoDocumento:   data.tipoDocumento   ?? prev.tipoDocumento,
        numeroDocumento: data.numeroDocumento ?? prev.numeroDocumento,
        fechaNacimiento: data.fechaNacimiento ?? prev.fechaNacimiento,
        ciudad:          data.ciudad          ?? prev.ciudad,
        direccion:       data.direccion       ?? prev.direccion,
        biografia:       data.biografia       ?? prev.biografia,
        ...(data.email ? { email: data.email } : {}),
      }));
      const fullName = [data.nombre, data.apellido].filter(Boolean).join(" ");
      updateUser(fullName || form.nombre, data.accessToken, data.refreshToken);
      localStorage.setItem("prf_last_save", Date.now().toString());
      setActivity(prev => {
        const filtered = prev.filter(a => a.text !== "Perfil actualizado");
        return [filtered[0], { dot: "#3b82f6", text: "Perfil actualizado", time: "Ahora mismo" }, ...filtered.slice(1)];
      });
      setMsg({ text: "Perfil actualizado correctamente", ok: true });
    } catch (e: any) {
      setMsg({ text: e.message, ok: false });
    } finally {
      setSaving(false);
    }
  };

  const cambiarPwd = async () => {
    if (!pwd.actual)                     { setMsgPwd({ text: "Ingresa tu contraseña actual", ok: false }); return; }
    if (!pwd.nueva)                      { setMsgPwd({ text: "Ingresa la nueva contraseña", ok: false }); return; }
    if (pwd.nueva !== pwd.confirmar)     { setMsgPwd({ text: "Las contraseñas no coinciden", ok: false }); return; }
    if (pwd.nueva.length < 6)            { setMsgPwd({ text: "Mínimo 6 caracteres", ok: false }); return; }
    if (pwd.actual === pwd.nueva)        { setMsgPwd({ text: "La nueva contraseña debe ser diferente a la actual", ok: false }); return; }
    setSavingPwd(true); setMsgPwd(null);
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwd.actual, password: pwd.nueva }),
      });
      if (!res.ok) throw new Error("Error al cambiar contraseña");
      localStorage.setItem("prf_last_pwd", Date.now().toString());
      setActivity(prev => {
        const filtered = prev.filter(a => a.text !== "Contraseña cambiada");
        return [filtered[0], { dot: "#f59e0b", text: "Contraseña cambiada", time: "Ahora mismo" }, ...filtered.slice(1)];
      });
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
              {/* Avatar con botón editar */}
              <div className="prf-avatar-wrap">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="prf-hero-avatar-img" />
                ) : googleUser?.picture ? (
                  <img src={googleUser.picture} alt="avatar" className="prf-hero-avatar-img" />
                ) : (
                  <div className="prf-hero-avatar">{inicial}</div>
                )}
                <button className="prf-avatar-edit-btn" title="Cambiar foto" onClick={() => avatarInputRef.current?.click()}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
              </div>

              <div className="prf-hero-info">
                <h2>{nombreCompleto}</h2>
                <p>{form.email || "—"}{miembroDesde ? ` · Miembro desde ${miembroDesde}` : ""}</p>
                <div className="prf-hero-badges">
                  <span className="prf-badge prf-badge-green">● Activo</span>
                  {comercioNombre && <span className="prf-badge prf-badge-dim">🏪 {comercioNombre}</span>}
                  {isGoogle && <span className="prf-badge prf-badge-google">🔗 Google</span>}
                  <span className="prf-badge prf-badge-dim">Administrador</span>
                </div>
              </div>

              {totalPedidos !== null && (
                <div className="prf-hero-stats">
                  <div className="prf-hero-stat-val">{totalPedidos}</div>
                  <div className="prf-hero-stat-lbl">Pedidos gestionados</div>
                </div>
              )}
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
                      <label>Correo electrónico {!isGoogle && "*"}</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={isGoogle ? undefined : f("email")}
                        readOnly={isGoogle}
                        placeholder="correo@ejemplo.com"
                        style={isGoogle ? { background: "#f7f8fa", color: "#9ca3af", cursor: "not-allowed" } : {}}
                      />
                      <span className="prf-hint">
                        {isGoogle
                          ? "El correo está vinculado a tu cuenta de Google"
                          : "Si cambias el correo, tu sesión se actualizará"}
                      </span>
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

                {/* PREFERENCIAS DEL SISTEMA */}
                <div className="adm-fcard">
                  <div className="prf-card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                    Preferencias del Sistema
                  </div>
                  <div className="adm-row">
                    <div className="adm-field">
                      <label>Moneda</label>
                      <select value={prefs.moneda} onChange={e => setPrefs(p => ({ ...p, moneda: e.target.value }))}>
                        <option value="COP">COP — Peso colombiano</option>
                        <option value="USD">USD — Dólar estadounidense</option>
                        <option value="EUR">EUR — Euro</option>
                      </select>
                    </div>
                    <div className="adm-field">
                      <label>Zona horaria</label>
                      <select value={prefs.zonaHoraria} onChange={e => setPrefs(p => ({ ...p, zonaHoraria: e.target.value }))}>
                        <option value="America/Bogota">America/Bogotá (UTC-5)</option>
                        <option value="America/Lima">America/Lima (UTC-5)</option>
                        <option value="America/Mexico_City">America/Ciudad de México (UTC-6)</option>
                        <option value="America/Buenos_Aires">America/Buenos Aires (UTC-3)</option>
                        <option value="America/Santiago">America/Santiago (UTC-3)</option>
                        <option value="America/New_York">America/New York (UTC-5)</option>
                      </select>
                    </div>
                  </div>
                  <div className="adm-row" style={{ marginTop: 12 }}>
                    <div className="adm-field">
                      <label>Idioma de la plataforma</label>
                      <select value={prefs.idioma} onChange={e => setPrefs(p => ({ ...p, idioma: e.target.value }))}>
                        <option value="Español">Español</option>
                        <option value="English">English</option>
                        <option value="Português">Português</option>
                      </select>
                    </div>
                    <div className="adm-field">
                      <label>Formato de fecha</label>
                      <select value={prefs.formatoFecha} onChange={e => setPrefs(p => ({ ...p, formatoFecha: e.target.value }))}>
                        <option value="DD/MM/AAAA">DD/MM/AAAA</option>
                        <option value="MM/DD/AAAA">MM/DD/AAAA</option>
                        <option value="AAAA/MM/DD">AAAA/MM/DD</option>
                      </select>
                    </div>
                  </div>
                  {msgPrefs && (
                    <div className={`prf-msg ${msgPrefs.ok ? "prf-msg-ok" : "prf-msg-err"}`}>
                      {msgPrefs.ok ? "✅" : "❌"} {msgPrefs.text}
                    </div>
                  )}
                  <button
                    className="prf-btn-save"
                    disabled={savingPrefs}
                    onClick={() => {
                      setSavingPrefs(true);
                      localStorage.setItem("prf_prefs", JSON.stringify(prefs));
                      setTimeout(() => {
                        setMsgPrefs({ text: "Preferencias guardadas", ok: true });
                        setSavingPrefs(false);
                        setTimeout(() => setMsgPrefs(null), 3000);
                      }, 400);
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    {savingPrefs ? "Guardando…" : "Guardar preferencias"}
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

                  {isGoogle ? (
                    /* ── Cuenta Google: no puede cambiar contraseña ni email ── */
                    <div className="prf-google-card">
                      <div className="prf-google-header">
                        <svg width="22" height="22" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        <div>
                          <div className="prf-google-title">Sesión con Google</div>
                          <div className="prf-google-email">{googleUser?.email || form.email}</div>
                        </div>
                        <span className="prf-google-connected">Conectado</span>
                      </div>
                      <p className="prf-google-desc">
                        Tu cuenta está vinculada a Google. La contraseña y el correo son gestionados directamente por Google — no puedes modificarlos desde aquí.
                      </p>
                      <div className="prf-google-actions">
                        <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="prf-google-link">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          Gestionar cuenta Google
                        </a>
                        <button className="prf-btn-outline-danger" style={{ fontSize: ".78rem", padding: "7px 14px" }} onClick={() => { logout(); router.push("/login"); }}>
                          Desvincular y salir
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Cuenta normal: cambio de contraseña ── */
                    <>
                      <div className="adm-field" style={{ marginBottom: 14 }}>
                        <label>Contraseña actual *</label>
                        <input
                          type="password"
                          value={pwd.actual}
                          onChange={e => setPwd(p => ({ ...p, actual: e.target.value }))}
                          placeholder="Tu contraseña actual"
                        />
                      </div>

                      <div className="adm-field" style={{ marginBottom: 14 }}>
                        <label>Nueva contraseña *</label>
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
                    </>
                  )}
                </div>

                {/* ACTIVIDAD RECIENTE */}
                <div className="adm-fcard">
                  <div className="prf-card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    Actividad Reciente
                  </div>
                  {activity.length === 0 ? (
                    <p style={{ fontSize: ".8rem", color: "#9ca3af", textAlign: "center", padding: "12px 0" }}>Sin actividad registrada</p>
                  ) : activity.map((item, i) => (
                    <div key={i} className="prf-activity-item">
                      <div className="prf-act-dot" style={{ background: item.dot }} />
                      <div>
                        <div className="prf-act-text">{item.text}</div>
                        <div className="prf-act-time">{item.time}</div>
                      </div>
                    </div>
                  ))}
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
                  <div className="prf-danger-item" style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #fee2e2" }}>
                    <div>
                      <p>Desactivar cuenta</p>
                      <span>Tu cuenta quedará pausada temporalmente</span>
                    </div>
                    <button
                      className="prf-btn-outline-danger"
                      disabled={deactivating}
                      onClick={() => {
                        if (!window.confirm("¿Seguro que deseas desactivar tu cuenta? Podrás reactivarla contactando a soporte.")) return;
                        setDeactivating(true);
                        logout();
                        router.push("/login");
                      }}
                    >
                      {deactivating ? "…" : "Desactivar"}
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

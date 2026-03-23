"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../dashboard/Sidebar";
import "../dashboard/dashboard.css";
import "../dashboard/admin.css";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "" });
  const [pwd, setPwd] = useState({ nueva: "", confirmar: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [msgPwd, setMsgPwd] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setForm({ nombre: data.nombre || "", telefono: data.telefono || "", email: data.email || "" });
      })
      .finally(() => setLoading(false));
  }, [token]);

  const guardarPerfil = async () => {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre: form.nombre, telefono: form.telefono }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar");
      localStorage.setItem("user", data.nombre || form.nombre);
      setMsg({ text: "Perfil actualizado correctamente", ok: true });
    } catch (e: any) {
      setMsg({ text: e.message, ok: false });
    } finally {
      setSaving(false);
    }
  };

  const cambiarPassword = async () => {
    if (!pwd.nueva) { setMsgPwd({ text: "Ingresa la nueva contraseña", ok: false }); return; }
    if (pwd.nueva !== pwd.confirmar) { setMsgPwd({ text: "Las contraseñas no coinciden", ok: false }); return; }
    if (pwd.nueva.length < 6) { setMsgPwd({ text: "Mínimo 6 caracteres", ok: false }); return; }
    setSavingPwd(true); setMsgPwd(null);
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: pwd.nueva }),
      });
      if (!res.ok) throw new Error("Error al cambiar contraseña");
      setMsgPwd({ text: "Contraseña actualizada. Inicia sesión nuevamente.", ok: true });
      setPwd({ nueva: "", confirmar: "" });
      setTimeout(() => { logout(); router.push("/login"); }, 2000);
    } catch (e: any) {
      setMsgPwd({ text: e.message, ok: false });
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">

        <header className="adm-header">
          <h1>👤 Mi Perfil</h1>
          <button className="adm-btn-secondary" style={{ width: "auto" }} onClick={() => router.push("/dashboard")}>
            ← Volver
          </button>
        </header>

        <div className="adm-content" style={{ maxWidth: 640 }}>
          {loading ? (
            <div className="adm-loading">Cargando perfil…</div>
          ) : (
            <>
              {/* Datos personales */}
              <div className="adm-fcard">
                <h3 style={{ fontSize: ".95rem", color: "#1F3B4D", marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #00d4aa" }}>
                  Información Personal
                </h3>

                <div className="adm-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="adm-field">
                    <label className="adm-label">Nombre completo</label>
                    <input className="adm-input" value={form.nombre}
                      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                      placeholder="Tu nombre" />
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Teléfono</label>
                    <input className="adm-input" value={form.telefono}
                      onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                      placeholder="+57 300 000 0000" />
                  </div>
                </div>

                <div className="adm-field" style={{ marginTop: 14 }}>
                  <label className="adm-label">Correo electrónico</label>
                  <input className="adm-input" value={form.email} disabled
                    style={{ background: "#f7f8fa", color: "#9ca3af", cursor: "not-allowed" }} />
                  <span style={{ fontSize: ".72rem", color: "#9ca3af", marginTop: 4, display: "block" }}>
                    El correo no se puede modificar
                  </span>
                </div>

                {msg && (
                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, fontSize: ".83rem", fontWeight: 600,
                    background: msg.ok ? "#d1fae5" : "#fee2e2", color: msg.ok ? "#065f46" : "#991b1b" }}>
                    {msg.ok ? "✅" : "❌"} {msg.text}
                  </div>
                )}

                <button className="adm-btn-primary" style={{ marginTop: 16, width: "auto" }}
                  onClick={guardarPerfil} disabled={saving}>
                  {saving ? "Guardando…" : "💾 Guardar cambios"}
                </button>
              </div>

              {/* Cambiar contraseña */}
              <div className="adm-fcard">
                <h3 style={{ fontSize: ".95rem", color: "#1F3B4D", marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #00d4aa" }}>
                  Cambiar Contraseña
                </h3>

                <div className="adm-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="adm-field">
                    <label className="adm-label">Nueva contraseña</label>
                    <input className="adm-input" type="password" value={pwd.nueva}
                      onChange={e => setPwd(p => ({ ...p, nueva: e.target.value }))}
                      placeholder="Mínimo 6 caracteres" />
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Confirmar contraseña</label>
                    <input className="adm-input" type="password" value={pwd.confirmar}
                      onChange={e => setPwd(p => ({ ...p, confirmar: e.target.value }))}
                      placeholder="Repite la contraseña" />
                  </div>
                </div>

                {msgPwd && (
                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, fontSize: ".83rem", fontWeight: 600,
                    background: msgPwd.ok ? "#d1fae5" : "#fee2e2", color: msgPwd.ok ? "#065f46" : "#991b1b" }}>
                    {msgPwd.ok ? "✅" : "❌"} {msgPwd.text}
                  </div>
                )}

                <button className="adm-btn-primary" style={{ marginTop: 16, width: "auto", background: "linear-gradient(135deg,#1F3B4D,#2d5066)" }}
                  onClick={cambiarPassword} disabled={savingPwd}>
                  {savingPwd ? "Guardando…" : "🔒 Cambiar contraseña"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

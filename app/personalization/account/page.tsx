"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import "./account.css";

export default function AccountPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>("Personalización");
  const [saved, setSaved] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  const [profile, setProfile] = useState({
    nombre: "",
    email: "",
    comercioNombre: "",
    nit: "",
    direccion: "",
    telefono: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      try {
        const u = JSON.parse(userRaw);
        setProfile(prev => ({
          ...prev,
          nombre: u.nombre || u.name || "",
          email: u.email || "",
        }));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    try {
      await fetch(`${API_BASE_URL}/usuarios/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
    } catch {
      // continue regardless
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg("Las contraseñas no coinciden");
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordMsg("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    try {
      await fetch(`${API_BASE_URL}/usuarios/cambiar-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      setPasswordMsg("Contraseña actualizada correctamente ✓");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setPasswordMsg("Error al cambiar la contraseña. Verifica la contraseña actual.");
    }
    setTimeout(() => setPasswordMsg(""), 4000);
  };

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">
        <div className="personalization-content">
          <button className="back-btn" onClick={() => router.back()}>← Volver</button>
          <h1 className="page-title">Mi cuenta</h1>
          <p className="page-sub">Administra tu perfil y datos de tu comercio.</p>

          {/* Profile form */}
          <form className="person-card" onSubmit={handleSaveProfile}>
            <div className="card-section-title">Datos personales y del comercio</div>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre completo</label>
                <input name="nombre" value={profile.nombre} onChange={handleProfileChange} placeholder="Tu nombre" />
              </div>
              <div className="form-group">
                <label>Correo electrónico</label>
                <input name="email" type="email" value={profile.email} onChange={handleProfileChange} placeholder="correo@ejemplo.com" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre del comercio</label>
                <input name="comercioNombre" value={profile.comercioNombre} onChange={handleProfileChange} placeholder="Ej: Tienda Tech" />
              </div>
              <div className="form-group">
                <label>NIT</label>
                <input name="nit" value={profile.nit} onChange={handleProfileChange} placeholder="900.000.000-0" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Dirección</label>
                <input name="direccion" value={profile.direccion} onChange={handleProfileChange} placeholder="Cra 10 #20-30, Bogotá" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input name="telefono" value={profile.telefono} onChange={handleProfileChange} placeholder="+57 300 123 4567" />
              </div>
            </div>

            <div className="action-row">
              <button type="button" className="btn-cancel" onClick={() => router.back()}>Cancelar</button>
              <button type="submit" className="btn-save">Guardar cambios</button>
            </div>
          </form>

          {/* Password form */}
          <form className="person-card" style={{ marginTop: 20 }} onSubmit={handleChangePassword}>
            <div className="card-section-title">Cambiar contraseña</div>

            <div className="form-group">
              <label>Contraseña actual</label>
              <input name="currentPassword" type="password" value={passwords.currentPassword} onChange={handlePasswordChange} placeholder="••••••••" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Nueva contraseña</label>
                <input name="newPassword" type="password" value={passwords.newPassword} onChange={handlePasswordChange} placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>Confirmar nueva contraseña</label>
                <input name="confirmPassword" type="password" value={passwords.confirmPassword} onChange={handlePasswordChange} placeholder="••••••••" />
              </div>
            </div>

            {passwordMsg && (
              <p className={`pw-msg ${passwordMsg.includes("✓") ? "pw-ok" : "pw-err"}`}>{passwordMsg}</p>
            )}

            <div className="action-row">
              <div />
              <button type="submit" className="btn-save">Cambiar contraseña</button>
            </div>
          </form>

          {saved && (
            <div className="toast-success">✓ Perfil guardado correctamente</div>
          )}
        </div>
      </main>
    </div>
  );
}

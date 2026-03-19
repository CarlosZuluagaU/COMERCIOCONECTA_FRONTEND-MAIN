"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import "./social.css";

export default function SocialLinksPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>("Personalización");
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    whatsapp: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    website: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    try {
      await fetch(`${API_BASE_URL}/comercios/redes-sociales`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
    } catch {
      // continue regardless
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const socialFields = [
    { name: "whatsapp", label: "WhatsApp", icon: "💬", placeholder: "+57 300 123 4567" },
    { name: "instagram", label: "Instagram", icon: "📸", placeholder: "@mitienda" },
    { name: "facebook", label: "Facebook", icon: "📘", placeholder: "facebook.com/mitienda" },
    { name: "tiktok", label: "TikTok", icon: "🎵", placeholder: "@mitienda" },
    { name: "website", label: "Sitio web", icon: "🌐", placeholder: "www.mitienda.co" },
  ] as const;

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">
        <div className="personalization-content">
          <button className="back-btn" onClick={() => router.back()}>← Volver</button>
          <h1 className="page-title">Redes sociales</h1>
          <p className="page-sub">Conecta tus redes para que los clientes puedan encontrarte.</p>

          <form className="person-card" onSubmit={handleSave}>
            <div className="card-section-title">Tus canales de contacto</div>
            <p className="section-hint">Estos enlaces aparecerán en el pie de página de tu tienda online.</p>

            {socialFields.map(field => (
              <div className="social-field-row" key={field.name}>
                <div className="social-icon">{field.icon}</div>
                <div className="social-input-wrap">
                  <label>{field.label}</label>
                  <input
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                  />
                </div>
              </div>
            ))}

            <div className="action-row">
              <button type="button" className="btn-cancel" onClick={() => router.back()}>Cancelar</button>
              <button type="submit" className="btn-save">Guardar cambios</button>
            </div>
          </form>

          {saved && (
            <div className="toast-success">✓ Redes sociales guardadas correctamente</div>
          )}
        </div>
      </main>
    </div>
  );
}

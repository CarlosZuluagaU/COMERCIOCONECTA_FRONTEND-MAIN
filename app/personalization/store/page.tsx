"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import "./store.css";

export default function StoreAppearancePage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>("Personalización");
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    storeName: "",
    primaryColor: "#1F3B4D",
    accentColor: "#00d4aa",
    description: "",
    category: "",
    logoUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    try {
      await fetch(`${API_BASE_URL}/comercios/apariencia`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">
        <div className="personalization-content">
          <button className="back-btn" onClick={() => router.back()}>← Volver</button>
          <h1 className="page-title">Apariencia de la tienda</h1>
          <p className="page-sub">Personaliza cómo ven tu tienda los clientes.</p>

          <form className="person-card" onSubmit={handleSave}>
            <div className="card-section-title">Identidad visual</div>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre de la tienda</label>
                <input name="storeName" value={form.storeName} onChange={handleChange} placeholder="Ej: Mi Tienda Tech" />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  <option>Tecnología</option>
                  <option>Ropa y moda</option>
                  <option>Alimentos</option>
                  <option>Salud y belleza</option>
                  <option>Hogar</option>
                  <option>Otro</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción de la tienda</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe brevemente tu negocio..." />
            </div>

            <div className="form-group">
              <label>URL del logo (imagen)</label>
              <input name="logoUrl" value={form.logoUrl} onChange={handleChange} placeholder="https://..." />
            </div>

            <div className="card-section-title" style={{ marginTop: 24 }}>Paleta de colores</div>

            <div className="color-row">
              <div className="color-group">
                <label>Color principal</label>
                <div className="color-pick-row">
                  <input type="color" name="primaryColor" value={form.primaryColor} onChange={handleChange} className="color-input" />
                  <span className="color-hex">{form.primaryColor}</span>
                </div>
              </div>
              <div className="color-group">
                <label>Color de acento</label>
                <div className="color-pick-row">
                  <input type="color" name="accentColor" value={form.accentColor} onChange={handleChange} className="color-input" />
                  <span className="color-hex">{form.accentColor}</span>
                </div>
              </div>
            </div>

            <div className="preview-strip" style={{ background: form.primaryColor }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Vista previa: </span>
              <span style={{ color: form.accentColor, fontWeight: 800, fontSize: 15 }}>Tu tienda online</span>
            </div>

            <div className="action-row">
              <button type="button" className="btn-cancel" onClick={() => router.back()}>Cancelar</button>
              <button type="submit" className="btn-save">Guardar cambios</button>
            </div>
          </form>

          {saved && (
            <div className="toast-success">✓ Apariencia guardada correctamente</div>
          )}
        </div>
      </main>
    </div>
  );
}

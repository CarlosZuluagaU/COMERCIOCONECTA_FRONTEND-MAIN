"use client";
import React, { useEffect, useState, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { FiSave } from "react-icons/fi";
import Sidebar from "../../../dashboard/Sidebar";
import "../../../dashboard/dashboard.css";
import "../../../dashboard/admin.css";

interface ClienteForm {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  direccion: string;
  ciudad: string;
}

const TIPOS_DOC = [
  { value: "CC",  label: "CC – Cédula de Ciudadanía" },
  { value: "NIT", label: "NIT" },
  { value: "CE",  label: "CE – Cédula de Extranjería" },
  { value: "PP",  label: "PP – Pasaporte" },
];

const MUNICIPIOS = [
  "Bogotá D.C.", "Medellín", "Cali", "Barranquilla",
  "Cartagena", "Bucaramanga", "Pereira", "Manizales",
  "Ibagué", "Santa Marta", "Cúcuta", "Villavicencio",
];

const EMPTY: ClienteForm = {
  tipoDocumento: "", numeroDocumento: "",
  nombres: "", apellidos: "",
  telefono: "", correo: "",
  direccion: "", ciudad: "",
};

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const clienteId = params?.id;

  const [form, setForm]       = useState<ClienteForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!clienteId) return;
    fetch(`${API}/clientes/${clienteId}`)
      .then(r => { if (!r.ok) throw new Error("Cliente no encontrado"); return r.json(); })
      .then(data => {
        setForm({
          tipoDocumento:   data.tipoDocumento   || "",
          numeroDocumento: data.numeroDocumento || "",
          nombres:         data.nombres         || "",
          apellidos:       data.apellidos       || "",
          telefono:        data.telefono        || "",
          correo:          data.correo          || "",
          direccion:       data.direccion       || "",
          ciudad:          data.ciudad          || "",
        });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [clienteId, API]);

  const handleChange =
    (field: keyof ClienteForm) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const guardar = async () => {
    if (!form.tipoDocumento || !form.numeroDocumento || !form.nombres) {
      alert("Por favor complete los campos obligatorios (*)"); return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/clientes/${clienteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      router.push("/clients/list-clients");
    } catch (e: any) {
      alert("No se pudo guardar el cliente: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const canSave = !!form.tipoDocumento && !!form.numeroDocumento && !!form.nombres && !saving;

  if (loading) {
    return (
      <div className="dashboard-page">
        <Sidebar activeMenu="Clientes" onMenuToggle={() => {}} />
        <main className="dashboard-main">
          <div style={{ padding: 60, textAlign: "center", color: "#aaa" }}>Cargando cliente...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <Sidebar activeMenu="Clientes" onMenuToggle={() => {}} />
        <main className="dashboard-main">
          <div style={{ padding: 60, textAlign: "center", color: "#dc2626" }}>
            {error}
            <br />
            <button
              onClick={() => router.push("/clients/list-clients")}
              style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, border: "none", background: "#1F3B4D", color: "white", cursor: "pointer" }}
            >
              Volver al listado
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu="Clientes" onMenuToggle={() => {}} />
      <main className="dashboard-main">

        <header className="adm-header">
          <h1>Editar Cliente</h1>
          <button className="adm-btn-secondary" onClick={() => router.push("/clients/list-clients")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Volver
          </button>
        </header>

        <div className="adm-content">
          <div className="adm-form-layout">

            {/* LEFT */}
            <div className="adm-form-left">

              <div className="adm-fcard">
                <h3>Información Personal</h3>
                <div className="adm-row">
                  <div className="adm-field">
                    <label>Nombres *</label>
                    <input value={form.nombres} onChange={handleChange("nombres")} placeholder="Ej: María" />
                  </div>
                  <div className="adm-field">
                    <label>Apellidos</label>
                    <input value={form.apellidos} onChange={handleChange("apellidos")} placeholder="Ej: González" />
                  </div>
                </div>
                <div className="adm-row">
                  <div className="adm-field">
                    <label>Tipo de documento *</label>
                    <select value={form.tipoDocumento} onChange={handleChange("tipoDocumento")}>
                      <option value="">Seleccionar tipo</option>
                      {TIPOS_DOC.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Número de documento *</label>
                    <input value={form.numeroDocumento} onChange={handleChange("numeroDocumento")} placeholder="Ej: 1234567890" />
                  </div>
                </div>
                <div className="adm-row">
                  <div className="adm-field">
                    <label>Teléfono</label>
                    <input value={form.telefono} onChange={handleChange("telefono")} placeholder="Ej: 3001234567" />
                  </div>
                  <div className="adm-field">
                    <label>Correo electrónico</label>
                    <input type="email" value={form.correo} onChange={handleChange("correo")} placeholder="correo@ejemplo.com" />
                  </div>
                </div>
              </div>

              <div className="adm-fcard">
                <h3>Ubicación</h3>
                <div className="adm-row">
                  <div className="adm-field">
                    <label>Ciudad / Municipio</label>
                    <select value={form.ciudad} onChange={handleChange("ciudad")}>
                      <option value="">Seleccionar municipio</option>
                      {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Dirección</label>
                    <input value={form.direccion} onChange={handleChange("direccion")} placeholder="Ej: Calle 45 # 12-30" />
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT */}
            <div className="adm-save">
              <h3>Guardar cambios</h3>
              <p>Los campos marcados con * son obligatorios.</p>
              <button className="adm-btn-full" onClick={guardar} disabled={!canSave}>
                <FiSave style={{ marginRight: 6 }} />
                {saving ? "Guardando…" : "Guardar Cliente"}
              </button>
              <button className="adm-btn-full-sec" onClick={() => router.push("/clients/list-clients")}>
                Cancelar
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

"use client";
import React, { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { FiSave } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import "../../dashboard/admin.css";

interface Cliente {
  id?: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  telefono: string;
  correo: string;
  direccion: string;
}

const TIPOS_DOC = [
  { value: "CC", label: "CC – Cédula de Ciudadanía" },
  { value: "NIT", label: "NIT" },
  { value: "CE", label: "CE – Cédula Extranjería" },
  { value: "PP", label: "PP – Pasaporte" },
];

const MUNICIPIOS = ["Bogotá D.C.", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga"];

export default function AgregarClientePage() {
  const [activeMenu, setActiveMenu] = useState<string | null>("Clientes");
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [formData, setFormData] = useState<Cliente>({
    tipoDocumento: "",
    numeroDocumento: "",
    nombres: "",
    telefono: "",
    correo: "",
    direccion: "",
  });

  // Extra billing fields (visual only – extend backend as needed)
  const [organizacion, setOrganizacion] = useState("Persona Natural");
  const [regimen, setRegimen] = useState("No responsable de IVA");
  const [municipio, setMunicipio] = useState("");

  const handleChange =
    (field: keyof Cliente) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const guardarCliente = async () => {
    if (!formData.tipoDocumento || !formData.numeroDocumento || !formData.nombres) {
      alert("Por favor complete los campos obligatorios (*)"); return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      const c = await res.json();
      alert(`Cliente "${c.nombres}" registrado exitosamente`);
      router.push("/clients/list-clients");
    } catch {
      alert("Hubo un error al guardar el cliente");
    }
  };

  const canSave = !!formData.tipoDocumento && !!formData.numeroDocumento && !!formData.nombres;

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">

        {/* Header */}
        <header className="adm-header">
          <h1>👤 Agregar Cliente</h1>
          <button className="adm-btn-secondary" onClick={() => router.push("/clients/list-clients")}>
            ← Volver
          </button>
        </header>

        <div className="adm-content">
          <div className="adm-form-layout">

            {/* LEFT COLUMN */}
            <div className="adm-form-left">

              {/* Información Personal */}
              <div className="adm-fcard">
                <h3>Información Personal</h3>
                <div className="adm-row">
                  <div className="adm-field">
                    <label>Nombre completo *</label>
                    <input
                      value={formData.nombres}
                      onChange={handleChange("nombres")}
                      placeholder="Ej: María González"
                    />
                  </div>
                  <div className="adm-field">
                    <label>Teléfono</label>
                    <input
                      value={formData.telefono}
                      onChange={handleChange("telefono")}
                      placeholder="Ej: 3001234567"
                    />
                  </div>
                </div>
                <div className="adm-row">
                  <div className="adm-field">
                    <label>Tipo de documento *</label>
                    <select value={formData.tipoDocumento} onChange={handleChange("tipoDocumento")}>
                      <option value="">Seleccionar tipo</option>
                      {TIPOS_DOC.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Número de documento *</label>
                    <input
                      value={formData.numeroDocumento}
                      onChange={handleChange("numeroDocumento")}
                      placeholder="Ej: 1234567890"
                    />
                  </div>
                </div>
                <div className="adm-row">
                  <div className="adm-field adm-field-full">
                    <label>Correo electrónico</label>
                    <input
                      type="email"
                      value={formData.correo}
                      onChange={handleChange("correo")}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>
              </div>

              {/* Información de Facturación */}
              <div className="adm-fcard">
                <h3>Información de Facturación (Factus)</h3>
                <div className="adm-row">
                  <div className="adm-field">
                    <label>Organización legal</label>
                    <select value={organizacion} onChange={(e) => setOrganizacion(e.target.value)}>
                      <option>Persona Natural</option>
                      <option>Persona Jurídica</option>
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Régimen tributario</label>
                    <select value={regimen} onChange={(e) => setRegimen(e.target.value)}>
                      <option>No responsable de IVA</option>
                      <option>Responsable de IVA</option>
                    </select>
                  </div>
                </div>
                <div className="adm-row">
                  <div className="adm-field">
                    <label>Municipio</label>
                    <select value={municipio} onChange={(e) => setMunicipio(e.target.value)}>
                      <option value="">Seleccionar municipio</option>
                      {MUNICIPIOS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Dirección</label>
                    <input
                      value={formData.direccion}
                      onChange={handleChange("direccion")}
                      placeholder="Ej: Calle 45 # 12-30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="adm-save">
              <h3>Guardar</h3>
              <p>Los campos marcados con * son obligatorios para la facturación electrónica.</p>
              <button className="adm-btn-full" onClick={guardarCliente} disabled={!canSave}>
                <FiSave style={{ marginRight: 6 }} />
                Guardar Cliente
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

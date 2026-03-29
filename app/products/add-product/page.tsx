"use client";
import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { FiSave } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import "../../dashboard/admin.css";

interface Proveedor { id: string; nombre: string; tipo: string; estado: "Activo" | "Inactivo"; }

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

const MARCAS = ["Nivea","L'Oréal","Dove","Head & Shoulders","MAC","Maybelline","Bayer","Pfizer","Genérico"];
const ALMACENAMIENTOS = [
  "Temperatura ambiente","Refrigerado (2-8°C)","Protegido de la luz","Ambiente seco","Congelado",
];

const INITIAL = {
  nombre: "", referencia: "", precioCompra: 0, precioVenta: 0,
  iva: 19, categoria: "", marca: "", almacenamiento: "",
  estado: "Activo", stock: 0, stockMinimo: 5, proveedor: "", descripcion: "",
};

export default function AgregarProductoPage() {
  const { token, comercioId } = useAuth();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>("Productos");
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...INITIAL });
  const [imagenUrl, setImagenUrl] = useState<string>("");
  const [imagenNombre, setImagenNombre] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [catInput, setCatInput] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/proveedores`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setProveedores)
      .catch(() => setProveedores([]));
    const cid = comercioId;
    if (cid) {
      fetch(`${API}/productos/categorias?comercioId=${cid}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : [])
        .then(setCategorias)
        .catch(() => setCategorias([]));
    }
  }, [token, comercioId]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Parse Colombian number format: "824.950" → 824950, "1.234.567" → 1234567
  const parseNum = (v: string) => {
    const clean = v.replace(/\./g, "").replace(",", ".");
    return Number(clean);
  };

  const handleChange =
    (field: string) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const v = e.target.value;
      setForm(prev => ({
        ...prev,
        [field]: ["precioCompra","precioVenta","iva","stock","stockMinimo"].includes(field)
          ? parseNum(v) : v,
      }));
    };

  const handlePrecioCompra = (e: ChangeEvent<HTMLInputElement>) => {
    const pc = parseNum(e.target.value);
    const pv = Math.round(pc * (1 + form.iva / 100) * 1.4);
    setForm(prev => ({ ...prev, precioCompra: pc, precioVenta: pv }));
  };

  // Convert uploaded image to base64 and preview
  const handleImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("La imagen no puede superar 2 MB"); return; }
    setImagenNombre(file.name);
    const reader = new FileReader();
    reader.onload = ev => setImagenUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const guardar = async () => {
    if (!form.nombre || !form.referencia || !form.categoria) {
      alert("Complete los campos obligatorios (Nombre, Referencia, Categoría)"); return;
    }
    if (form.precioCompra <= 0) { alert("El precio de compra debe ser mayor a 0"); return; }
    if (form.precioVenta <= form.precioCompra) { alert("El precio de venta debe ser mayor al de compra"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, imagenUrl }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error al guardar");
      }
      router.push("/products/product-list");
    } catch (e: any) {
      alert(e.message || "Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  const limpiar = () => { setForm({ ...INITIAL }); setImagenUrl(""); setImagenNombre(""); };

  const canSave = !!form.nombre && !!form.referencia && !!form.categoria && form.precioCompra > 0;
  const valorIva = +(form.precioCompra * form.iva / 100).toFixed(2);

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">

        <header className="adm-header">
          <h1>📦 Agregar Producto</h1>
          <button className="adm-btn-secondary" style={{ width: "auto" }} onClick={() => router.push("/products/product-list")}>
            ← Volver
          </button>
        </header>

        <div className="adm-content">
          <div className="adm-form-layout">

            {/* ── LEFT COLUMN ── */}
            <div className="adm-form-left">

              {/* Información General */}
              <div className="adm-fcard">
                <h3>Información General</h3>
                <div className="adm-row">
                  <div className="adm-field">
                    <label>Nombre *</label>
                    <input value={form.nombre} onChange={handleChange("nombre")} placeholder="Ej: Crema Hidratante" />
                  </div>
                  <div className="adm-field">
                    <label>Referencia *</label>
                    <input value={form.referencia} onChange={handleChange("referencia")} placeholder="Ej: NIV-001" />
                  </div>
                </div>
                <div className="adm-row">
                  <div className="adm-field">
                    <label>Marca</label>
                    <select value={form.marca} onChange={handleChange("marca")}>
                      <option value="">Seleccionar marca</option>
                      {MARCAS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Categoría *</label>
                    <div ref={catRef} style={{ position: "relative" }}>
                      <input
                        value={catInput}
                        onChange={e => {
                          setCatInput(e.target.value);
                          setForm(prev => ({ ...prev, categoria: e.target.value }));
                          setCatOpen(true);
                        }}
                        onFocus={() => setCatOpen(true)}
                        placeholder="Escribe o selecciona una categoría"
                        autoComplete="off"
                      />
                      {catOpen && (
                        <div style={{
                          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
                          background: "white", border: "1px solid #d1d5db", borderRadius: 8,
                          boxShadow: "0 4px 12px rgba(0,0,0,.1)", maxHeight: 200, overflowY: "auto",
                        }}>
                          {categorias
                            .filter(c => c.toLowerCase().includes(catInput.toLowerCase()))
                            .map(c => (
                              <div key={c}
                                onMouseDown={() => { setCatInput(c); setForm(prev => ({ ...prev, categoria: c })); setCatOpen(false); }}
                                style={{ padding: "8px 12px", cursor: "pointer", fontSize: ".88rem" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#f0fdf4")}
                                onMouseLeave={e => (e.currentTarget.style.background = "white")}
                              >{c}</div>
                            ))
                          }
                          {catInput && !categorias.some(c => c.toLowerCase() === catInput.toLowerCase()) && (
                            <div
                              onMouseDown={() => { setCategorias(prev => [...prev, catInput]); setForm(prev => ({ ...prev, categoria: catInput })); setCatOpen(false); }}
                              style={{ padding: "8px 12px", cursor: "pointer", fontSize: ".88rem", color: "#00a88f", fontWeight: 600 }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#f0fdf4")}
                              onMouseLeave={e => (e.currentTarget.style.background = "white")}
                            >+ Crear categoría "{catInput}"</div>
                          )}
                          {categorias.length === 0 && !catInput && (
                            <div style={{ padding: "8px 12px", fontSize: ".82rem", color: "#aaa" }}>
                              Escribe para crear tu primera categoría
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="adm-row">
                  <div className="adm-field">
                    <label>Estado</label>
                    <select value={form.estado} onChange={handleChange("estado")}>
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Almacenamiento</label>
                    <select value={form.almacenamiento} onChange={handleChange("almacenamiento")}>
                      <option value="">Seleccionar condición</option>
                      {ALMACENAMIENTOS.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div className="adm-row">
                  <div className="adm-field adm-field-full">
                    <label>Descripción</label>
                    <textarea value={form.descripcion} onChange={handleChange("descripcion")} placeholder="Descripción del producto…" />
                  </div>
                </div>
              </div>

              {/* Precios & Inventario */}
              <div className="adm-fcard">
                <h3>Precios e Inventario</h3>
                <div className="adm-row">
                  <div className="adm-field">
                    <label>Precio de Compra *</label>
                    <input type="number" value={form.precioCompra} onChange={handlePrecioCompra} min="0" step="0.01" />
                  </div>
                  <div className="adm-field">
                    <label>Precio de Venta *</label>
                    <input type="number" value={form.precioVenta} onChange={handleChange("precioVenta")} min="0" step="0.01" />
                  </div>
                </div>
                <div className="adm-row">
                  <div className="adm-field">
                    <label>IVA (%)</label>
                    <input type="number" value={form.iva} onChange={handleChange("iva")} min="0" max="100" />
                  </div>
                  <div className="adm-field">
                    <label>Proveedor</label>
                    <select value={form.proveedor} onChange={handleChange("proveedor")}>
                      <option value="">Seleccionar proveedor</option>
                      {proveedores.filter(p => p.estado === "Activo").map(p => (
                        <option key={p.id} value={p.nombre}>{p.nombre} – {p.tipo}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="adm-row">
                  <div className="adm-field">
                    <label>Stock Inicial</label>
                    <input type="number" value={form.stock} onChange={handleChange("stock")} min="0" />
                  </div>
                  <div className="adm-field">
                    <label>Stock Mínimo</label>
                    <input type="number" value={form.stockMinimo} onChange={handleChange("stockMinimo")} min="0" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div>
              <div className="adm-fcard" style={{ marginBottom: 0 }}>
                <h3>Imagen del Producto</h3>

                {/* Preview or upload zone */}
                {imagenUrl ? (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid #eee", background: "#f7f8fa" }}>
                      <img
                        src={imagenUrl}
                        alt="preview"
                        style={{ width: "100%", height: 160, objectFit: "contain", display: "block" }}
                      />
                      <button
                        onClick={() => { setImagenUrl(""); setImagenNombre(""); }}
                        style={{ position: "absolute", top: 8, right: 8, background: "#ef4444", color: "white", border: "2px solid white", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,.3)", zIndex: 2 }}
                      >✕</button>
                    </div>
                    <div style={{ fontSize: ".72rem", color: "#888", marginTop: 6, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {imagenNombre}
                    </div>
                  </div>
                ) : (
                  <div
                    className="adm-img-upload"
                    onClick={() => fileRef.current?.click()}
                    style={{ cursor: "pointer" }}
                  >
                    <span style={{ fontSize: "2rem" }}>🖼️</span>
                    <span>Haz clic para subir imagen</span>
                    <span style={{ fontSize: ".75rem" }}>PNG, JPG, WEBP – máx 2 MB</span>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: "none" }}
                  onChange={handleImageFile}
                />

                {/* Price summary */}
                <div style={{ background: "#f7f8fa", borderRadius: 8, padding: "14px 16px", marginBottom: 16, marginTop: 12 }}>
                  <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#1F3B4D", marginBottom: 10 }}>Resumen de Precios</div>
                  {[
                    ["Precio Compra", `$${form.precioCompra.toLocaleString("es-CO")}`],
                    ["IVA", `${form.iva}%`],
                    ["Valor IVA", `$${valorIva.toLocaleString("es-CO")}`],
                    ["Precio Venta", `$${form.precioVenta.toLocaleString("es-CO")}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: ".83rem", marginBottom: 6 }}>
                      <span style={{ color: "#666" }}>{k}</span>
                      <strong style={{ color: "#1F3B4D" }}>{v}</strong>
                    </div>
                  ))}
                </div>

                <button className="adm-btn-full" onClick={guardar} disabled={!canSave || saving}>
                  <FiSave style={{ marginRight: 6 }} />
                  {saving ? "Guardando…" : "Guardar Producto"}
                </button>
                <button className="adm-btn-full-sec" onClick={limpiar} style={{ marginTop: 8 }}>
                  Limpiar Formulario
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

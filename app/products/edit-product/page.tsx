"use client";
import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { FiSave } from "react-icons/fi";
import Sidebar from "../../dashboard/Sidebar";
import "../../dashboard/dashboard.css";
import "../../dashboard/admin.css";

interface Proveedor { id: string; nombre: string; tipo: string; estado: "Activo" | "Inactivo"; }

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";


export default function EditarProductoPage() {
  const { token, comercioId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productoId = searchParams.get("id");

  const [activeMenu, setActiveMenu] = useState<string | null>("Productos");
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [catInput, setCatInput] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [marcaInput, setMarcaInput] = useState("");
  const [marcaOpen, setMarcaOpen] = useState(false);
  const marcaRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "", referencia: "", precioCompra: 0, precioVenta: 0,
    iva: 19, categoria: "", marca: "",
    estado: "Activo", stock: 0, stockMinimo: 5, proveedor: "", descripcion: "",
  });
  const [imagenUrl, setImagenUrl] = useState<string>("");
  const [imagenNombre, setImagenNombre] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
      if (marcaRef.current && !marcaRef.current.contains(e.target as Node)) setMarcaOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!token || !productoId) return;
    if (comercioId) {
      fetch(`${API}/productos/categorias?comercioId=${comercioId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []).then(setCategorias).catch(() => setCategorias([]));
      fetch(`${API}/productos/marcas?comercioId=${comercioId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []).then(setMarcas).catch(() => setMarcas([]));
    }

    Promise.all([
      fetch(`${API}/productos/${productoId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null),
      fetch(`${API}/proveedores`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([prod, provs]) => {
      setProveedores(provs);
      if (prod) {
        setCatInput(prod.categoria || "");
        setMarcaInput(prod.marca || "");
        setForm({
          nombre:        prod.nombre        || "",
          referencia:    prod.referencia    || "",
          precioCompra:  prod.precioCompra  || 0,
          precioVenta:   prod.precioVenta   || 0,
          iva:           prod.iva           ?? 19,
          categoria:     prod.categoria     || "",
          marca:         prod.marca         || "",
          estado:        prod.estado        || "Activo",
          stock:         prod.stock         ?? 0,
          stockMinimo:   prod.stockMinimo   ?? 5,
          proveedor:     prod.proveedor     || "",
          descripcion:   prod.descripcion   || "",
        });
        if (prod.imagenUrl) {
          setImagenUrl(prod.imagenUrl);
          setImagenNombre("imagen actual");
        }
      } else {
        alert("No se pudo cargar el producto");
        router.push("/products/product-list");
      }
    }).finally(() => setLoading(false));
  }, [token, productoId]);

  // Parse Colombian number format: "824.950" → 824950
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
      const res = await fetch(`${API}/productos/${productoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, imagenUrl }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message || "Error al guardar");
      }
      router.push("/products/product-list");
    } catch (e: any) {
      alert(e.message || "Error al actualizar el producto");
    } finally {
      setSaving(false);
    }
  };

  const valorIva = +(form.precioCompra * form.iva / 100).toFixed(2);
  const formatPrecio = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

  if (loading) return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#888" }}>Cargando producto…</p>
      </main>
    </div>
  );

  return (
    <div className="dashboard-page">
      <Sidebar activeMenu={activeMenu} onMenuToggle={setActiveMenu} />
      <main className="dashboard-main">

        <header className="adm-header">
          <h1>✏️ Editar Producto</h1>
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
                    <div ref={marcaRef} style={{ position: "relative" }}>
                      <input
                        value={marcaInput}
                        onChange={e => { setMarcaInput(e.target.value); setForm(prev => ({ ...prev, marca: e.target.value })); setMarcaOpen(true); }}
                        onFocus={() => setMarcaOpen(true)}
                        placeholder="Escribe o selecciona una marca"
                        autoComplete="off"
                      />
                      {marcaOpen && (
                        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: "white", border: "1px solid #d1d5db", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,.1)", maxHeight: 200, overflowY: "auto" }}>
                          {marcas.filter(m => m.toLowerCase().includes(marcaInput.toLowerCase())).map(m => (
                            <div key={m} onMouseDown={() => { setMarcaInput(m); setForm(prev => ({ ...prev, marca: m })); setMarcaOpen(false); }}
                              style={{ padding: "8px 12px", cursor: "pointer", fontSize: ".88rem" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#f0fdf4")}
                              onMouseLeave={e => (e.currentTarget.style.background = "white")}
                            >{m}</div>
                          ))}
                          {marcaInput && !marcas.some(m => m.toLowerCase() === marcaInput.toLowerCase()) && (
                            <div onMouseDown={() => { setMarcas(prev => [...prev, marcaInput]); setForm(prev => ({ ...prev, marca: marcaInput })); setMarcaOpen(false); }}
                              style={{ padding: "8px 12px", cursor: "pointer", fontSize: ".88rem", color: "#00a88f", fontWeight: 600 }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#f0fdf4")}
                              onMouseLeave={e => (e.currentTarget.style.background = "white")}
                            >+ Crear marca "{marcaInput}"</div>
                          )}
                          {marcas.length === 0 && !marcaInput && (
                            <div style={{ padding: "8px 12px", fontSize: ".82rem", color: "#aaa" }}>Escribe para crear tu primera marca</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="adm-field">
                    <label>Estado</label>
                    <select value={form.estado} onChange={handleChange("estado")}>
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
                <div className="adm-row">
                  <div className="adm-field adm-field-full">
                    <label>Categoría *</label>
                    <div ref={catRef} style={{ position: "relative" }}>
                      <input
                        value={catInput}
                        onChange={e => { setCatInput(e.target.value); setForm(prev => ({ ...prev, categoria: e.target.value })); setCatOpen(true); }}
                        onFocus={() => setCatOpen(true)}
                        placeholder="Escribe o selecciona una categoría"
                        autoComplete="off"
                      />
                      {catOpen && (
                        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: "white", border: "1px solid #d1d5db", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,.1)", maxHeight: 200, overflowY: "auto" }}>
                          {categorias.filter(c => c.toLowerCase().includes(catInput.toLowerCase())).map(c => (
                            <div key={c} onMouseDown={() => { setCatInput(c); setForm(prev => ({ ...prev, categoria: c })); setCatOpen(false); }}
                              style={{ padding: "8px 12px", cursor: "pointer", fontSize: ".88rem" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#f0fdf4")}
                              onMouseLeave={e => (e.currentTarget.style.background = "white")}
                            >{c}</div>
                          ))}
                          {catInput && !categorias.some(c => c.toLowerCase() === catInput.toLowerCase()) && (
                            <div onMouseDown={() => { setCategorias(prev => [...prev, catInput]); setForm(prev => ({ ...prev, categoria: catInput })); setCatOpen(false); }}
                              style={{ padding: "8px 12px", cursor: "pointer", fontSize: ".88rem", color: "#00a88f", fontWeight: 600 }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#f0fdf4")}
                              onMouseLeave={e => (e.currentTarget.style.background = "white")}
                            >+ Crear categoría "{catInput}"</div>
                          )}
                          {categorias.length === 0 && !catInput && (
                            <div style={{ padding: "8px 12px", fontSize: ".82rem", color: "#aaa" }}>Escribe para crear tu primera categoría</div>
                          )}
                        </div>
                      )}
                    </div>
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
                    <input type="number" value={form.precioCompra} onChange={handlePrecioCompra} min="0" step="1" />
                  </div>
                  <div className="adm-field">
                    <label>Precio de Venta *</label>
                    <input type="number" value={form.precioVenta} onChange={handleChange("precioVenta")} min="0" step="1" />
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
                    <label>Stock Actual</label>
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

                {imagenUrl ? (
                  <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "2px dashed #e0e0e0", marginBottom: 8 }}>
                    <img
                      src={imagenUrl} alt="preview"
                      style={{ width: "100%", maxHeight: 220, objectFit: "contain", display: "block", background: "#f7f8fa", cursor: "pointer" }}
                      onClick={() => fileRef.current?.click()}
                    />
                    <button
                      onClick={e => { e.stopPropagation(); setImagenUrl(""); setImagenNombre(""); }}
                      style={{
                        position: "absolute", top: 8, right: 8,
                        width: 28, height: 28, borderRadius: "50%",
                        background: "#ef4444", color: "white", border: "2px solid white",
                        cursor: "pointer", fontSize: ".8rem", fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 6px rgba(0,0,0,.25)", zIndex: 2,
                      }}
                    >✕</button>
                    <p style={{ fontSize: ".72rem", color: "#888", textAlign: "center", padding: "6px 0", margin: 0 }}>{imagenNombre}</p>
                  </div>
                ) : (
                  <div
                    className="adm-img-upload"
                    onClick={() => fileRef.current?.click()}
                    style={{ cursor: "pointer", marginBottom: 8 }}
                  >
                    <div className="adm-img-placeholder">📷</div>
                    <p className="adm-img-hint">Haz clic para subir imagen</p>
                    <p className="adm-img-hint2">PNG, JPG, WEBP · Máx 2 MB</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageFile} />

                {/* Resumen de precios */}
                <div className="adm-price-summary">
                  <h4>Resumen de Precios</h4>
                  <div className="adm-price-row"><span>Precio Compra</span><strong>{formatPrecio(form.precioCompra)}</strong></div>
                  <div className="adm-price-row"><span>IVA</span><strong>{form.iva}%</strong></div>
                  <div className="adm-price-row"><span>Valor IVA</span><strong>{formatPrecio(valorIva)}</strong></div>
                  <div className="adm-price-row adm-price-total"><span>Precio Venta</span><strong>{formatPrecio(form.precioVenta)}</strong></div>
                </div>

                <button
                  className="adm-btn-save"
                  onClick={guardar}
                  disabled={saving || !form.nombre || !form.referencia || !form.categoria || form.precioCompra <= 0}
                >
                  {saving ? "Guardando…" : <><FiSave /> Guardar Cambios</>}
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

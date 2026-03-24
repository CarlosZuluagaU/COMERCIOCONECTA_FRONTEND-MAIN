"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
import "./customizer.css";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

const PALETTES = [
  { p: "#1F3B4D", a: "#00d4aa" },
  { p: "#7c3aed", a: "#a78bfa" },
  { p: "#b91c1c", a: "#fca5a5" },
  { p: "#065f46", a: "#6ee7b7" },
  { p: "#1e40af", a: "#93c5fd" },
  { p: "#92400e", a: "#fbbf24" },
  { p: "#831843", a: "#f9a8d4" },
  { p: "#134e4a", a: "#5eead4" },
  { p: "#1c1917", a: "#d4d4d4" },
  { p: "#0f172a", a: "#38bdf8" },
  { p: "#4a1d96", a: "#c4b5fd" },
  { p: "#064e3b", a: "#34d399" },
];

const FONTS = [
  // Sans-serif modernas
  { label: "Segoe UI",         css: "'Segoe UI', system-ui, sans-serif",   desc: "Limpia y moderna",        google: null },
  { label: "Inter",            css: "'Inter', sans-serif",                 desc: "Minimalista y técnica",   google: "Inter" },
  { label: "Poppins",          css: "'Poppins', sans-serif",               desc: "Geométrica y amigable",   google: "Poppins" },
  { label: "Montserrat",       css: "'Montserrat', sans-serif",            desc: "Elegante y profesional",  google: "Montserrat" },
  { label: "Lato",             css: "'Lato', sans-serif",                  desc: "Neutra y versátil",       google: "Lato" },
  { label: "Roboto",           css: "'Roboto', sans-serif",                desc: "Técnica y legible",       google: "Roboto" },
  { label: "DM Sans",          css: "'DM Sans', sans-serif",               desc: "Moderna y compacta",      google: "DM+Sans" },
  { label: "Outfit",           css: "'Outfit', sans-serif",                desc: "Fresca y contemporánea",  google: "Outfit" },
  { label: "Nunito",           css: "'Nunito', sans-serif",                desc: "Redondeada y juvenil",    google: "Nunito" },
  { label: "Quicksand",        css: "'Quicksand', sans-serif",             desc: "Suave y amigable",        google: "Quicksand" },
  { label: "Raleway",          css: "'Raleway', sans-serif",               desc: "Artística y original",    google: "Raleway" },
  { label: "Oswald",           css: "'Oswald', sans-serif",                desc: "Compacta y llamativa",    google: "Oswald" },
  { label: "Ubuntu",           css: "'Ubuntu', sans-serif",                desc: "Humanista y legible",     google: "Ubuntu" },
  { label: "Josefin Sans",     css: "'Josefin Sans', sans-serif",          desc: "Geométrica y delgada",    google: "Josefin+Sans" },
  { label: "Cabin",            css: "'Cabin', sans-serif",                 desc: "Humanista y cálida",      google: "Cabin" },
  // Serif
  { label: "Playfair Display", css: "'Playfair Display', serif",           desc: "Lujosa y editorial",      google: "Playfair+Display" },
  { label: "Merriweather",     css: "'Merriweather', serif",               desc: "Clásica y legible",       google: "Merriweather" },
  { label: "Lora",             css: "'Lora', serif",                       desc: "Elegante y literaria",    google: "Lora" },
  { label: "Georgia",          css: "Georgia, serif",                      desc: "Serif clásica",           google: null },
  // Monospace
  { label: "Courier New",      css: "'Courier New', monospace",            desc: "Técnica / código",        google: null },
];

function loadGoogleFont(family: string | null) {
  if (!family) return;
  const id = `gfont-${family}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@400;600;700;800&display=swap`;
  document.head.appendChild(link);
}

type DeviceMode = "desktop" | "tablet" | "mobile";
type TabId = "design" | "content" | "advanced";

interface Config {
  nombre: string;
  tagline: string;
  logoUrl: string;
  colorPrimario: string;
  colorAcento: string;
  colorTexto: string;
  colorTextoSecundario: string;
  colorTextoBoton: string;
  colorBoton: string;
  colorBotonCta: string;
  colorBanner: string;
  fontFamily: string;
  buttonRadius: string;
  cardRadius: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  categorias: string;
  footerTexto: string;
  footerTelefono: string;
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  whatsapp: string;
  customCss: string;
}

const DEFAULT_CFG: Config = {
  nombre:               "MiComercio",
  tagline:              "Tu tienda de confianza",
  logoUrl:              "",
  colorPrimario:        "#1F3B4D",
  colorAcento:          "#00d4aa",
  colorTexto:           "#1F3B4D",
  colorTextoSecundario: "#666666",
  colorTextoBoton:      "#ffffff",
  colorBoton:           "#1F3B4D",
  colorBotonCta:        "#00d4aa",
  colorBanner:          "#1F3B4D",
  fontFamily:           "'Segoe UI', system-ui, sans-serif",
  buttonRadius:         "50px",
  cardRadius:           "12px",
  heroTitle:      "Descubre tu belleza interior",
  heroSubtitle:   "Productos de calidad premium · Envíos rápidos · Precios increíbles",
  heroCta:        "Explorar Productos",
  categorias:     "Todos, Cuidado Personal, Cuidado Capilar, Maquillaje, Medicamentos",
  footerTexto:    "© 2026 MiComercio. Todos los derechos reservados.",
  footerTelefono: "📞 +57 300 123 4567",
  facebook:       "",
  instagram:      "",
  twitter:        "",
  tiktok:         "",
  whatsapp:       "",
  customCss:      "",
};

// Collapsible section component
function Section({
  icon, bg, title, subtitle, defaultOpen, children,
}: {
  icon: string; bg: string; title: string; subtitle: string;
  defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="cust-section">
      <div className="cust-section-hdr" onClick={() => setOpen(o => !o)}>
        <div className="cust-section-hdr-left">
          <div className="cust-section-icon" style={{ background: bg }}>{icon}</div>
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
        </div>
        <span className={`cust-chevron${open ? " open" : ""}`}>▼</span>
      </div>
      <div className={`cust-section-body${open ? "" : " hidden"}`}>
        {children}
      </div>
    </div>
  );
}

export default function StoreCustomizerPage() {
  const router = useRouter();
  const { comercioId, authLoaded } = useAuth();
  const [CID, setCID] = useState<number>(1);
  const [cfg, setCfg]             = useState<Config>(DEFAULT_CFG);
  const [device, setDevice]       = useState<DeviceMode>("desktop");
  const [tab, setTab]             = useState<TabId>("design");
  const [panelOpen, setPanelOpen] = useState(true);
  const [saved, setSaved]         = useState(false);
  const [saving, setSaving]       = useState(false);
  const [unsaved, setUnsaved]     = useState(false);
  const fileRef                   = useRef<HTMLInputElement>(null);

  // Resolve comercioId — esperar authLoaded para no usar fallback erróneo
  useEffect(() => {
    if (!authLoaded) return;
    const id = comercioId ?? 1;
    setCID(id);
  }, [authLoaded, comercioId]);

  // Load saved config from API on mount
  useEffect(() => {
    if (!CID || !authLoaded) return;
    // Resetear CSS vars del DOM para que el preview parta de defaults
    document.documentElement.style.removeProperty("--sp-primary");
    document.documentElement.style.removeProperty("--sp-accent");
    fetch(`${API}/comercios/${CID}/apariencia`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const fontEntry = FONTS.find(f => f.css === (data.fontFamily || DEFAULT_CFG.fontFamily));
        if (fontEntry?.google) loadGoogleFont(fontEntry.google);
        setCfg({
          nombre:               data.nombre               || DEFAULT_CFG.nombre,
          tagline:              data.tagline              || DEFAULT_CFG.tagline,
          logoUrl:              data.logoUrl              || "",
          colorPrimario:        data.colorPrimario        || DEFAULT_CFG.colorPrimario,
          colorAcento:          data.colorAcento          || DEFAULT_CFG.colorAcento,
          colorTexto:           data.colorTexto           || DEFAULT_CFG.colorTexto,
          colorTextoSecundario: data.colorTextoSecundario || DEFAULT_CFG.colorTextoSecundario,
          colorTextoBoton:      data.colorTextoBoton      || DEFAULT_CFG.colorTextoBoton,
          colorBoton:           data.colorBoton           || DEFAULT_CFG.colorBoton,
          colorBotonCta:        data.colorBotonCta        || DEFAULT_CFG.colorBotonCta,
          colorBanner:          data.colorBanner          || DEFAULT_CFG.colorBanner,
          fontFamily:           data.fontFamily           || DEFAULT_CFG.fontFamily,
          buttonRadius:         data.buttonRadius         || DEFAULT_CFG.buttonRadius,
          cardRadius:           data.cardRadius           || DEFAULT_CFG.cardRadius,
          heroTitle:      data.heroTitle      || DEFAULT_CFG.heroTitle,
          heroSubtitle:   data.heroSubtitle   || DEFAULT_CFG.heroSubtitle,
          heroCta:        data.heroCta        || DEFAULT_CFG.heroCta,
          categorias:     data.categorias     || DEFAULT_CFG.categorias,
          footerTexto:    data.footerTexto    || DEFAULT_CFG.footerTexto,
          footerTelefono: data.footerTelefono || DEFAULT_CFG.footerTelefono,
          facebook:       data.facebook       || "",
          instagram:      data.instagram      || "",
          twitter:        data.twitter        || "",
          tiktok:         data.tiktok         || "",
          whatsapp:       data.whatsapp       || "",
          customCss:      data.customCss      || "",
        });
      })
      .catch(() => {});
  }, [CID]);

  const update = useCallback((patch: Partial<Config>) => {
    setCfg(prev => ({ ...prev, ...patch }));
    setUnsaved(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch(`${API}/comercios/${CID}/apariencia`, {
        method: "PUT",
        headers,
        body: JSON.stringify(cfg),
      });
      localStorage.setItem("storeConfig", JSON.stringify(cfg));
      setSaved(true);
      setUnsaved(false);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(true);
      setUnsaved(false);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => update({ logoUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const categories = cfg.categorias.split(",").map(c => c.trim()).filter(Boolean);
  const slug = cfg.nombre.toLowerCase().replace(/\s+/g, "-");

  const previewStyle: React.CSSProperties = {
    "--sp-primary":      cfg.colorPrimario,
    "--sp-accent":       cfg.colorAcento,
    "--sp-font":         cfg.fontFamily,
    "--sp-radius-btn":   cfg.buttonRadius,
    "--sp-radius-card":  cfg.cardRadius,
    "--sp-texto":        cfg.colorTexto,
    "--sp-texto-sec":    cfg.colorTextoSecundario,
    "--sp-texto-btn":    cfg.colorTextoBoton,
    "--sp-btn":          cfg.colorBoton,
    "--sp-btn-cta":      cfg.colorBotonCta,
    "--sp-banner":       cfg.colorBanner,
    fontFamily:          cfg.fontFamily,
  } as React.CSSProperties;

  return (
    <div className="cust-root">

      {/* ═══════════ TOP BAR ═══════════ */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <button className="cust-back-link" onClick={() => router.push("/dashboard")}>← Dashboard</button>
          <div className="cust-divider" />
          <h1>Personalizador de <span>Tienda</span></h1>
        </div>
        <div className="cust-topbar-right">
          <div className="cust-device-btns">
            {(["desktop", "tablet", "mobile"] as DeviceMode[]).map(d => (
              <button
                key={d}
                className={`cust-dev-btn${device === d ? " active" : ""}`}
                onClick={() => setDevice(d)}
              >
                {d === "desktop" ? "🖥️" : d === "tablet" ? "📱" : "📲"}
              </button>
            ))}
          </div>
          <button
            className="cust-btn-preview"
            onClick={() => {
              localStorage.setItem("storeConfig", JSON.stringify(cfg));
              window.open("/store", "_blank");
            }}
          >
            👁 Vista previa
          </button>
          <button
            className={`cust-btn-save${saved ? " saved" : ""}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saved ? "✓ Guardado" : saving ? "Guardando…" : "💾 Guardar cambios"}
          </button>
        </div>
      </div>

      {/* ═══════════ LAYOUT ═══════════ */}
      <div className="cust-layout" style={{ position: "relative" }}>

        {/* ── LEFT PANEL ── */}
        <div className={`cust-panel${panelOpen ? "" : " collapsed"}`}>

          {/* Tabs inside panel – exactly like mockup */}
          <div className="cust-panel-tabs">
            {(["design", "content", "advanced"] as TabId[]).map(t => (
              <button
                key={t}
                className={`cust-ptab${tab === t ? " active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "design" ? "🎨 Diseño" : t === "content" ? "📝 Contenido" : "⚙️ Avanzado"}
              </button>
            ))}
          </div>

          <div className="cust-panel-body">

            {/* ════ TAB: DISEÑO ════ */}
            {tab === "design" && (
              <>
                <Section icon="🏪" bg="#e0f2fe" title="Identidad de Marca" subtitle="Logo, nombre y slogan" defaultOpen>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">Logo de la tienda</label>
                    <div className="cust-logo-preview">
                      {cfg.logoUrl ? <img src={cfg.logoUrl} alt="logo" /> : <span>🛍️</span>}
                    </div>
                    <div className="cust-upload-zone" onClick={() => fileRef.current?.click()}>
                      <div className="cust-upload-icon">📷</div>
                      <strong>Subir logo</strong>
                      <p>PNG o SVG transparente · Máx 2MB</p>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoFile} />
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">Nombre de la tienda</label>
                    <input className="cust-input" value={cfg.nombre} onChange={e => update({ nombre: e.target.value })} />
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">Eslogan / tagline</label>
                    <input className="cust-input" value={cfg.tagline} onChange={e => update({ tagline: e.target.value })} />
                  </div>
                </Section>

                <Section icon="🎨" bg="#fef9c3" title="Colores" subtitle="Paleta principal de la tienda" defaultOpen>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Color primario <span className="cust-ctrl-hint">(header, botones CTA)</span>
                    </label>
                    <div className="cust-color-row">
                      <input
                        type="color"
                        className="cust-color-swatch"
                        value={cfg.colorPrimario}
                        onChange={e => update({ colorPrimario: e.target.value })}
                      />
                      <div className="cust-color-value">{cfg.colorPrimario}</div>
                    </div>
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Color de acento <span className="cust-ctrl-hint">(detalles, badges)</span>
                    </label>
                    <div className="cust-color-row">
                      <input
                        type="color"
                        className="cust-color-swatch"
                        value={cfg.colorAcento}
                        onChange={e => update({ colorAcento: e.target.value })}
                      />
                      <div className="cust-color-value">{cfg.colorAcento}</div>
                    </div>
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">Paletas predefinidas</label>
                    <div className="cust-palette-grid">
                      {PALETTES.map(pal => (
                        <div
                          key={pal.p}
                          className={`cust-palette-color${cfg.colorPrimario === pal.p ? " selected" : ""}`}
                          style={{ background: pal.p }}
                          title={pal.p}
                          onClick={() => update({ colorPrimario: pal.p, colorAcento: pal.a, colorBoton: pal.p, colorBotonCta: pal.a, colorBanner: pal.p })}
                        />
                      ))}
                    </div>
                  </div>
                </Section>

                <Section icon="🔘" bg="#d1fae5" title="Colores de Botones" subtitle="Color de fondo de cada tipo de botón">
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Botón "Agregar al carrito" <span className="cust-ctrl-hint">(tarjetas de producto)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorBoton}
                        onChange={e => update({ colorBoton: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorBoton}</div>
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {([[cfg.colorPrimario,"Primario"],[cfg.colorAcento,"Acento"],["#10b981","Verde"],["#7c3aed","Morado"],["#dc2626","Rojo"],["#000000","Negro"]] as [string,string][]).map(([c,l]) => (
                        <div key={c} onClick={() => update({ colorBoton: c })}
                          style={{ cursor:"pointer", padding:"4px 10px", borderRadius:6, fontSize:".72rem", fontWeight:700,
                            background:c, color: c==="#ffffff"?"#333":"#fff",
                            border: cfg.colorBoton===c?"2px solid #333":"2px solid transparent" }}>{l}</div>
                      ))}
                    </div>
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Botón CTA <span className="cust-ctrl-hint">(Explorar, Pagar, Confirmar)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorBotonCta}
                        onChange={e => update({ colorBotonCta: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorBotonCta}</div>
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {([[cfg.colorPrimario,"Primario"],[cfg.colorAcento,"Acento"],["#10b981","Verde"],["#f59e0b","Amarillo"],["#7c3aed","Morado"],["#000000","Negro"]] as [string,string][]).map(([c,l]) => (
                        <div key={c} onClick={() => update({ colorBotonCta: c })}
                          style={{ cursor:"pointer", padding:"4px 10px", borderRadius:6, fontSize:".72rem", fontWeight:700,
                            background:c, color: c==="#ffffff"?"#333":"#fff",
                            border: cfg.colorBotonCta===c?"2px solid #333":"2px solid transparent" }}>{l}</div>
                      ))}
                    </div>
                  </div>
                </Section>

                <Section icon="🖼" bg="#fce7f3" title="Color del Banner" subtitle="Fondo del hero / portada de la tienda">
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Color del banner <span className="cust-ctrl-hint">(sección principal de la tienda)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorBanner}
                        onChange={e => update({ colorBanner: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorBanner}</div>
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {([[cfg.colorPrimario,"Primario"],[cfg.colorAcento,"Acento"],["#7c3aed","Morado"],["#b91c1c","Rojo"],["#065f46","Verde"],["#0f172a","Oscuro"]] as [string,string][]).map(([c,l]) => (
                        <div key={c} onClick={() => update({ colorBanner: c })}
                          style={{ cursor:"pointer", padding:"4px 10px", borderRadius:6, fontSize:".72rem", fontWeight:700,
                            background:c, color:"#fff",
                            border: cfg.colorBanner===c?"2px solid #333":"2px solid transparent" }}>{l}</div>
                      ))}
                    </div>
                    <div style={{
                      marginTop: 10, borderRadius: 8, height: 40,
                      background: `linear-gradient(135deg, ${cfg.colorBanner} 0%, ${cfg.colorBanner} 60%, ${cfg.colorBotonCta} 100%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: ".75rem", fontWeight: 700, color: "white",
                    }}>
                      Vista previa del banner
                    </div>
                  </div>
                </Section>

                <Section icon="🔤" bg="#ede9fe" title="Tipografía" subtitle="Fuente de la tienda">
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">Fuente</label>
                    <select
                      className="cust-input"
                      value={cfg.fontFamily}
                      onChange={e => {
                        const selected = FONTS.find(f => f.css === e.target.value);
                        if (selected?.google) loadGoogleFont(selected.google);
                        update({ fontFamily: e.target.value });
                      }}
                    >
                      {FONTS.map(f => (
                        <option key={f.css} value={f.css}>{f.label} — {f.desc}</option>
                      ))}
                    </select>
                    <div style={{
                      fontFamily: cfg.fontFamily,
                      marginTop: 8, padding: "8px 12px",
                      background: "#f4f6f8", borderRadius: 8,
                      fontSize: ".82rem", fontWeight: 600, color: cfg.colorPrimario,
                    }}>
                      Aa Bb — La tienda se verá con esta fuente
                    </div>
                  </div>
                </Section>

                <Section icon="🖋" bg="#fce7f3" title="Colores de Texto" subtitle="Color de títulos, descripciones y botones">
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Texto principal <span className="cust-ctrl-hint">(títulos, precios)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorTexto}
                        onChange={e => update({ colorTexto: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorTexto}</div>
                    </div>
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Texto secundario <span className="cust-ctrl-hint">(marca, descripción)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorTextoSecundario}
                        onChange={e => update({ colorTextoSecundario: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorTextoSecundario}</div>
                    </div>
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Texto en botones <span className="cust-ctrl-hint">(letras dentro de botones)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorTextoBoton}
                        onChange={e => update({ colorTextoBoton: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorTextoBoton}</div>
                    </div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                      {([["#ffffff","Blanco"],["#000000","Negro"],[cfg.colorPrimario,"Primario"],[cfg.colorAcento,"Acento"]] as [string,string][]).map(([color,label]) => (
                        <div key={color} onClick={() => update({ colorTextoBoton: color })}
                          style={{ cursor: "pointer", padding: "5px 10px", borderRadius: 6, fontSize: ".72rem", fontWeight: 700,
                            background: color, color: color === "#ffffff" ? "#333" : "#fff",
                            border: cfg.colorTextoBoton === color ? "2px solid #333" : "2px solid transparent" }}>
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>

                <Section icon="⬛" bg="#d1fae5" title="Estilo de Componentes" subtitle="Bordes de botones y tarjetas">
                  <label className="cust-ctrl-label">Estilo de botones</label>
                  <div className="cust-style-grid">
                    {[
                      { label: "Redondeado", val: "50px" },
                      { label: "Suave",      val: "8px"  },
                      { label: "Cuadrado",   val: "2px"  },
                      { label: "Sin borde",  val: "0px"  },
                    ].map(opt => (
                      <div
                        key={opt.val}
                        className={`cust-style-opt${cfg.buttonRadius === opt.val ? " selected" : ""}`}
                        onClick={() => update({ buttonRadius: opt.val })}
                      >
                        <span className="cust-preview-btn-demo" style={{ borderRadius: opt.val }}>
                          Comprar
                        </span>
                        <small>{opt.label}</small>
                      </div>
                    ))}
                  </div>
                  <label className="cust-ctrl-label" style={{ marginTop: 10 }}>Estilo de tarjetas</label>
                  <div className="cust-style-grid">
                    {[
                      { label: "Redondeada", val: "12px" },
                      { label: "Sutil",      val: "4px"  },
                      { label: "Cuadrada",   val: "0px"  },
                    ].map(opt => (
                      <div
                        key={opt.val}
                        className={`cust-style-opt${cfg.cardRadius === opt.val ? " selected" : ""}`}
                        onClick={() => update({ cardRadius: opt.val })}
                      >
                        <div style={{ background: "#f0f4f8", borderRadius: opt.val, height: 30 }} />
                        <small>{opt.label}</small>
                      </div>
                    ))}
                  </div>
                </Section>
              </>
            )}

            {/* ════ TAB: CONTENIDO ════ */}
            {tab === "content" && (
              <>
                <Section icon="🖼" bg="#fef9c3" title="Banner Principal" subtitle="Encabezado de la tienda" defaultOpen>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">Título del hero</label>
                    <input className="cust-input" value={cfg.heroTitle} onChange={e => update({ heroTitle: e.target.value })} />
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">Subtítulo</label>
                    <textarea className="cust-textarea" value={cfg.heroSubtitle} onChange={e => update({ heroSubtitle: e.target.value })} />
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">Texto del botón CTA</label>
                    <input className="cust-input" value={cfg.heroCta} onChange={e => update({ heroCta: e.target.value })} />
                  </div>
                </Section>

                <Section icon="🗂" bg="#dbeafe" title="Categorías de Navegación" subtitle="Menú horizontal de la tienda" defaultOpen>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Categorías visibles <span className="cust-ctrl-hint">(separar con coma)</span>
                    </label>
                    <textarea className="cust-textarea" value={cfg.categorias} onChange={e => update({ categorias: e.target.value })} />
                  </div>
                </Section>

                <Section icon="🔗" bg="#ede9fe" title="Pie de Página" subtitle="Footer e información de contacto" defaultOpen>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">Texto del footer</label>
                    <input className="cust-input" value={cfg.footerTexto} onChange={e => update({ footerTexto: e.target.value })} />
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">Teléfono / WhatsApp</label>
                    <input className="cust-input" value={cfg.footerTelefono} onChange={e => update({ footerTelefono: e.target.value })} />
                  </div>
                </Section>

                <Section icon="📱" bg="#dbeafe" title="Redes Sociales" subtitle="Solo aparecen si tienen enlace">
                  {[
                    { key: "facebook",  label: "Facebook",    Icon: FaFacebook,  color: "#1877f2", placeholder: "https://facebook.com/micomercio" },
                    { key: "instagram", label: "Instagram",   Icon: FaInstagram, color: "#e1306c", placeholder: "https://instagram.com/micomercio" },
                    { key: "twitter",   label: "X / Twitter", Icon: FaXTwitter,  color: "#000",    placeholder: "https://x.com/micomercio" },
                    { key: "tiktok",    label: "TikTok",      Icon: FaTiktok,    color: "#010101", placeholder: "https://tiktok.com/@micomercio" },
                    { key: "whatsapp",  label: "WhatsApp",    Icon: FaWhatsapp,  color: "#25d366", placeholder: "https://wa.me/573001234567" },
                  ].map(({ key, label, Icon, color, placeholder }) => (
                    <div className="cust-ctrl-group" key={key}>
                      <label className="cust-ctrl-label">
                        <Icon style={{ color, marginRight: 5, verticalAlign: "middle" }} /> {label}
                      </label>
                      <input
                        className="cust-input"
                        type="url"
                        placeholder={placeholder}
                        value={(cfg as any)[key]}
                        onChange={e => update({ [key]: e.target.value } as any)}
                      />
                    </div>
                  ))}
                </Section>
              </>
            )}

            {/* ════ TAB: AVANZADO ════ */}
            {tab === "advanced" && (
              <>
                <Section icon="💻" bg="#fef2f2" title="CSS Personalizado" subtitle="Para usuarios avanzados" defaultOpen>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">CSS adicional</label>
                    <textarea
                      className="cust-textarea code"
                      value={cfg.customCss}
                      onChange={e => update({ customCss: e.target.value })}
                      placeholder={"/* Escribe tu CSS personalizado aquí */\n.sp-hero { padding: 60px 24px; }\n.sp-card { box-shadow: none; }"}
                    />
                  </div>
                </Section>

                <Section icon="🔗" bg="#d1fae5" title="Dominio Personalizado" subtitle="URL de la tienda" defaultOpen>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">URL actual</label>
                    <div className="cust-url-box">comerciosconecta.com/tienda/{slug}</div>
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">Dominio propio (próximamente)</label>
                    <input
                      className="cust-input"
                      type="url"
                      placeholder="www.micomercio.com"
                      disabled
                      style={{ background: "#f7f8fa", color: "#aaa" }}
                    />
                  </div>
                </Section>
              </>
            )}
          </div>
        </div>

        {/* Panel toggle slider */}
        <button
          className={`cust-panel-toggle${panelOpen ? "" : " collapsed"}`}
          style={{ left: panelOpen ? 340 : 0 }}
          onClick={() => setPanelOpen(o => !o)}
          title={panelOpen ? "Ocultar panel" : "Mostrar panel"}
        >
          {panelOpen ? "◀" : "▶"}
        </button>

        {/* ── PREVIEW AREA ── */}
        <div className="cust-preview-area">
          <div className="cust-preview-bar">
            <span>Vista previa en tiempo real</span>
            <div className="cust-preview-url">
              comerciosconecta.com/tienda/<strong>{slug}</strong>
            </div>
            <span style={{ fontSize: ".72rem", color: unsaved ? "#f59e0b" : "#10b981", textAlign: "right", paddingRight: "16px" }}>
              {unsaved ? "● Cambios sin guardar" : "✓ Guardado"}
            </span>
          </div>
          <div className="cust-preview-wrap">
            <div className={`cust-preview-frame ${device}`} style={previewStyle}>

              {/* Inject custom CSS */}
              {cfg.customCss && <style>{cfg.customCss}</style>}

              {/* Store Header */}
              <div className="sp-header">
                <div className="sp-logo">
                  {cfg.logoUrl
                    ? <img src={cfg.logoUrl} alt="logo" />
                    : <><strong>{cfg.nombre}</strong><sub>{cfg.tagline}</sub></>}
                </div>
                <div className="sp-search">🔍 Buscar productos…</div>
                <button className="sp-cart-btn">🛒 Carrito (0)</button>
              </div>

              {/* Nav categories */}
              <nav className="sp-nav">
                {categories.map((cat, i) => (
                  <div key={i} className={`sp-nav-item${i === 0 ? " active" : ""}`}>{cat}</div>
                ))}
              </nav>

              {/* Hero */}
              <div className="sp-hero">
                <h2>{cfg.heroTitle}</h2>
                <p>{cfg.heroSubtitle}</p>
                <button className="sp-hero-btn">{cfg.heroCta}</button>
              </div>

              {/* Products grid */}
              <div className="sp-products">
                <h3>Productos Destacados</h3>
                <div className="sp-grid">
                  {[
                    { icon: "🧴", cat: "Cuidado Personal", name: "Crema Hidratante", price: "$28.000" },
                    { icon: "🧴", cat: "Capilar",           name: "Shampoo H&S",      price: "$33.000" },
                    { icon: "💄", cat: "Maquillaje",        name: "Labial MAC",        price: "$45.000" },
                    { icon: "☀️", cat: "Piel",              name: "Protector Solar",   price: "$32.000" },
                  ].map((p, i) => (
                    <div key={i} className="sp-card">
                      <div className="sp-card-img">{p.icon}</div>
                      <div className="sp-card-body">
                        <div className="sp-card-cat">{p.cat}</div>
                        <div className="sp-card-name">{p.name}</div>
                        <div className="sp-card-price">{p.price}</div>
                        <button className="sp-card-btn">🛒 Agregar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <footer className="sp-footer">
                <div className="sp-footer-top">
                  <div className="sp-footer-brand">{cfg.nombre}</div>
                  {(cfg.facebook || cfg.instagram || cfg.twitter || cfg.tiktok || cfg.whatsapp) && (
                    <div className="sp-social">
                      {cfg.facebook  && <a className="sp-social-btn" href={cfg.facebook}  target="_blank" rel="noreferrer" title="Facebook"><FaFacebook /></a>}
                      {cfg.instagram && <a className="sp-social-btn" href={cfg.instagram} target="_blank" rel="noreferrer" title="Instagram"><FaInstagram /></a>}
                      {cfg.twitter   && <a className="sp-social-btn" href={cfg.twitter}   target="_blank" rel="noreferrer" title="X / Twitter"><FaXTwitter /></a>}
                      {cfg.tiktok    && <a className="sp-social-btn" href={cfg.tiktok}    target="_blank" rel="noreferrer" title="TikTok"><FaTiktok /></a>}
                      {cfg.whatsapp  && <a className="sp-social-btn" href={cfg.whatsapp}  target="_blank" rel="noreferrer" title="WhatsApp"><FaWhatsapp /></a>}
                    </div>
                  )}
                </div>
                <div className="sp-footer-phone">{cfg.footerTelefono}</div>
                <div className="sp-footer-bottom">{cfg.footerTexto}</div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

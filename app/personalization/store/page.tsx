"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
import { FiSearch, FiShoppingCart } from "react-icons/fi";
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
  { label: "Manrope",          css: "'Manrope', sans-serif",               desc: "Moderna y equilibrada",   google: "Manrope" },
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
  colorHeaderBg: string;
  colorNombre: string;
  colorTagline: string;
  colorCarritoBoton: string;
  colorFooterBg: string;
  colorFooterTexto: string;
  colorIconosSociales: string;
  colorBanner: string;
  colorBannerSecundario: string;
  colorTexto: string;
  colorTextoSecundario: string;
  colorBoton: string;
  colorBotonCta: string;
  colorTextoBoton: string;
  fontFamily: string;
  layout: string;
  hoverBtn: string;
  colorHoverBtn: string;
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
  colorHeaderBg:        "#1F3B4D",
  colorNombre:          "#ffffff",
  colorTagline:         "rgba(255,255,255,0.6)",
  colorCarritoBoton:    "#00d4aa",
  colorFooterBg:        "#1F3B4D",
  colorFooterTexto:     "#ffffff",
  colorIconosSociales:  "#ffffff",
  colorBanner:          "#1F3B4D",
  colorBannerSecundario:"#00d4aa",
  colorTexto:           "#1F3B4D",
  colorTextoSecundario: "#666666",
  colorBoton:           "#1F3B4D",
  colorBotonCta:        "#00d4aa",
  colorTextoBoton:      "#ffffff",
  fontFamily:           "'Manrope', sans-serif",
  buttonRadius:         "50px",
  cardRadius:           "12px",
  layout:               "clasico",
  hoverBtn:             "oscurecer",
  colorHoverBtn:        "",
  heroTitle:      "Descubre tu belleza interior",
  heroSubtitle:   "Productos de calidad premium · Envíos rápidos · Precios increíbles",
  heroCta:        "Explorar Productos",
  categorias:     "Todos, Cuidado Personal, Cuidado Capilar, Maquillaje, Medicamentos",
  footerTexto:    "© 2026 MiComercio. Todos los derechos reservados.",
  footerTelefono: "+57 300 123 4567",
  facebook:       "",
  instagram:      "",
  twitter:        "",
  tiktok:         "",
  whatsapp:       "",
  customCss:      "",
};

// Scope custom CSS to the preview frame so body/root rules don't leak out
function scopeCustomCss(css: string, scope: string): string {
  // Remove comments to simplify parsing
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  // Split into rule blocks (simple, non-nested)
  return stripped.replace(
    /([^{}]+)\{([^{}]*)\}/g,
    (_, selectors, declarations) => {
      const scoped = selectors
        .split(",")
        .map((s: string) => {
          const t = s.trim();
          if (!t) return "";
          // body and :root map to the scope element itself
          if (/^(body|:root|html)$/.test(t)) return scope;
          // If already scoped or is keyframe/media identifier, leave as-is
          if (t.startsWith("@") || t.startsWith(scope)) return t;
          return `${scope} ${t}`;
        })
        .filter(Boolean)
        .join(", ");
      return `${scoped} { ${declarations} }`;
    }
  );
}

// Collapsible section component
function Section({
  icon, bg, title, subtitle, defaultOpen, children,
}: {
  icon: React.ReactNode; bg: string; title: string; subtitle: string;
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
  const [saveError, setSaveError] = useState<string | null>(null);
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
          colorBanner:           data.colorBanner           || DEFAULT_CFG.colorBanner,
          colorCarritoBoton:     data.colorCarritoBoton     || DEFAULT_CFG.colorCarritoBoton,
          colorBannerSecundario: data.colorBannerSecundario || DEFAULT_CFG.colorBannerSecundario,
          colorHeaderBg:         data.colorHeaderBg         || DEFAULT_CFG.colorHeaderBg,
          colorNombre:           data.colorNombre           || DEFAULT_CFG.colorNombre,
          colorTagline:          data.colorTagline          || DEFAULT_CFG.colorTagline,
          colorFooterBg:         data.colorFooterBg         || DEFAULT_CFG.colorFooterBg,
          colorFooterTexto:      data.colorFooterTexto      || DEFAULT_CFG.colorFooterTexto,
          colorIconosSociales:   data.colorIconosSociales   || DEFAULT_CFG.colorIconosSociales,
          fontFamily:           data.fontFamily           || DEFAULT_CFG.fontFamily,
          buttonRadius:         data.buttonRadius         || DEFAULT_CFG.buttonRadius,
          cardRadius:           data.cardRadius           || DEFAULT_CFG.cardRadius,
          layout:               data.layout               || DEFAULT_CFG.layout,
          hoverBtn:             data.hoverBtn             || DEFAULT_CFG.hoverBtn,
          colorHoverBtn:        data.colorHoverBtn        || DEFAULT_CFG.colorHoverBtn,
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
    setSaveError(null);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API}/comercios/${CID}/apariencia`, {
        method: "PUT",
        headers,
        body: JSON.stringify(cfg),
      });
      if (!res.ok) {
        const err = await res.text().catch(() => `Error ${res.status}`);
        setSaveError(err || `Error ${res.status}`);
        return;
      }
      try { localStorage.setItem("storeConfig", JSON.stringify(cfg)); } catch { /* quota */ }
      setSaved(true);
      setUnsaved(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Error de red al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // PNG / WebP / GIF pueden tener transparencia — conservar canal alpha
    const hasAlpha = ["image/png", "image/webp", "image/gif"].includes(file.type);
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext("2d")!;
        // Para PNG transparente NO rellenar fondo — dejar el contexto vacío (transparente)
        if (!hasAlpha) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const out = hasAlpha
          ? canvas.toDataURL("image/png")          // preserva transparencia
          : canvas.toDataURL("image/jpeg", 0.82);  // JPEG sin alpha → comprime más
        update({ logoUrl: out });
      };
      img.src = ev.target?.result as string;
    };
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
    "--sp-banner":            cfg.colorBanner,
    "--sp-carrito-btn":       cfg.colorCarritoBoton,
    "--sp-banner-sec":        cfg.colorBannerSecundario,
    "--sp-header-bg":         cfg.colorHeaderBg,
    "--sp-footer-bg":         cfg.colorFooterBg,
    "--sp-footer-texto":      cfg.colorFooterTexto,
    "--sp-iconos-sociales":   cfg.colorIconosSociales,
    "--sp-nombre":            cfg.colorNombre,
    "--sp-tagline":           cfg.colorTagline,
    ...(cfg.colorHoverBtn ? { "--sp-hover-btn": cfg.colorHoverBtn } : {}),
    fontFamily:          cfg.fontFamily,
  } as React.CSSProperties;

  return (
    <div className="cust-root">

      {/* ═══════════ TOP BAR ═══════════ */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <button className="cust-back-link" onClick={() => router.push("/dashboard")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Dashboard
          </button>
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
                {d === "desktop" ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> : d === "tablet" ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>}
              </button>
            ))}
          </div>
          <button
            className="cust-btn-default"
            onClick={() => {
              if (confirm("¿Restablecer todos los colores y estilos a los valores originales? El nombre, logo y textos no cambian.")) {
                setCfg(prev => ({
                  ...DEFAULT_CFG,
                  nombre:        prev.nombre,
                  tagline:       prev.tagline,
                  logoUrl:       prev.logoUrl,
                  heroTitle:     prev.heroTitle,
                  heroSubtitle:  prev.heroSubtitle,
                  heroCta:       prev.heroCta,
                  categorias:    prev.categorias,
                  footerTexto:   prev.footerTexto,
                  footerTelefono: prev.footerTelefono,
                  facebook:      prev.facebook,
                  instagram:     prev.instagram,
                  twitter:       prev.twitter,
                  tiktok:        prev.tiktok,
                  whatsapp:      prev.whatsapp,
                  customCss:     prev.customCss,
                  layout:        prev.layout,
                }));
                setUnsaved(true);
              }
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
            Restablecer
          </button>
          <button
            className="cust-btn-preview"
            onClick={() => {
              localStorage.setItem("storeConfig", JSON.stringify(cfg));
              window.open("/store", "_blank");
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Vista previa
          </button>
          <button
            className={`cust-btn-save${saved ? " saved" : saveError ? " error" : ""}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saved ? "✓ Guardado" : saving ? "Guardando…" : saveError ? "Error al guardar" : "Guardar cambios"}
          </button>
        </div>
      </div>
      {saveError && (
        <div className="cust-save-error">{saveError}</div>
      )}

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
                {t === "design" ? "Diseño" : t === "content" ? "Contenido" : "Avanzado"}
              </button>
            ))}
          </div>

          <div className="cust-panel-body">

            {/* ════ TAB: DISEÑO ════ */}
            {tab === "design" && (
              <>
                {/* ── 1. Identidad de Marca ── */}
                <Section icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>} bg="#e0f2fe" title="Identidad de Marca" subtitle="Logo, nombre, eslogan y paleta de colores" defaultOpen>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">Logo de la tienda</label>
                    <div className="cust-logo-preview">
                      {cfg.logoUrl ? <img src={cfg.logoUrl} alt="logo" /> : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
                    </div>
                    <div className="cust-logo-actions">
                      <div className="cust-upload-zone" onClick={() => fileRef.current?.click()}>
                        <div className="cust-upload-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
                        <strong>Subir logo</strong>
                        <p>PNG o SVG transparente · Máx 2MB</p>
                      </div>
                      {cfg.logoUrl && (
                        <button
                          className="cust-logo-remove-btn"
                          title="Eliminar logo"
                          onClick={() => { update({ logoUrl: "" }); if (fileRef.current) fileRef.current.value = ""; }}
                        >
                          Eliminar logo
                        </button>
                      )}
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
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Color primario <span className="cust-ctrl-hint">(actualiza header, footer y banner)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorPrimario}
                        onChange={e => update({ colorPrimario: e.target.value, colorHeaderBg: e.target.value, colorFooterBg: e.target.value, colorBanner: e.target.value, colorBoton: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorPrimario}</div>
                    </div>
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Color de acento <span className="cust-ctrl-hint">(categorías de nav, badges de productos, botón CTA)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorAcento}
                        onChange={e => update({ colorAcento: e.target.value })} />
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
                          onClick={() => update({ colorPrimario: pal.p, colorAcento: pal.a, colorBoton: pal.p, colorBotonCta: pal.a, colorBanner: pal.p, colorHeaderBg: pal.p, colorFooterBg: pal.p })}
                        />
                      ))}
                    </div>
                  </div>
                </Section>

                {/* ── 2. Header y Footer ── */}
                <Section icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="4" rx="1"/><rect x="2" y="17" width="20" height="4" rx="1"/><line x1="6" y1="8" x2="18" y2="8"/><line x1="6" y1="13" x2="18" y2="13"/></svg>} bg="#dbeafe" title="Header y Footer" subtitle="Fondo y colores de texto del encabezado y pie de página" defaultOpen>
                  <p style={{ fontSize: ".72rem", fontWeight: 700, color: "#3b82f6", marginBottom: 10, letterSpacing: ".06em", textTransform: "uppercase" }}>Header</p>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Fondo del header <span className="cust-ctrl-hint">(barra superior — sincroniza con color primario)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorHeaderBg}
                        onChange={e => update({ colorHeaderBg: e.target.value, colorPrimario: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorHeaderBg}</div>
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {([[cfg.colorPrimario,"Primario"],[cfg.colorAcento,"Acento"],["#ffffff","Blanco"],["#000000","Negro"],["#0f172a","Oscuro"]] as [string,string][]).map(([c,l]) => (
                        <div key={l} onClick={() => update({ colorHeaderBg: c, colorPrimario: c })}
                          style={{ cursor:"pointer", padding:"4px 10px", borderRadius:6, fontSize:".72rem", fontWeight:700,
                            background:c, color:c==="#ffffff"?"#333":"#fff",
                            border:cfg.colorHeaderBg===c?"2px solid #333":"2px solid transparent" }}>{l}</div>
                      ))}
                    </div>
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Color del nombre de la tienda <span className="cust-ctrl-hint">(texto en el header)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorNombre}
                        onChange={e => update({ colorNombre: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorNombre}</div>
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {([["#ffffff","Blanco"],["#000000","Negro"],[cfg.colorPrimario,"Primario"],[cfg.colorAcento,"Acento"]] as [string,string][]).map(([color,label]) => (
                        <div key={label} onClick={() => update({ colorNombre: color })}
                          style={{ cursor:"pointer", padding:"4px 10px", borderRadius:6, fontSize:".72rem", fontWeight:700,
                            background:color, color:color==="#ffffff"?"#333":"#fff",
                            border:cfg.colorNombre===color?"2px solid #333":"2px solid transparent" }}>{label}</div>
                      ))}
                    </div>
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Color del tagline <span className="cust-ctrl-hint">(eslogan debajo del nombre en el header)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorTagline}
                        onChange={e => update({ colorTagline: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorTagline}</div>
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {([["#ffffff","Blanco"],[cfg.colorAcento,"Acento"],[cfg.colorPrimario,"Primario"],["#7c3aed","Morado"],["#f59e0b","Amarillo"]] as [string,string][]).map(([color,label]) => (
                        <div key={label} onClick={() => update({ colorTagline: color })}
                          style={{ cursor:"pointer", padding:"4px 10px", borderRadius:6, fontSize:".72rem", fontWeight:700,
                            background:color, color: color==="#ffffff"?"#333":"#fff",
                            border:cfg.colorTagline===color?"2px solid #333":"2px solid transparent" }}>{label}</div>
                      ))}
                    </div>
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Botón carrito <span className="cust-ctrl-hint">(ícono del carrito en el header)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorCarritoBoton}
                        onChange={e => update({ colorCarritoBoton: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorCarritoBoton}</div>
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {([[cfg.colorPrimario,"Primario"],[cfg.colorAcento,"Acento"],["#10b981","Verde"],["#7c3aed","Morado"],["#dc2626","Rojo"],["#000000","Negro"]] as [string,string][]).map(([c,l]) => (
                        <div key={l} onClick={() => update({ colorCarritoBoton: c })}
                          style={{ cursor:"pointer", padding:"4px 10px", borderRadius:6, fontSize:".72rem", fontWeight:700,
                            background:c, color: c==="#ffffff"?"#333":"#fff",
                            border: cfg.colorCarritoBoton===c?"2px solid #333":"2px solid transparent" }}>{l}</div>
                      ))}
                    </div>
                  </div>

                  <div style={{ height: 1, background: "#e2e8f0", margin: "16px 0" }} />
                  <p style={{ fontSize: ".72rem", fontWeight: 700, color: "#3b82f6", marginBottom: 10, letterSpacing: ".06em", textTransform: "uppercase" }}>Footer</p>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Fondo del footer <span className="cust-ctrl-hint">(barra inferior)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorFooterBg}
                        onChange={e => update({ colorFooterBg: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorFooterBg}</div>
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {([[cfg.colorPrimario,"Primario"],[cfg.colorAcento,"Acento"],["#ffffff","Blanco"],["#000000","Negro"],["#0f172a","Oscuro"]] as [string,string][]).map(([c,l]) => (
                        <div key={l} onClick={() => update({ colorFooterBg: c })}
                          style={{ cursor:"pointer", padding:"4px 10px", borderRadius:6, fontSize:".72rem", fontWeight:700,
                            background:c, color:c==="#ffffff"?"#333":"#fff",
                            border:cfg.colorFooterBg===c?"2px solid #333":"2px solid transparent" }}>{l}</div>
                      ))}
                    </div>
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Texto del footer <span className="cust-ctrl-hint">(nombre, copyright, teléfono)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorFooterTexto}
                        onChange={e => update({ colorFooterTexto: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorFooterTexto}</div>
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {([["#ffffff","Blanco"],["#000000","Negro"],[cfg.colorPrimario,"Primario"],[cfg.colorAcento,"Acento"]] as [string,string][]).map(([color,label]) => (
                        <div key={label} onClick={() => update({ colorFooterTexto: color })}
                          style={{ cursor:"pointer", padding:"4px 10px", borderRadius:6, fontSize:".72rem", fontWeight:700,
                            background:color, color:color==="#ffffff"?"#333":"#fff",
                            border:cfg.colorFooterTexto===color?"2px solid #333":"2px solid transparent" }}>{label}</div>
                      ))}
                    </div>
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Iconos de redes sociales <span className="cust-ctrl-hint">(Facebook, Instagram, etc.)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorIconosSociales}
                        onChange={e => update({ colorIconosSociales: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorIconosSociales}</div>
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {([["#ffffff","Blanco"],["#000000","Negro"],[cfg.colorPrimario,"Primario"],[cfg.colorAcento,"Acento"]] as [string,string][]).map(([color,label]) => (
                        <div key={label} onClick={() => update({ colorIconosSociales: color })}
                          style={{ cursor:"pointer", padding:"4px 10px", borderRadius:6, fontSize:".72rem", fontWeight:700,
                            background:color, color:color==="#ffffff"?"#333":"#fff",
                            border:cfg.colorIconosSociales===color?"2px solid #333":"2px solid transparent" }}>{label}</div>
                      ))}
                    </div>
                  </div>
                </Section>

                {/* ── 3. Banner y Categorías ── */}
                <Section icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>} bg="#fce7f3" title="Banner y Categorías" subtitle="Fondo del hero y color lateral de sección">
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
                        <div key={l} onClick={() => update({ colorBanner: c })}
                          style={{ cursor:"pointer", padding:"4px 10px", borderRadius:6, fontSize:".72rem", fontWeight:700,
                            background:c, color:"#fff",
                            border: cfg.colorBanner===c?"2px solid #333":"2px solid transparent" }}>{l}</div>
                      ))}
                    </div>
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Color secundario del banner <span className="cust-ctrl-hint">(degradado final del hero)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorBannerSecundario}
                        onChange={e => update({ colorBannerSecundario: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorBannerSecundario}</div>
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {([[cfg.colorPrimario,"Primario"],[cfg.colorAcento,"Acento"],["#7c3aed","Morado"],["#f59e0b","Amarillo"],["#10b981","Verde"],["#ffffff","Blanco"]] as [string,string][]).map(([c,l]) => (
                        <div key={l} onClick={() => update({ colorBannerSecundario: c })}
                          style={{ cursor:"pointer", padding:"4px 10px", borderRadius:6, fontSize:".72rem", fontWeight:700,
                            background:c, color: c==="#ffffff"?"#333":"#fff",
                            border: cfg.colorBannerSecundario===c?"2px solid #333":"2px solid transparent" }}>{l}</div>
                      ))}
                    </div>
                    <div style={{
                      marginTop: 10, borderRadius: 8, height: 40,
                      background: `linear-gradient(135deg, ${cfg.colorBanner} 0%, ${cfg.colorBannerSecundario} 100%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: ".75rem", fontWeight: 700, color: "white",
                    }}>
                      Vista previa del banner
                    </div>
                  </div>
                </Section>

                {/* ── 4. Colores de Botones ── */}
                <Section icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="8" rx="4"/></svg>} bg="#d1fae5" title="Colores de Botones" subtitle="Fondo y texto de cada tipo de botón">
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
                        <div key={l} onClick={() => update({ colorBoton: c })}
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
                        <div key={l} onClick={() => update({ colorBotonCta: c })}
                          style={{ cursor:"pointer", padding:"4px 10px", borderRadius:6, fontSize:".72rem", fontWeight:700,
                            background:c, color: c==="#ffffff"?"#333":"#fff",
                            border: cfg.colorBotonCta===c?"2px solid #333":"2px solid transparent" }}>{l}</div>
                      ))}
                    </div>
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Texto en botones <span className="cust-ctrl-hint">(letras dentro de todos los botones)</span>
                    </label>
                    <div className="cust-color-row">
                      <input type="color" className="cust-color-swatch" value={cfg.colorTextoBoton}
                        onChange={e => update({ colorTextoBoton: e.target.value })} />
                      <div className="cust-color-value">{cfg.colorTextoBoton}</div>
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {([["#ffffff","Blanco"],["#000000","Negro"],[cfg.colorPrimario,"Primario"],[cfg.colorAcento,"Acento"]] as [string,string][]).map(([color,label]) => (
                        <div key={label} onClick={() => update({ colorTextoBoton: color })}
                          style={{ cursor: "pointer", padding: "4px 10px", borderRadius: 6, fontSize: ".72rem", fontWeight: 700,
                            background: color, color: color === "#ffffff" ? "#333" : "#fff",
                            border: cfg.colorTextoBoton === color ? "2px solid #333" : "2px solid transparent" }}>
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>

                {/* ── 5. Fuentes y Colores de Texto ── */}
                <Section icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>} bg="#ede9fe" title="Fuentes y Colores de Texto" subtitle="Tipografía y colores del contenido principal">
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
                </Section>

                {/* ── 6. Layout ── */}
                <Section icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>} bg="#fef9c3" title="Layout de la Tienda" subtitle="Elige cómo se muestran los productos" defaultOpen>
                  <div className="cust-ctrl-group">
                    <div className="cust-layout-grid">
                      {([
                        { id: "clasico",  label: "Clásico",  desc: "4 columnas",   icon: "⊞" },
                        { id: "grande",   label: "Grande",   desc: "2 columnas",   icon: "▣" },
                        { id: "lista",    label: "Lista",    desc: "Horizontal",   icon: "☰" },
                        { id: "minimal",  label: "Minimal",  desc: "3 col limpio", icon: "⊟" },
                        { id: "magazine", label: "Magazine", desc: "Destacado",    icon: "▤" },
                      ] as { id: string; label: string; desc: string; icon: string }[]).map(opt => (
                        <div
                          key={opt.id}
                          className={`cust-layout-opt${cfg.layout === opt.id ? " selected" : ""}`}
                          onClick={() => update({ layout: opt.id })}
                        >
                          <div className="cust-layout-icon">{opt.icon}</div>
                          <strong>{opt.label}</strong>
                          <small>{opt.desc}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>

                {/* ── 7. Hover ── */}
                <Section icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></svg>} bg="#ede9fe" title="Efecto Hover de Botones" subtitle="Animación al pasar el cursor sobre botones" defaultOpen>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">Tipo de efecto</label>
                    <div className="cust-hover-grid">
                      {([
                        { id: "oscurecer", label: "Oscurecer",  demo: "Comprar" },
                        { id: "aclarar",   label: "Aclarar",    demo: "Comprar" },
                        { id: "escalar",   label: "Escalar",    demo: "Comprar" },
                        { id: "sombra",    label: "Sombra",     demo: "Comprar" },
                        { id: "deslizar",  label: "Deslizar",   demo: "Comprar" },
                        { id: "rebote",    label: "Rebote",     demo: "Comprar" },
                      ] as { id: string; label: string; demo: string }[]).map(opt => (
                        <div
                          key={opt.id}
                          className={`cust-hover-opt btn-hover-${opt.id}${cfg.hoverBtn === opt.id ? " selected" : ""}`}
                          onClick={() => update({ hoverBtn: opt.id })}
                        >
                          <button
                            className="cust-hover-demo-btn"
                            style={{
                              background: cfg.colorBoton || cfg.colorPrimario,
                              color: cfg.colorTextoBoton,
                              borderRadius: cfg.buttonRadius,
                            }}
                          >
                            {opt.demo}
                          </button>
                          <small>{opt.label}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Color del hover <span className="cust-ctrl-hint">(fondo del botón al pasar el cursor)</span>
                    </label>
                    <div className="cust-color-row">
                      <input
                        type="color"
                        className="cust-color-swatch"
                        value={cfg.colorHoverBtn || cfg.colorBoton || cfg.colorPrimario}
                        onChange={e => update({ colorHoverBtn: e.target.value })}
                      />
                      <div className="cust-color-value">{cfg.colorHoverBtn || "Auto"}</div>
                      {cfg.colorHoverBtn && (
                        <button
                          onClick={() => update({ colorHoverBtn: "" })}
                          style={{ marginLeft: 8, padding: "3px 10px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#f8fafc", color: "#64748b", fontSize: ".72rem", cursor: "pointer" }}
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                    <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {([
                        [cfg.colorAcento,  "Acento"],
                        [cfg.colorPrimario,"Primario"],
                        ["#10b981","Verde"],
                        ["#7c3aed","Morado"],
                        ["#dc2626","Rojo"],
                        ["#f59e0b","Amarillo"],
                        ["#000000","Negro"],
                      ] as [string, string][]).map(([color, label]) => (
                        <div
                          key={label}
                          onClick={() => update({ colorHoverBtn: color })}
                          style={{
                            cursor: "pointer", padding: "4px 10px", borderRadius: 6,
                            fontSize: ".72rem", fontWeight: 700,
                            background: color, color: color === "#f59e0b" ? "#333" : "#fff",
                            border: cfg.colorHoverBtn === color ? "2px solid #333" : "2px solid transparent",
                          }}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>

                {/* ── 8. Componentes ── */}
                <Section icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>} bg="#d1fae5" title="Estilo de Componentes" subtitle="Bordes de botones y tarjetas">
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
                <Section icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>} bg="#fef9c3" title="Banner Principal" subtitle="Encabezado de la tienda" defaultOpen>
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

                <Section icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>} bg="#dbeafe" title="Categorías de Navegación" subtitle="Menú horizontal de la tienda" defaultOpen>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">
                      Categorías visibles <span className="cust-ctrl-hint">(separar con coma)</span>
                    </label>
                    <textarea className="cust-textarea" value={cfg.categorias} onChange={e => update({ categorias: e.target.value })} />
                  </div>
                </Section>

                <Section icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>} bg="#ede9fe" title="Pie de Página" subtitle="Footer e información de contacto" defaultOpen>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">Texto del footer</label>
                    <input className="cust-input" value={cfg.footerTexto} onChange={e => update({ footerTexto: e.target.value })} />
                  </div>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">Teléfono / WhatsApp</label>
                    <input className="cust-input" value={cfg.footerTelefono} onChange={e => update({ footerTelefono: e.target.value })} />
                  </div>
                </Section>

                <Section icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>} bg="#dbeafe" title="Redes Sociales" subtitle="Solo aparecen si tienen enlace">
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
                <Section icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>} bg="#fef2f2" title="CSS Personalizado" subtitle="Estilos aplicados al preview y a la tienda real" defaultOpen>
                  <div className="cust-ctrl-group">
                    <label className="cust-ctrl-label">CSS adicional</label>
                    <p style={{ fontSize: ".72rem", color: "#64748b", marginBottom: 8, lineHeight: 1.5 }}>
                      Puedes usar <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 4 }}>body</code> y clases como{" "}
                      <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 4 }}>.sp-header</code>,{" "}
                      <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 4 }}>.sp-card</code>,{" "}
                      <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 4 }}>.sp-hero</code>, etc.
                      El CSS se aplica en tiempo real en el preview y en la tienda al guardar.
                    </p>
                    <textarea
                      className="cust-textarea code"
                      value={cfg.customCss}
                      onChange={e => update({ customCss: e.target.value })}
                      placeholder={"/* Ejemplo: cambiar fondo de la página */\nbody {\n  background: #f0f4f8;\n}\n\n/* Agrandar el hero */\n.sp-hero {\n  padding: 80px 24px;\n}\n\n/* Quitar sombra de tarjetas */\n.sp-card {\n  box-shadow: none;\n}"}
                    />
                    {cfg.customCss && (
                      <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, background: unsaved ? "#fef9c3" : "#ecfdf5", border: `1px solid ${unsaved ? "#fbbf24" : "#6ee7b7"}`, fontSize: ".72rem", color: unsaved ? "#92400e" : "#065f46" }}>
                        {unsaved ? "⚠ CSS activo en el preview — haz clic en «Guardar cambios» para aplicarlo a la tienda" : "✓ CSS guardado y activo en la tienda"}
                      </div>
                    )}
                  </div>
                </Section>

                <Section icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>} bg="#d1fae5" title="Dominio Personalizado" subtitle="URL de la tienda" defaultOpen>
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
            <div className={`cust-preview-frame ${device} layout-${cfg.layout} btn-hover-${cfg.hoverBtn}${cfg.colorHoverBtn ? " has-hover-color" : ""}`} style={previewStyle}>

              {/* Inject custom CSS scoped to the preview frame */}
              {cfg.customCss && <style>{scopeCustomCss(cfg.customCss, ".cust-preview-frame")}</style>}

              {/* Store Header */}
              <div className="sp-header">
                <div className="sp-logo">
                  {cfg.logoUrl
                    ? <img src={cfg.logoUrl} alt="logo" />
                    : <><strong>{cfg.nombre}</strong><sub>{cfg.tagline}</sub></>}
                </div>
                <div className="sp-search"><FiSearch size={13} /> Buscar productos…</div>
                <button className="sp-cart-btn"><FiShoppingCart size={13} /> Carrito (0)</button>
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
                    { cat: "Cuidado Personal", name: "Crema Hidratante", price: "$28.000" },
                    { cat: "Capilar",           name: "Shampoo H&S",      price: "$33.000" },
                    { cat: "Maquillaje",        name: "Labial MAC",        price: "$45.000" },
                    { cat: "Piel",              name: "Protector Solar",   price: "$32.000" },
                  ].map((p, i) => (
                    <div key={i} className="sp-card">
                      <div className="sp-card-img"><FiShoppingCart size={28} style={{ opacity: .25 }} /></div>
                      <div className="sp-card-body">
                        <div className="sp-card-cat">{p.cat}</div>
                        <div className="sp-card-name">{p.name}</div>
                        <div className="sp-card-price">{p.price}</div>
                        <button className="sp-card-btn"><FiShoppingCart size={12} /> Agregar</button>
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

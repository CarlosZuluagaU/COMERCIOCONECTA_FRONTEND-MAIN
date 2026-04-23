"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { FiSearch, FiX, FiPlus, FiMinus, FiArrowLeft } from "react-icons/fi";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import "./store.css";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

function loadGoogleFont(family: string | null) {
  if (!family) return;
  const id = `gfont-${family}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id; link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@400;600;700;800&display=swap`;
  document.head.appendChild(link);
}
const FONT_GOOGLE_MAP: Record<string, string> = {
  "'Manrope', sans-serif":        "Manrope",
  "'Inter', sans-serif":          "Inter",
  "'Poppins', sans-serif":        "Poppins",
  "'Montserrat', sans-serif":     "Montserrat",
  "'Lato', sans-serif":           "Lato",
  "'Roboto', sans-serif":         "Roboto",
  "'DM Sans', sans-serif":        "DM+Sans",
  "'Outfit', sans-serif":         "Outfit",
  "'Nunito', sans-serif":         "Nunito",
  "'Quicksand', sans-serif":      "Quicksand",
  "'Raleway', sans-serif":        "Raleway",
  "'Oswald', sans-serif":         "Oswald",
  "'Ubuntu', sans-serif":         "Ubuntu",
  "'Josefin Sans', sans-serif":   "Josefin+Sans",
  "'Cabin', sans-serif":          "Cabin",
  "'Playfair Display', serif":    "Playfair+Display",
  "'Merriweather', serif":        "Merriweather",
  "'Lora', serif":                "Lora",
};

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  precioAnterior?: number;
  imagen: string;
  categoria: string;
  marca: string;
  destacado: boolean;
  descripcion?: string;
}

interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

type CheckoutStep = 0 | 1 | 2 | 3;

export default function TiendaPage() {
  const { comercioId: authComercioId, authLoaded } = useAuth();

  useEffect(() => {
    if (!authLoaded) return;
    const root = document.documentElement;
    root.style.removeProperty("--sp-primary");
    root.style.removeProperty("--sp-accent");
    root.style.removeProperty("--sp-font");
    root.style.removeProperty("--sp-radius-btn");
    root.style.removeProperty("--sp-radius-card");
    root.style.removeProperty("--sp-texto");
    root.style.removeProperty("--sp-texto-sec");
    root.style.removeProperty("--sp-texto-btn");
    root.style.removeProperty("--sp-btn");
    root.style.removeProperty("--sp-btn-cta");
    root.style.removeProperty("--sp-banner");
    root.style.removeProperty("--sp-carrito-btn");
    root.style.removeProperty("--sp-banner-sec");
    root.style.removeProperty("--sp-footer-texto");
    root.style.removeProperty("--sp-iconos-sociales");
    root.style.removeProperty("--sp-header-bg");
    root.style.removeProperty("--sp-footer-bg");

    const apply = (cfg: any) => {
      if (!cfg) return;
      if (cfg.colorPrimario)            root.style.setProperty("--sp-primary",     cfg.colorPrimario);
      if (cfg.colorAcento)              root.style.setProperty("--sp-accent",       cfg.colorAcento);
      if (cfg.fontFamily) {
        root.style.setProperty("--sp-font", cfg.fontFamily);
        loadGoogleFont(FONT_GOOGLE_MAP[cfg.fontFamily] || null);
      }
      if (cfg.buttonRadius)             root.style.setProperty("--sp-radius-btn",   cfg.buttonRadius);
      if (cfg.cardRadius)               root.style.setProperty("--sp-radius-card",  cfg.cardRadius);
      if (cfg.colorTexto)               root.style.setProperty("--sp-texto",        cfg.colorTexto);
      if (cfg.colorTextoSecundario)     root.style.setProperty("--sp-texto-sec",    cfg.colorTextoSecundario);
      if (cfg.colorTextoBoton)          root.style.setProperty("--sp-texto-btn",    cfg.colorTextoBoton);
      if (cfg.colorBoton)               root.style.setProperty("--sp-btn",          cfg.colorBoton);
      if (cfg.colorBotonCta)            root.style.setProperty("--sp-btn-cta",      cfg.colorBotonCta);
      if (cfg.colorBanner)              root.style.setProperty("--sp-banner",            cfg.colorBanner);
      if (cfg.colorCarritoBoton)        root.style.setProperty("--sp-carrito-btn",       cfg.colorCarritoBoton);
      if (cfg.colorBannerSecundario)    root.style.setProperty("--sp-banner-sec",        cfg.colorBannerSecundario);
      if (cfg.colorFooterTexto)         root.style.setProperty("--sp-footer-texto",      cfg.colorFooterTexto);
      if (cfg.colorIconosSociales)      root.style.setProperty("--sp-iconos-sociales",   cfg.colorIconosSociales);
      if (cfg.colorNombre)              root.style.setProperty("--sp-nombre",            cfg.colorNombre);
      if (cfg.colorTagline)             root.style.setProperty("--sp-tagline",           cfg.colorTagline);
      // Always set header/footer bg — fall back to primary if not explicitly saved
      root.style.setProperty("--sp-header-bg", cfg.colorHeaderBg || cfg.colorPrimario || "#1F3B4D");
      root.style.setProperty("--sp-footer-bg", cfg.colorFooterBg || cfg.colorPrimario || "#1F3B4D");
      setStoreCfg({
        nombre:         cfg.nombre         || "ComerciosConecta",
        tagline:        cfg.tagline        || "Tu tienda de confianza",
        heroTitle:      cfg.heroTitle      || "",
        heroSubtitle:   cfg.heroSubtitle   || "",
        heroCta:        cfg.heroCta        || "",
        footerTexto:    cfg.footerTexto    || "",
        footerTelefono: cfg.footerTelefono || "",
        facebook:       cfg.facebook       || "",
        instagram:      cfg.instagram      || "",
        twitter:        cfg.twitter        || "",
        tiktok:         cfg.tiktok         || "",
        whatsapp:       cfg.whatsapp       || "",
        layout:         cfg.layout         || "clasico",
        hoverBtn:       cfg.hoverBtn       || "oscurecer",
        hoverBtnColor:  cfg.colorHoverBtn  || "",
        customCss:      cfg.customCss      || "",
      });
    };

    const cid = authComercioId ?? 1;
    fetch(`${API}/comercios/${cid}/apariencia`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          apply(data);
          localStorage.setItem("storeConfig", JSON.stringify(data));
        } else {
          try { const raw = localStorage.getItem("storeConfig"); if (raw) apply(JSON.parse(raw)); } catch {}
        }
      })
      .catch(() => {
        try { const raw = localStorage.getItem("storeConfig"); if (raw) apply(JSON.parse(raw)); } catch {}
      });
  }, [authLoaded, authComercioId]);

  const [carrito, setCarrito]   = useState<CarritoItem[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(0);
  const [procesando, setProcesando]     = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [storeCfg, setStoreCfg] = useState({
    nombre: "ComerciosConecta", tagline: "Tu tienda de confianza",
    heroTitle: "", heroSubtitle: "", heroCta: "",
    footerTexto: "", footerTelefono: "",
    facebook: "", instagram: "", twitter: "", tiktok: "", whatsapp: "",
    layout: "clasico", hoverBtn: "oscurecer", hoverBtnColor: "",
    customCss: "",
  });

  const [cliente, setCliente] = useState({
    nombre: "", email: "", telefono: "", direccion: "", ciudad: "", departamento: "", notas: "",
  });

  // ── Envío ────────────────────────────────────────────────
  interface OpcionEnvio {
    tipoEnvio: string;
    descripcion: string;
    costoEnCentavos: number;
    costoFinalEnCentavos: number;
    envioGratis: boolean;
    diasEstimados: number;
  }
  const [envioOpciones, setEnvioOpciones] = useState<OpcionEnvio[]>([]);
  const [envioSeleccionado, setEnvioSeleccionado] = useState<OpcionEnvio | null>(null);
  const [calculandoEnvio, setCalculandoEnvio] = useState(false);
  const [envioError, setEnvioError] = useState("");
  const [latDestino, setLatDestino]   = useState<number | null>(null);
  const [lngDestino, setLngDestino]   = useState<number | null>(null);

  const TIPO_LABEL: Record<string, string> = {
    RECOGIDA: "Recogida en tienda",
    LOCAL_PROPIO: "Mensajero propio",
    LOCAL_TRANSPORTADORA: "Transportadora local",
    NACIONAL_TRANSPORTADORA: "Envío nacional",
  };

  const calcularEnvio = async () => {
    const cid = authComercioId ?? 1;
    if (!cliente.ciudad && !cliente.direccion) {
      setEnvioError("Ingresa tu ciudad o dirección primero.");
      return;
    }
    setCalculandoEnvio(true);
    setEnvioError("");
    setEnvioOpciones([]);
    setEnvioSeleccionado(null);

    try {
      // Geocodificar la dirección del cliente con Nominatim (gratis)
      const query = [cliente.direccion, cliente.ciudad, "Colombia"].filter(Boolean).join(", ");
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        { headers: { "Accept-Language": "es" } }
      );
      const geoData = await geoRes.json();
      let lat: number | null = null;
      let lng: number | null = null;
      if (geoData && geoData.length > 0) {
        lat = parseFloat(geoData[0].lat);
        lng = parseFloat(geoData[0].lon);
        setLatDestino(lat);
        setLngDestino(lng);
      }

      const montoEnCentavos = Math.round(totalCarrito * 100);
      const body: Record<string, unknown> = { comercioId: cid, montoOrdenEnCentavos: montoEnCentavos };
      if (lat !== null) { body.latDestino = lat; body.lngDestino = lng; }

      const res = await fetch(`${API}/envios/calcular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Sin configuración de envío");
      const opciones: OpcionEnvio[] = await res.json();
      setEnvioOpciones(opciones);
      if (opciones.length === 1) setEnvioSeleccionado(opciones[0]);
    } catch {
      setEnvioError("No se pudieron calcular las opciones. El comercio puede no tener configuración de envío.");
    } finally {
      setCalculandoEnvio(false);
    }
  };

  useEffect(() => {
    if (!authLoaded) return;
    setLoadingProductos(true);
    const cid = authComercioId;
    const url = cid ? `${API}/productos?comercioId=${cid}` : `${API}/productos`;
    fetch(url)
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        setProductos(
          data.filter(p => p.estado === "Activo" && p.stock > 0).map(p => ({
            id: String(p.id), nombre: p.nombre, precio: p.precioVenta,
            imagen: p.imagenUrl || "", categoria: p.categoria || "General",
            marca: p.marca || "", destacado: false, descripcion: p.descripcion || "",
          }))
        );
      })
      .catch(() => setProductos([]))
      .finally(() => setLoadingProductos(false));
  }, [authLoaded, authComercioId]);

  const categorias = ["Todos", ...Array.from(new Set(productos.map(p => p.categoria))).filter(Boolean)];
  const productosFiltrados = productos.filter(p => {
    const q = busqueda.toLowerCase();
    return (p.nombre.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q))
        && (categoriaActiva === "Todos" || p.categoria === categoriaActiva);
  });

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.producto.id === producto.id);
      if (existe) return prev.map(i => i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const actualizarCantidad = (id: string, cant: number) => {
    if (cant < 1) { setCarrito(prev => prev.filter(i => i.producto.id !== id)); return; }
    setCarrito(prev => prev.map(i => i.producto.id === id ? { ...i, cantidad: cant } : i));
  };

  const remover = (id: string) => setCarrito(prev => prev.filter(i => i.producto.id !== id));

  const totalCarrito  = carrito.reduce((t, i) => t + i.producto.precio * i.cantidad, 0);
  const totalItems    = carrito.reduce((t, i) => t + i.cantidad, 0);
  const costoEnvio    = envioSeleccionado ? envioSeleccionado.costoFinalEnCentavos / 100 : 0;
  const totalConEnvio = totalCarrito + costoEnvio;

  const formatPrecio = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p);

  const renderEstrellas = (n = 4.5) =>
    "★".repeat(Math.floor(n)) + (n % 1 >= 0.5 ? "☆" : "") + "☆".repeat(5 - Math.ceil(n));

  const handleConfirmarPedido = async () => {
    if (!cliente.nombre || !cliente.email || !cliente.telefono) {
      alert("Por favor completa nombre, email y teléfono.");
      return;
    }
    if (!envioSeleccionado) {
      alert("Por favor selecciona un método de envío.");
      return;
    }
    setProcesando(true);
    try {
      const subtotalInCents  = Math.round(totalCarrito * 100);
      const shippingInCents  = envioSeleccionado.costoFinalEnCentavos;
      const totalInCents     = subtotalInCents + shippingInCents;

      // 1) Crear link de Wompi
      const linkRes = await fetch(`${API}/checkout/initiate-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalInCents,
          redirectUrl: `${window.location.origin}/store/order-confirmation`,
        }),
      });
      if (!linkRes.ok) {
        const errData = await linkRes.json().catch(() => ({}));
        throw new Error(errData.error || `Error creando link de pago (HTTP ${linkRes.status})`);
      }
      const { payment_url } = await linkRes.json();

      // 2) Guardar datos del pedido (incluye envío) en localStorage
      localStorage.setItem("pendingOrder", JSON.stringify({
        customerName:         cliente.nombre,
        customerEmail:        cliente.email,
        customerPhone:        cliente.telefono,
        customerAddress:      cliente.direccion,
        customerCity:         cliente.ciudad,
        comercioId:           authComercioId ?? 1,
        totalInCents,
        // Campos de envío
        tipoEnvio:            envioSeleccionado.tipoEnvio,
        shippingCostInCents:  shippingInCents,
        direccionDestino:     cliente.direccion || null,
        ciudadDestino:        cliente.ciudad    || null,
        departamentoDestino:  cliente.departamento || null,
        latDestino:           latDestino,
        lngDestino:           lngDestino,
        items: carrito.map(i => ({
          productoId:      Number(i.producto.id),
          nombre:          i.producto.nombre,
          cantidad:        i.cantidad,
          priceInCents:    Math.round(i.producto.precio * 100),
          ivaPercentage:   19,
          subtotalInCents: Math.round(i.producto.precio * i.cantidad * 100),
        })),
      }));

      // 3) Redirigir a Wompi
      window.location.href = payment_url;
    } catch (err: any) {
      alert("Error al procesar el pago: " + (err.message || "Intenta nuevamente"));
      setProcesando(false);
    }
  };

  const closeCheckout = () => {
    setCheckoutStep(0);
    setCliente({ nombre: "", email: "", telefono: "", direccion: "", ciudad: "", departamento: "", notas: "" });
    setEnvioOpciones([]);
    setEnvioSeleccionado(null);
    setEnvioError("");
    setLatDestino(null);
    setLngDestino(null);
  };

  return (
    <div
      className={`store-page layout-${storeCfg.layout} btn-hover-${storeCfg.hoverBtn}${storeCfg.hoverBtnColor ? " has-hover-color" : ""}`}
      style={storeCfg.hoverBtnColor ? { "--sp-hover-btn": storeCfg.hoverBtnColor } as React.CSSProperties : undefined}
    >
      {storeCfg.customCss && <style>{storeCfg.customCss}</style>}
      {/* HEADER */}
      <header className="store-header">
        <div className="header-inner">
          <div className="store-logo">
            <h1>{storeCfg.nombre}</h1>
            <sub>{storeCfg.tagline}</sub>
          </div>
          <div className="store-search">
            <FiSearch />
            <input
              placeholder="Buscar productos, marcas…"
              value={busqueda}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setBusqueda(e.target.value)}
            />
          </div>
          <button className="store-cart-btn" onClick={() => setCheckoutStep(1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Carrito
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </button>
        </div>
      </header>

      {/* NAV */}
      <nav className="store-nav">
        <div className="nav-inner">
          {categorias.map(cat => (
            <button key={cat} className={`nav-btn ${categoriaActiva === cat ? "active" : ""}`}
              onClick={() => setCategoriaActiva(cat)}>{cat}</button>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <h2>{storeCfg.heroTitle || "Bienvenido a nuestra tienda"}</h2>
        <p>{storeCfg.heroSubtitle || "Productos de calidad premium · Envíos rápidos · Precios increíbles"}</p>
        <button className="hero-btn"
          onClick={() => document.querySelector(".products-section")?.scrollIntoView({ behavior: "smooth" })}>
          {storeCfg.heroCta || "Explorar Productos"}
        </button>
      </div>

      {/* PRODUCTS */}
      <div className="products-section">
        <div className="section-title">
          <h2>{categoriaActiva === "Todos" ? "Productos Destacados" : categoriaActiva}</h2>
          <p>{loadingProductos ? "Cargando productos…" :
            `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? "s" : ""} encontrado${productosFiltrados.length !== 1 ? "s" : ""}`}</p>
        </div>
        {loadingProductos ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>Cargando productos…</div>
        ) : productosFiltrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
            <div style={{ marginBottom: 12, color: "#ccc" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>No se encontraron productos</p>
          </div>
        ) : (
          <div className="products-grid">
            {productosFiltrados.map(p => (
              <div key={p.id} className="product-card">
                <div className="product-img">
                  {p.imagen ? <img src={p.imagen} alt={p.nombre} /> : <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c8d0da" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>}
                  {p.destacado && <span className="featured-badge">Destacado</span>}
                  {p.precioAnterior && (
                    <span className="discount-badge">-{Math.round((1 - p.precio / p.precioAnterior) * 100)}%</span>
                  )}
                </div>
                <div className="product-info">
                  <div className="product-cat">{p.categoria}</div>
                  <div className="product-name">{p.nombre}</div>
                  {p.marca && <div className="product-brand">{p.marca}</div>}
                  <div className="stars">{renderEstrellas(4.5)}</div>
                  <div className="price-row">
                    {p.precioAnterior && <span className="old-price">{formatPrecio(p.precioAnterior)}</span>}
                    <span className="cur-price">{formatPrecio(p.precio)}</span>
                  </div>
                  <button className="add-btn" onClick={() => agregarAlCarrito(p)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    Agregar al Carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="store-footer">
        <div className="store-footer-inner">
          <div className="store-footer-brand">
            <span><strong>{storeCfg.nombre}</strong></span>
            <small>{storeCfg.tagline}</small>
          </div>
          {(storeCfg.facebook || storeCfg.instagram || storeCfg.twitter || storeCfg.tiktok || storeCfg.whatsapp) && (
            <div className="store-footer-social">
              {storeCfg.facebook  && <a href={storeCfg.facebook}  target="_blank" rel="noreferrer" className="store-social-btn"><FaFacebook /></a>}
              {storeCfg.instagram && <a href={storeCfg.instagram} target="_blank" rel="noreferrer" className="store-social-btn"><FaInstagram /></a>}
              {storeCfg.twitter   && <a href={storeCfg.twitter}   target="_blank" rel="noreferrer" className="store-social-btn"><FaXTwitter /></a>}
              {storeCfg.tiktok    && <a href={storeCfg.tiktok}    target="_blank" rel="noreferrer" className="store-social-btn"><FaTiktok /></a>}
              {storeCfg.whatsapp  && <a href={storeCfg.whatsapp}  target="_blank" rel="noreferrer" className="store-social-btn"><FaWhatsapp /></a>}
            </div>
          )}
        </div>
        {(storeCfg.footerTelefono || storeCfg.footerTexto) && (
          <div className="store-footer-bottom">
            {storeCfg.footerTelefono && <span>{storeCfg.footerTelefono}</span>}
            {storeCfg.footerTexto    && <span>{storeCfg.footerTexto}</span>}
          </div>
        )}
      </footer>

      {/* ══════════════════════════════════════
          CHECKOUT OVERLAY — 3 PASOS
      ══════════════════════════════════════ */}
      {checkoutStep > 0 && (
        <div className="co-overlay" onClick={e => { if (e.target === e.currentTarget) closeCheckout(); }}>
          <div className="co-panel">

            {/* ── STEP INDICATOR ── */}
            {checkoutStep < 3 && (
              <div className="co-steps">
                {[1, 2].map(s => (
                  <React.Fragment key={s}>
                    <div className={`co-step ${checkoutStep >= s ? "active" : ""} ${checkoutStep > s ? "done" : ""}`}>
                      <div className="co-step-dot">{checkoutStep > s ? "✓" : s}</div>
                      <span>{s === 1 ? "Carrito" : "Tus datos"}</span>
                    </div>
                    {s < 2 && <div className={`co-step-line ${checkoutStep > s ? "done" : ""}`} />}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* ────────── PASO 1: CARRITO ────────── */}
            {checkoutStep === 1 && (
              <>
                <div className="co-header">
                  <button className="co-close" onClick={closeCheckout}><FiX /></button>
                  <h3>Carrito de compras</h3>
                </div>

                <div className="co-body">
                  {carrito.length === 0 ? (
                    <div className="co-empty">
                      <div style={{ color: "#d1d5db" }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                      </div>
                      <p>Tu carrito está vacío</p>
                      <button className="co-btn-sec" onClick={closeCheckout}>Ver productos</button>
                    </div>
                  ) : (
                    <>
                      <div className="co-items">
                        {carrito.map(item => (
                          <div key={item.producto.id} className="co-item">
                            <div className="co-item-img">
                              {item.producto.imagen ? <img src={item.producto.imagen} alt={item.producto.nombre} /> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c8d0da" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>}
                            </div>
                            <div className="co-item-info">
                              <div className="co-item-name">{item.producto.nombre}</div>
                              <div className="co-item-price">{formatPrecio(item.producto.precio)} c/u</div>
                              <div className="co-qty">
                                <button className="co-qty-btn" onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}><FiMinus size={12} /></button>
                                <span>{item.cantidad}</span>
                                <button className="co-qty-btn" onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}><FiPlus size={12} /></button>
                              </div>
                            </div>
                            <div className="co-item-right">
                              <div className="co-item-subtotal">{formatPrecio(item.producto.precio * item.cantidad)}</div>
                              <button className="co-remove" onClick={() => remover(item.producto.id)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="co-summary">
                        <div className="co-sum-row"><span>Subtotal</span><span>{formatPrecio(totalCarrito)}</span></div>
                        <div className="co-sum-row" style={{ color: "#888", fontSize: ".82rem" }}>
                          <span>Envío</span><span>Se calcula al ingresar tu dirección</span>
                        </div>
                        <div className="co-sum-row co-sum-total"><span>Total (sin envío)</span><span>{formatPrecio(totalCarrito)}</span></div>
                      </div>

                      <button className="co-btn-primary" onClick={() => setCheckoutStep(2)}>
                        Proceder al pago →
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* ────────── PASO 2: DATOS ────────── */}
            {checkoutStep === 2 && (
              <>
                <div className="co-header">
                  <button className="co-back" onClick={() => setCheckoutStep(1)}><FiArrowLeft /></button>
                  <h3>Datos del pedido</h3>
                  <button className="co-close" onClick={closeCheckout}><FiX /></button>
                </div>

                <div className="co-body">
                  <div className="co-section-title">Tus datos</div>

                  <div className="co-form-group">
                    <label>Nombre completo *</label>
                    <input placeholder="Tu nombre" value={cliente.nombre}
                      onChange={e => setCliente({ ...cliente, nombre: e.target.value })} />
                  </div>
                  <div className="co-form-group">
                    <label>Teléfono *</label>
                    <input type="tel" placeholder="+57 300 123 4567" value={cliente.telefono}
                      onChange={e => setCliente({ ...cliente, telefono: e.target.value })} />
                  </div>
                  <div className="co-form-group">
                    <label>Correo electrónico *</label>
                    <input type="email" placeholder="tu@email.com" value={cliente.email}
                      onChange={e => setCliente({ ...cliente, email: e.target.value })} />
                  </div>

                  <div className="co-section-title" style={{ marginTop: 16 }}>Dirección de entrega</div>

                  <div className="co-form-group">
                    <label>Dirección</label>
                    <input placeholder="Calle/Carrera..." value={cliente.direccion}
                      onChange={e => { setCliente({ ...cliente, direccion: e.target.value }); setEnvioOpciones([]); setEnvioSeleccionado(null); }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div className="co-form-group">
                      <label>Ciudad</label>
                      <input placeholder="Cali, Bogotá…" value={cliente.ciudad}
                        onChange={e => { setCliente({ ...cliente, ciudad: e.target.value }); setEnvioOpciones([]); setEnvioSeleccionado(null); }} />
                    </div>
                    <div className="co-form-group">
                      <label>Departamento</label>
                      <input placeholder="Valle, Antioquia…" value={cliente.departamento}
                        onChange={e => setCliente({ ...cliente, departamento: e.target.value })} />
                    </div>
                  </div>
                  <div className="co-form-group">
                    <label>Notas adicionales</label>
                    <textarea rows={2} placeholder="Indicaciones para la entrega…" value={cliente.notas}
                      onChange={e => setCliente({ ...cliente, notas: e.target.value })} />
                  </div>

                  {/* ── MÉTODO DE ENVÍO ── */}
                  <div className="co-section-title" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    Método de envío
                  </div>

                  {envioOpciones.length === 0 && !calculandoEnvio && (
                    <button
                      onClick={calcularEnvio}
                      style={{
                        width: "100%", padding: "10px", marginBottom: 8,
                        background: "linear-gradient(135deg,#00d4aa,#00a88f)",
                        color: "white", border: "none", borderRadius: 10,
                        fontWeight: 700, fontSize: ".9rem", cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      Ver opciones de envío →
                    </button>
                  )}

                  {calculandoEnvio && (
                    <div style={{ textAlign: "center", padding: "14px 0", color: "#888", fontSize: 13 }}>
                      Calculando opciones de envío…
                    </div>
                  )}

                  {envioError && (
                    <div style={{ padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, marginBottom: 8 }}>
                      {envioError}
                    </div>
                  )}

                  {envioOpciones.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                      {envioOpciones.map(op => {
                        const sel = envioSeleccionado?.tipoEnvio === op.tipoEnvio;
                        return (
                          <label key={op.tipoEnvio} onClick={() => setEnvioSeleccionado(op)} style={{
                            display: "flex", alignItems: "flex-start", gap: 12,
                            padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                            border: `2px solid ${sel ? "#00d4aa" : "#e0e0e0"}`,
                            background: sel ? "#f0fdf4" : "white",
                            transition: "all .15s",
                          }}>
                            <input type="radio" name="envio" readOnly checked={sel} style={{ marginTop: 3, accentColor: "#00d4aa" }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: ".9rem", color: "#1F3B4D" }}>
                                {TIPO_LABEL[op.tipoEnvio] || op.tipoEnvio}
                              </div>
                              <div style={{ fontSize: ".8rem", color: "#555", marginTop: 2 }}>{op.descripcion}</div>
                              {op.diasEstimados > 0 && (
                                <div style={{ fontSize: ".75rem", color: "#888", marginTop: 2 }}>
                                  Entrega estimada: {op.diasEstimados} día{op.diasEstimados !== 1 ? "s" : ""}
                                </div>
                              )}
                            </div>
                            <div style={{ fontWeight: 800, fontSize: ".95rem", color: op.envioGratis ? "#16a34a" : "#1F3B4D", whiteSpace: "nowrap" }}>
                              {op.envioGratis
                                ? "GRATIS"
                                : formatPrecio(op.costoFinalEnCentavos / 100)
                              }
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* ── RESUMEN ── */}
                  <div className="co-section-title" style={{ marginTop: 16 }}>Resumen del pedido</div>
                  <div className="co-mini-order">
                    {carrito.map(i => (
                      <div key={i.producto.id} className="co-mini-item">
                        <span>{i.cantidad}x {i.producto.nombre}</span>
                        <span>{formatPrecio(i.producto.precio * i.cantidad)}</span>
                      </div>
                    ))}
                    <div className="co-mini-item" style={{ color: "#555" }}>
                      <span>Subtotal productos</span>
                      <span>{formatPrecio(totalCarrito)}</span>
                    </div>
                    {envioSeleccionado && (
                      <div className="co-mini-item" style={{ color: "#555" }}>
                        <span>Envío ({TIPO_LABEL[envioSeleccionado.tipoEnvio] || envioSeleccionado.tipoEnvio})</span>
                        <span style={{ color: envioSeleccionado.envioGratis ? "#16a34a" : undefined }}>
                          {envioSeleccionado.envioGratis ? "GRATIS" : formatPrecio(costoEnvio)}
                        </span>
                      </div>
                    )}
                    <div className="co-mini-total">
                      <span>Total a pagar</span>
                      <span>{formatPrecio(totalConEnvio)}</span>
                    </div>
                  </div>

                  {!envioSeleccionado && envioOpciones.length === 0 && (
                    <p style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600, margin: "6px 0 10px" }}>
                      Debes seleccionar un método de envío para continuar.
                    </p>
                  )}

                  <button className="co-btn-dark" onClick={handleConfirmarPedido}
                    disabled={procesando || !envioSeleccionado}>
                    {procesando ? "Procesando…" : "Confirmar pedido"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

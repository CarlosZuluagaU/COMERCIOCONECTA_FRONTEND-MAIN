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
  });

  const [cliente, setCliente] = useState({
    nombre: "", email: "", telefono: "", direccion: "", ciudad: "", notas: "",
  });

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

  const totalCarrito = carrito.reduce((t, i) => t + i.producto.precio * i.cantidad, 0);
  const totalItems   = carrito.reduce((t, i) => t + i.cantidad, 0);

  const formatPrecio = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p);

  const renderEstrellas = (n = 4.5) =>
    "★".repeat(Math.floor(n)) + (n % 1 >= 0.5 ? "☆" : "") + "☆".repeat(5 - Math.ceil(n));

  const handleConfirmarPedido = async () => {
    if (!cliente.nombre || !cliente.email || !cliente.telefono) {
      alert("Por favor completa nombre, email y teléfono");
      return;
    }
    setProcesando(true);
    try {
      const totalInCents = Math.round(totalCarrito * 100);

      // 1) Crear link de Wompi SIN crear orden todavía
      const linkRes = await fetch(`${API}/checkout/initiate-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalInCents }),
      });
      if (!linkRes.ok) {
        const errData = await linkRes.json().catch(() => ({}));
        throw new Error(errData.error || `Error creando link de pago (HTTP ${linkRes.status})`);
      }
      const { payment_url } = await linkRes.json();

      // 2) Guardar todos los datos del pedido en localStorage
      //    La orden se crea SOLO si Wompi aprueba el pago
      localStorage.setItem("pendingOrder", JSON.stringify({
        customerName:    cliente.nombre,
        customerEmail:   cliente.email,
        customerPhone:   cliente.telefono,
        customerAddress: cliente.direccion,
        customerCity:    cliente.ciudad,
        totalInCents,
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
    setCliente({ nombre: "", email: "", telefono: "", direccion: "", ciudad: "", notas: "" });
  };

  return (
    <div className="store-page">
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
            🛒 Carrito
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
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>No se encontraron productos</p>
          </div>
        ) : (
          <div className="products-grid">
            {productosFiltrados.map(p => (
              <div key={p.id} className="product-card">
                <div className="product-img">
                  {p.imagen ? <img src={p.imagen} alt={p.nombre} /> : <span>📦</span>}
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
                    🛒 Agregar al Carrito
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
                  <h3>🛒 Carrito de compras</h3>
                </div>

                <div className="co-body">
                  {carrito.length === 0 ? (
                    <div className="co-empty">
                      <div style={{ fontSize: "3rem" }}>🛒</div>
                      <p>Tu carrito está vacío</p>
                      <button className="co-btn-sec" onClick={closeCheckout}>Ver productos</button>
                    </div>
                  ) : (
                    <>
                      <div className="co-items">
                        {carrito.map(item => (
                          <div key={item.producto.id} className="co-item">
                            <div className="co-item-img">
                              {item.producto.imagen ? <img src={item.producto.imagen} alt={item.producto.nombre} /> : "📦"}
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
                              <button className="co-remove" onClick={() => remover(item.producto.id)}>🗑</button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="co-summary">
                        <div className="co-sum-row"><span>Subtotal</span><span>{formatPrecio(totalCarrito)}</span></div>
                        <div className="co-sum-row co-sum-total"><span>Total</span><span>{formatPrecio(totalCarrito)}</span></div>
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
                  <h3>📋 Datos del pedido</h3>
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
                      onChange={e => setCliente({ ...cliente, direccion: e.target.value })} />
                  </div>
                  <div className="co-form-group">
                    <label>Ciudad</label>
                    <input placeholder="Ciudad" value={cliente.ciudad}
                      onChange={e => setCliente({ ...cliente, ciudad: e.target.value })} />
                  </div>
                  <div className="co-form-group">
                    <label>Notas adicionales</label>
                    <textarea rows={2} placeholder="Indicaciones para la entrega…" value={cliente.notas}
                      onChange={e => setCliente({ ...cliente, notas: e.target.value })} />
                  </div>

                  <div className="co-section-title" style={{ marginTop: 16 }}>Resumen del pedido</div>
                  <div className="co-mini-order">
                    {carrito.map(i => (
                      <div key={i.producto.id} className="co-mini-item">
                        <span>{i.cantidad}x {i.producto.nombre}</span>
                        <span>{formatPrecio(i.producto.precio * i.cantidad)}</span>
                      </div>
                    ))}
                    <div className="co-mini-total">
                      <span>Total a pagar</span>
                      <span>{formatPrecio(totalCarrito)}</span>
                    </div>
                  </div>

                  <button className="co-btn-dark" onClick={handleConfirmarPedido} disabled={procesando}>
                    {procesando ? "Procesando…" : "✓ Confirmar pedido"}
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

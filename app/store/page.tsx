"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { FiShoppingCart, FiSearch, FiX, FiPlus, FiMinus, FiCheck } from "react-icons/fi";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import "./store.css";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

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

export default function TiendaPage() {
  const { comercioId: authComercioId, authLoaded } = useAuth();

  // Load customizer config: esperar a que authLoaded sea true
  useEffect(() => {
    if (!authLoaded) return;

    // Limpiar inline styles de sesiones anteriores INMEDIATAMENTE (síncrono)
    const root = document.documentElement;
    root.style.removeProperty("--sp-primary");
    root.style.removeProperty("--sp-accent");
    root.style.removeProperty("font-family");

    const apply = (cfg: any) => {
      if (!cfg) return;
      if (cfg.colorPrimario) root.style.setProperty("--sp-primary", cfg.colorPrimario);
      if (cfg.colorAcento)   root.style.setProperty("--sp-accent",  cfg.colorAcento);
      if (cfg.fontFamily)    root.style.setProperty("font-family",  cfg.fontFamily);
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

    // Usar el comercioId del contexto (ya resuelto, incluso si vino de /api/auth/me)
    const cid = authComercioId ?? 1;
    fetch(`${API}/comercios/${cid}/apariencia`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          apply(data);
          localStorage.setItem("storeConfig", JSON.stringify(data));
        } else {
          try {
            const raw = localStorage.getItem("storeConfig");
            if (raw) apply(JSON.parse(raw));
          } catch {}
        }
      })
      .catch(() => {
        try {
          const raw = localStorage.getItem("storeConfig");
          if (raw) apply(JSON.parse(raw));
        } catch {}
      });
  }, [authLoaded, authComercioId]);

  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cliente, setCliente] = useState({ nombre: "", email: "", telefono: "" });
  const [storeCfg, setStoreCfg] = useState({
    nombre: "ComerciosConecta", tagline: "Tu tienda de confianza",
    heroTitle: "", heroSubtitle: "", heroCta: "",
    footerTexto: "", footerTelefono: "",
    facebook: "", instagram: "", twitter: "", tiktok: "", whatsapp: "",
  });

  // Load products from backend — esperar a que authLoaded sea true
  useEffect(() => {
    if (!authLoaded) return;
    setLoadingProductos(true);
    const cid = authComercioId;
    const productosUrl = cid ? `${API}/productos?comercioId=${cid}` : `${API}/productos`;
    fetch(productosUrl)
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        const mapped: Producto[] = data
          .filter(p => p.estado === "Activo" && p.stock > 0)
          .map(p => ({
            id: String(p.id),
            nombre: p.nombre,
            precio: p.precioVenta,
            imagen: p.imagenUrl || "",
            categoria: p.categoria || "General",
            marca: p.marca || "",
            destacado: false,
            descripcion: p.descripcion || "",
          }));
        setProductos(mapped);
      })
      .catch(() => setProductos([]))
      .finally(() => setLoadingProductos(false));
  }, [authLoaded, authComercioId]);

  const categorias = ["Todos", ...Array.from(new Set(productos.map(p => p.categoria))).filter(Boolean)];

  const productosFiltrados = productos.filter(p => {
    const q = busqueda.toLowerCase();
    const matchQ = p.nombre.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q);
    const matchCat = categoriaActiva === "Todos" || p.categoria === categoriaActiva;
    return matchQ && matchCat;
  });

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.producto.id === producto.id);
      if (existe) return prev.map(i => i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const actualizarCantidad = (id: string, cant: number) => {
    if (cant < 1) {
      setCarrito(prev => prev.filter(i => i.producto.id !== id));
      return;
    }
    setCarrito(prev => prev.map(i => i.producto.id === id ? { ...i, cantidad: cant } : i));
  };

  const remover = (id: string) => setCarrito(prev => prev.filter(i => i.producto.id !== id));

  const totalCarrito = carrito.reduce((t, i) => t + i.producto.precio * i.cantidad, 0);
  const totalItems   = carrito.reduce((t, i) => t + i.cantidad, 0);

  const formatPrecio = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p);

  const renderEstrellas = (n = 4.5) =>
    "★".repeat(Math.floor(n)) + (n % 1 >= 0.5 ? "☆" : "") + "☆".repeat(5 - Math.ceil(n));

  const handleCheckout = async () => {
    if (carrito.length === 0) { alert("Tu carrito está vacío"); return; }
    if (!cliente.nombre || !cliente.email || !cliente.telefono) {
      alert("Por favor completa los datos del cliente");
      return;
    }

    let total = totalCarrito * 100;
    if (total < 15000000) {
      alert(`El monto mínimo de Wompi es $150.000 COP. Se ajustará el cargo.`);
      total = 15000000;
    }

    setProcesandoPago(true);
    try {
      const orderReq = {
        customerName:  cliente.nombre,
        customerEmail: cliente.email,
        customerPhone: cliente.telefono,
        totalInCents:  Math.round(total),
        items: carrito.map(i => ({
          productoId:      Number(i.producto.id),
          nombre:          i.producto.nombre,
          cantidad:        i.cantidad,
          priceInCents:    Math.round(i.producto.precio * 100),
          ivaPercentage:   19,
          subtotalInCents: Math.round(i.producto.precio * i.cantidad * 100),
        })),
      };

      const orderRes = await fetch(`${API}/checkout/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderReq),
      });
      if (!orderRes.ok) throw new Error("Error creando la orden");
      const { orderId } = await orderRes.json();

      const linkRes = await fetch(`${API}/checkout/create-payment-link/${orderId}`, { method: "POST" });
      if (!linkRes.ok) throw new Error("Error creando link de pago");
      const { payment_url } = await linkRes.json();

      window.location.href = payment_url;
    } catch (err) {
      console.error(err);
      alert("Error procesando el pago");
    } finally {
      setProcesandoPago(false);
    }
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

          <button className="store-cart-btn" onClick={() => setMostrarCarrito(true)}>
            🛒 Carrito
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </button>
        </div>
      </header>

      {/* NAV */}
      <nav className="store-nav">
        <div className="nav-inner">
          {categorias.map(cat => (
            <button
              key={cat}
              className={`nav-btn ${categoriaActiva === cat ? "active" : ""}`}
              onClick={() => setCategoriaActiva(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <h2>{storeCfg.heroTitle || "Bienvenido a nuestra tienda"}</h2>
        <p>{storeCfg.heroSubtitle || "Productos de calidad premium · Envíos rápidos · Precios increíbles"}</p>
        <button className="hero-btn" onClick={() => document.querySelector(".products-section")?.scrollIntoView({ behavior: "smooth" })}>
          {storeCfg.heroCta || "Explorar Productos"}
        </button>
      </div>

      {/* PRODUCTS */}
      <div className="products-section">
        <div className="section-title">
          <h2>{categoriaActiva === "Todos" ? "Productos Destacados" : categoriaActiva}</h2>
          <p>
            {loadingProductos
              ? "Cargando productos…"
              : `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? "s" : ""} encontrado${productosFiltrados.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {loadingProductos ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>Cargando productos…</div>
        ) : productosFiltrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>No se encontraron productos</p>
            <p style={{ fontSize: ".9rem", marginTop: 6 }}>Intenta con otro término o categoría</p>
          </div>
        ) : (
          <div className="products-grid">
            {productosFiltrados.map(p => (
              <div key={p.id} className="product-card">
                <div className="product-img">
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre} />
                  ) : (
                    <span>📦</span>
                  )}
                  {p.destacado && <span className="featured-badge">Destacado</span>}
                  {p.precioAnterior && (
                    <span className="discount-badge">
                      -{Math.round((1 - p.precio / p.precioAnterior) * 100)}%
                    </span>
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

      {/* CARRITO LATERAL */}
      {/* FOOTER */}
      <footer className="store-footer">
        <div className="store-footer-inner">
          <div className="store-footer-brand">
            <span><strong>{storeCfg.nombre}</strong></span>
            <small>{storeCfg.tagline}</small>
          </div>
          {(storeCfg.facebook || storeCfg.instagram || storeCfg.twitter || storeCfg.tiktok || storeCfg.whatsapp) && (
            <div className="store-footer-social">
              {storeCfg.facebook  && <a href={storeCfg.facebook}  target="_blank" rel="noreferrer" className="store-social-btn" title="Facebook"><FaFacebook /></a>}
              {storeCfg.instagram && <a href={storeCfg.instagram} target="_blank" rel="noreferrer" className="store-social-btn" title="Instagram"><FaInstagram /></a>}
              {storeCfg.twitter   && <a href={storeCfg.twitter}   target="_blank" rel="noreferrer" className="store-social-btn" title="X / Twitter"><FaXTwitter /></a>}
              {storeCfg.tiktok    && <a href={storeCfg.tiktok}    target="_blank" rel="noreferrer" className="store-social-btn" title="TikTok"><FaTiktok /></a>}
              {storeCfg.whatsapp  && <a href={storeCfg.whatsapp}  target="_blank" rel="noreferrer" className="store-social-btn" title="WhatsApp"><FaWhatsapp /></a>}
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

      {mostrarCarrito && (
        <div className="cart-overlay" onClick={e => { if (e.target === e.currentTarget) setMostrarCarrito(false); }}>
          <div className="cart-sidebar">
            <div className="cart-header">
              <h3>🛒 Tu Carrito</h3>
              <button className="close-btn" onClick={() => setMostrarCarrito(false)}><FiX /></button>
            </div>

            <div className="cart-items">
              {carrito.length === 0 ? (
                <div className="empty-cart">
                  <span>🛒</span>
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                carrito.map(item => (
                  <div key={item.producto.id} className="cart-item">
                    <div className="cart-item-img">
                      {item.producto.imagen ? <img src={item.producto.imagen} alt={item.producto.nombre} /> : "📦"}
                    </div>
                    <div className="cart-item-info">
                      <h4>{item.producto.nombre}</h4>
                      <div className="cart-item-price">{formatPrecio(item.producto.precio)}</div>
                      <div className="qty-ctrl">
                        <button className="qty-btn" onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}><FiMinus size={12} /></button>
                        <span className="qty-val">{item.cantidad}</span>
                        <button className="qty-btn" onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}><FiPlus size={12} /></button>
                      </div>
                    </div>
                    <button className="remove-item" onClick={() => remover(item.producto.id)}><FiX size={14} /></button>
                  </div>
                ))
              )}
            </div>

            {carrito.length > 0 && (
              <>
                <div className="cart-client-form">
                  <p>Información del Cliente</p>
                  <input
                    placeholder="Nombre completo"
                    value={cliente.nombre}
                    onChange={e => setCliente({ ...cliente, nombre: e.target.value })}
                  />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={cliente.email}
                    onChange={e => setCliente({ ...cliente, email: e.target.value })}
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={cliente.telefono}
                    onChange={e => setCliente({ ...cliente, telefono: e.target.value })}
                  />
                </div>

                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total:</span>
                    <span>{formatPrecio(totalCarrito)}</span>
                  </div>
                  <button className="checkout-btn" onClick={handleCheckout} disabled={procesandoPago}>
                    {procesandoPago ? "Procesando…" : <><FiCheck /> Proceder al Pago</>}
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

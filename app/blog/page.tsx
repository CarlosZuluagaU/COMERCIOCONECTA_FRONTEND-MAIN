import "../landing.css";
import "./blog.css";

const NOVEDADES = [
  {
    tag: "Novedad", color: "#f0fdf4", tagColor: "#15803d",
    fecha: "3 abr 2026",
    titulo: "Perfil de usuario mejorado: historial de actividad, preferencias y seguridad reforzada",
    resumen: "Ahora puedes editar nombre, apellido, documento, ciudad, dirección y biografía por separado. El perfil incluye historial de actividad real (inicio de sesión, cambios guardados) y una sección de preferencias del sistema con zona horaria y formato de fecha. El cambio de contraseña ahora exige verificar la actual antes de establecer la nueva.",
    autor: "Equipo ComerciosConecta", lectura: "2 min",
    emoji: "👤",
  },
  {
    tag: "Novedad", color: "#f0fdf4", tagColor: "#15803d",
    fecha: "2 abr 2026",
    titulo: "Numeración de pedidos independiente por comercio",
    resumen: "Cada comercio tiene ahora su propia secuencia de números de pedido que empieza desde #1. Los pedidos ya no comparten numeración global, lo que facilita el seguimiento y la comunicación con clientes.",
    autor: "Equipo ComerciosConecta", lectura: "1 min",
    emoji: "🔢",
  },
  {
    tag: "Novedad", color: "#f0fdf4", tagColor: "#15803d",
    fecha: "1 abr 2026",
    titulo: "Aislamiento completo de datos entre comercios",
    resumen: "Se implementó aislamiento total multi-tenant: los productos, ventas, clientes, pedidos y facturas de cada comercio son completamente privados e independientes. Ningún comercio puede ver ni acceder a los datos de otro.",
    autor: "Equipo ComerciosConecta", lectura: "2 min",
    emoji: "🔒",
  },
  {
    tag: "Novedad", color: "#f0fdf4", tagColor: "#15803d",
    fecha: "31 mar 2026",
    titulo: "Nuevos endpoints: categorías y marcas por comercio",
    resumen: "Se agregaron los endpoints GET /api/productos/categorias?comercioId=X y GET /api/productos/marcas?comercioId=X que devuelven los valores únicos usados por cada comercio, permitiendo filtros inteligentes en el catálogo.",
    autor: "Equipo ComerciosConecta", lectura: "1 min",
    emoji: "🏷️",
  },
];

const POSTS = [
  {
    tag: "Facturación", color: "#d1fae5", tagColor: "#065f46",
    fecha: "28 mar 2026",
    titulo: "Cómo emitir tu primera factura electrónica en Colombia sin morir en el intento",
    resumen: "La DIAN exige factura electrónica para todos los negocios. Te explicamos paso a paso cómo hacerlo desde ComerciosConecta en menos de 10 minutos.",
    autor: "Carlos Zuluaga", lectura: "5 min", emoji: "📊",
  },
  {
    tag: "E-commerce", color: "#dbeafe", tagColor: "#1e40af",
    fecha: "20 mar 2026",
    titulo: "5 estrategias para aumentar tus ventas online con una tienda sencilla",
    resumen: "No necesitas una gran inversión. Con estas técnicas prácticas puedes duplicar tus pedidos digitales en semanas.",
    autor: "Yuliana Gómez", lectura: "4 min", emoji: "🛒",
  },
  {
    tag: "Inventario", color: "#fef3c7", tagColor: "#92400e",
    fecha: "12 mar 2026",
    titulo: "El error que más le cuesta dinero a los pequeños comercios (y cómo evitarlo)",
    resumen: "Vender un producto que no tienes en stock destruye la confianza del cliente. Así se controla el inventario en tiempo real.",
    autor: "Andrés Pérez", lectura: "3 min", emoji: "📦",
  },
  {
    tag: "Pagos", color: "#ede9fe", tagColor: "#5b21b6",
    fecha: "5 mar 2026",
    titulo: "Wompi vs. otras pasarelas de pago en Colombia: ¿cuál elegir en 2026?",
    resumen: "Comparamos comisiones, velocidad de desembolso y facilidad de integración de las principales opciones del mercado colombiano.",
    autor: "Laura Martínez", lectura: "6 min", emoji: "💳",
  },
  {
    tag: "Clientes", color: "#fce7f3", tagColor: "#9d174d",
    fecha: "25 feb 2026",
    titulo: "Cómo fidelizar clientes en un negocio físico usando herramientas digitales",
    resumen: "El seguimiento post-venta marca la diferencia. Te mostramos cómo usar el historial de compras para volver a venderle al mismo cliente.",
    autor: "Carlos Zuluaga", lectura: "4 min", emoji: "👥",
  },
  {
    tag: "Guía", color: "#d1fae5", tagColor: "#065f46",
    fecha: "15 feb 2026",
    titulo: "Guía completa: montar tu tienda online en Colombia desde cero",
    resumen: "Desde el dominio hasta el primer pedido pagado. Una guía práctica para comerciantes que nunca han vendido en línea.",
    autor: "Yuliana Gómez", lectura: "8 min", emoji: "📋",
  },
];

export default function BlogPage() {
  return (
    <div className="landing-root">
      {/* NAV */}
      <nav className="lp-nav">
        <div className="nav-inner">
          <a className="lp-logo" href="/">
            <div className="logo-icon">🛍</div>
            Comercios<span>Conecta</span>
          </a>
          <div className="nav-links">
            <a href="/#features">Funciones</a>
            <a href="/#how">Cómo funciona</a>
            <a href="/#pricing">Precios</a>
            <a href="/#testimonials">Clientes</a>
          </div>
          <div className="nav-cta">
            <a className="nav-login" href="/login">Iniciar sesión</a>
            <a className="nav-btn" href="/register">Prueba gratis →</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="blog-hero">
        <div className="container">
          <span className="badge badge-white">📝 Blog</span>
          <h1>Recursos para hacer crecer<br /><span className="hl">tu comercio</span></h1>
          <p>Guías prácticas, casos de uso y novedades del mundo pyme en Colombia.</p>
          <div className="blog-search">
            <input type="text" placeholder="Buscar artículos…" />
            <button>Buscar</button>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="blog-cats">
        <div className="container">
          <div className="cats-row">
            {["Todos", "🆕 Novedades", "Facturación", "E-commerce", "Inventario", "Pagos", "Clientes", "Guías"].map(c => (
              <button key={c} className={`cat-btn${c === "Todos" ? " active" : ""}`}>{c}</button>
            ))}
          </div>
        </div>
      </section>

      {/* POST DESTACADO */}
      <section className="blog-featured">
        <div className="container">
          <div className="featured-card">
            <div className="featured-img">
              <div className="featured-placeholder">📊</div>
            </div>
            <div className="featured-body">
              <span className="post-tag" style={{ background: "#d1fae5", color: "#065f46" }}>Facturación</span>
              <h2>Cómo emitir tu primera factura electrónica en Colombia sin morir en el intento</h2>
              <p>La DIAN exige factura electrónica para todos los negocios. Te explicamos paso a paso cómo hacerlo desde ComerciosConecta en menos de 10 minutos.</p>
              <div className="post-meta">
                <span className="post-autor">Carlos Zuluaga</span>
                <span>·</span>
                <span>28 mar 2026</span>
                <span>·</span>
                <span>5 min de lectura</span>
              </div>
              <a className="btn btn-dark" href="#" style={{ marginTop: 20, width: "fit-content" }}>Leer artículo →</a>
            </div>
          </div>
        </div>
      </section>

      {/* NOVEDADES DE LA PLATAFORMA */}
      <section className="blog-grid-section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <h3 className="grid-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ background: "#dcfce7", color: "#15803d", fontSize: ".72rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "1px solid #bbf7d0" }}>NUEVO</span>
            Novedades de la plataforma
          </h3>
          <div className="novedades-list">
            {NOVEDADES.map(nov => (
              <div key={nov.titulo} className="novedad-item">
                <div className="novedad-icon">{nov.emoji}</div>
                <div className="novedad-body">
                  <div className="novedad-meta">
                    <span className="post-tag" style={{ background: nov.color, color: nov.tagColor, fontSize: ".68rem" }}>{nov.tag}</span>
                    <span className="novedad-fecha">{nov.fecha}</span>
                    <span className="novedad-lectura">· {nov.lectura} de lectura</span>
                  </div>
                  <h4 className="novedad-titulo">{nov.titulo}</h4>
                  <p className="novedad-resumen">{nov.resumen}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GRID DE POSTS */}
      <section className="blog-grid-section">
        <div className="container">
          <h3 className="grid-section-title">Artículos recientes</h3>
          <div className="blog-grid">
            {POSTS.slice(1).map(post => (
              <a key={post.titulo} href="#" className="post-card">
                <div className="post-card-img" style={{ background: post.color }}>
                  <span style={{ fontSize: "2rem" }}>{post.emoji}</span>
                </div>
                <div className="post-card-body">
                  <span className="post-tag" style={{ background: post.color, color: post.tagColor }}>{post.tag}</span>
                  <h4>{post.titulo}</h4>
                  <p>{post.resumen}</p>
                  <div className="post-meta">
                    <span>{post.autor}</span><span>·</span><span>{post.fecha}</span><span>·</span><span>{post.lectura}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="blog-newsletter">
        <div className="container">
          <div className="newsletter-box">
            <div>
              <h3>📬 Recibe tips cada semana</h3>
              <p>Contenido práctico para comerciantes colombianos. Sin spam.</p>
            </div>
            <div className="newsletter-form">
              <input type="email" placeholder="tu@correo.com" />
              <button>Suscribirme</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="lp-logo" style={{ marginBottom: 12 }}><div className="logo-icon">🛍</div>Comercios<span>Conecta</span></div>
              <p>La plataforma todo-en-uno para pymes colombianas.</p>
            </div>
            <div className="footer-col"><h5>Producto</h5><a href="/#features">Funciones</a><a href="/#pricing">Precios</a><a href="/#how">Cómo funciona</a></div>
            <div className="footer-col"><h5>Empresa</h5><a href="/nosotros">Nosotros</a><a href="/blog">Blog</a></div>
            <div className="footer-col"><h5>Soporte</h5><a href="/centro-ayuda">Centro de ayuda</a><a href="/contacto">Contacto</a></div>
          </div>
          <div className="footer-bottom"><span>© 2026 ComerciosConecta. Todos los derechos reservados.</span><span>Hecho con ❤️ en Colombia 🇨🇴</span></div>
        </div>
      </footer>
    </div>
  );
}

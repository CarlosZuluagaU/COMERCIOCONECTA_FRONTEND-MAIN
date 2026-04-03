import "../landing.css";
import "./nosotros.css";

export default function NosotrosPage() {
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
      <section className="nos-hero">
        <div className="container">
          <div className="section-tag">
            <span className="badge badge-white">🇨🇴 Hecho en Colombia</span>
          </div>
          <h1>Creemos en el <span className="hl">comercio local</span><br />como motor de Colombia</h1>
          <p>Somos un equipo apasionado por la tecnología y los pequeños negocios. ComerciosConecta nació para darle a las pymes colombianas las herramientas que solo tienen las grandes empresas.</p>
        </div>
      </section>

      {/* MISIÓN / VISIÓN / VALORES */}
      <section className="nos-mvv">
        <div className="container">
          <div className="mvv-grid">
            <div className="mvv-card">
              <div className="mvv-icon">🎯</div>
              <h3>Misión</h3>
              <p>Empoderar a los comerciantes colombianos con tecnología accesible, simple y poderosa, para que puedan vender más, operar mejor y crecer con confianza.</p>
            </div>
            <div className="mvv-card mvv-card--accent">
              <div className="mvv-icon">🔭</div>
              <h3>Visión</h3>
              <p>Ser la plataforma de gestión comercial número 1 de Latinoamérica para pymes, conectando negocios con sus clientes de forma digital, eficiente y humana.</p>
            </div>
            <div className="mvv-card">
              <div className="mvv-icon">💡</div>
              <h3>Valores</h3>
              <ul className="mvv-list">
                <li>✅ Simplicidad sobre complejidad</li>
                <li>✅ Datos seguros y privados</li>
                <li>✅ Soporte humano real</li>
                <li>✅ Innovación continua</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="nos-story">
        <div className="container">
          <div className="nos-story-grid">
            <div className="nos-story-text">
              <span className="badge badge-accent">Nuestra historia</span>
              <h2 className="section-title" style={{ marginTop: 14 }}>
                Empezamos como clientes<br />frustrados
              </h2>
              <p>En 2023, los fundadores de ComerciosConecta gestionaban un pequeño negocio en Medellín. Usaban hojas de cálculo para el inventario, WhatsApp para los pedidos y un cuaderno para las ventas. Era caótico.</p>
              <p style={{ marginTop: 16 }}>Buscaron soluciones existentes y encontraron sistemas caros, complejos o hechos para otras realidades. Decidieron construir la plataforma que ellos mismos necesitaban.</p>
              <p style={{ marginTop: 16 }}>Hoy, ComerciosConecta ayuda a decenas de comercios en todo el país a crecer con tecnología que realmente funciona para el mercado colombiano.</p>
            </div>
            <div className="nos-timeline">
              {[
                { year: "2023", label: "Fundación", desc: "Nace la idea en Medellín. Primer prototipo." },
                { year: "2024", label: "Primer lanzamiento", desc: "Beta con 20 comercios piloto. Feedback intenso." },
                { year: "2025", label: "Facturación electrónica", desc: "Integración con Factus. Primer comercio factura en minutos." },
                { year: "2026", label: "E-commerce integrado", desc: "Tienda online + pagos Wompi en una sola plataforma." },
              ].map(({ year, label, desc }) => (
                <div key={year} className="tl-item">
                  <div className="tl-dot" />
                  <div>
                    <div className="tl-year">{year}</div>
                    <div className="tl-label">{label}</div>
                    <div className="tl-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EQUIPO */}
      <section className="nos-team">
        <div className="container">
          <div className="section-tag">
            <span className="badge badge-accent">El equipo</span>
          </div>
          <h2 className="section-title" style={{ marginTop: 14, textAlign: "center" }}>Las personas detrás del producto</h2>
          <div className="team-grid">
            {[
              { inicial: "C", nombre: "Carlos Zuluaga", rol: "CEO & Co-fundador", desc: "Ingeniero de sistemas. Obsesionado con el producto y la experiencia de usuario." },
              { inicial: "Y", nombre: "Yuliana Gómez", rol: "CTO & Co-fundadora", desc: "Desarrolladora full-stack. Construye la arquitectura que mueve el negocio." },
              { inicial: "A", nombre: "Andrés Pérez", rol: "Head of Sales", desc: "Ex-comerciante. Conoce el dolor del cliente porque lo vivió en carne propia." },
              { inicial: "L", nombre: "Laura Martínez", rol: "Diseño & UX", desc: "Diseñadora que hace que lo complejo parezca simple. Defensora del usuario." },
            ].map(({ inicial, nombre, rol, desc }) => (
              <div key={nombre} className="team-card">
                <div className="team-avatar">{inicial}</div>
                <h4>{nombre}</h4>
                <span className="team-rol">{rol}</span>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="nos-cta">
        <div className="container">
          <h2>¿Listo para crecer con nosotros?</h2>
          <p>Empieza gratis, sin tarjeta de crédito, en menos de 5 minutos.</p>
          <a className="btn btn-primary" href="/register">Crear cuenta gratis →</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="lp-logo" style={{ marginBottom: 12 }}>
                <div className="logo-icon">🛍</div>
                Comercios<span>Conecta</span>
              </div>
              <p>La plataforma todo-en-uno para pymes colombianas.</p>
            </div>
            <div className="footer-col"><h5>Producto</h5><a href="/#features">Funciones</a><a href="/#pricing">Precios</a><a href="/#how">Cómo funciona</a></div>
            <div className="footer-col"><h5>Empresa</h5><a href="/nosotros">Nosotros</a><a href="/blog">Blog</a></div>
            <div className="footer-col"><h5>Soporte</h5><a href="/centro-ayuda">Centro de ayuda</a><a href="/contacto">Contacto</a></div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 ComerciosConecta. Todos los derechos reservados.</span>
            <span>Hecho con ❤️ en Colombia 🇨🇴</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

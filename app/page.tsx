import "./landing.css";

export default function LandingPage() {
  return (
    <div className="landing-root">
      <nav className="lp-nav">
        <div className="nav-inner">
          <div className="lp-logo">
            <div className="logo-icon">🛍</div>
            Comercios<span>Conecta</span>
          </div>
          <div className="nav-links">
            <a href="#features">Funciones</a>
            <a href="#how">Cómo funciona</a>
            <a href="#pricing">Precios</a>
            <a href="#testimonials">Clientes</a>
          </div>
          <div className="nav-cta">
            <a className="nav-login" href="/login">Iniciar sesión</a>
            <a className="nav-btn" href="/register">Prueba gratis →</a>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-left">
              <div className="hero-eyebrow">
                <span className="badge badge-white">✨ Nuevo · Facturación electrónica integrada</span>
              </div>
              <h1 className="hero-title">
                Gestiona tu<br />comercio con<br /><span className="hl">superpoderes</span>
              </h1>
              <p className="hero-desc">
                La plataforma todo-en-uno para pymes colombianas. Inventario, ventas, e-commerce y facturación Factus — todo conectado y listo en minutos.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="/register">Empieza gratis 14 días</a>
                <a className="btn btn-outline" href="#how">Ver demo →</a>
              </div>
              <div className="hero-trust">
                <div className="avatars">
                  <span>M</span><span>C</span><span>A</span><span>+</span>
                </div>
                <p className="trust-text">Más de <strong>+800 comercios</strong> ya confían en nosotros</p>
              </div>
            </div>
            <div className="hero-right">
              <div className="hero-glow"></div>
              <div className="dashboard-preview">
                <div className="dp-header">
                  <div className="dp-dots">
                    <div className="dp-dot" style={{ background: "#ff5f57" }}></div>
                    <div className="dp-dot" style={{ background: "#febc2e" }}></div>
                    <div className="dp-dot" style={{ background: "#28c840" }}></div>
                  </div>
                  <div className="dp-title">Panel · ComerciosConecta</div>
                </div>
                <div className="dp-body">
                  <div className="dp-stats">
                    <div className="dp-stat"><div className="lbl">Ventas hoy</div><div className="val green">$4.8M</div></div>
                    <div className="dp-stat"><div className="lbl">Órdenes</div><div className="val">38</div></div>
                    <div className="dp-stat"><div className="lbl">Productos</div><div className="val">127</div></div>
                  </div>
                  <div className="dp-chart">
                    <div className="dp-chart-label">Ventas últimos 7 días</div>
                    <div className="bars">
                      <div className="bar" style={{ height: "30%" }}></div>
                      <div className="bar" style={{ height: "55%" }}></div>
                      <div className="bar" style={{ height: "40%" }}></div>
                      <div className="bar" style={{ height: "75%" }}></div>
                      <div className="bar" style={{ height: "60%" }}></div>
                      <div className="bar" style={{ height: "85%" }}></div>
                      <div className="bar" style={{ height: "100%" }}></div>
                    </div>
                  </div>
                  <div className="dp-list">
                    <div className="dp-row">
                      <div className="dp-row-left"><div className="dp-icon">🛒</div>Crema Hidratante</div>
                      <span className="chip chip-green">Activo</span>
                    </div>
                    <div className="dp-row">
                      <div className="dp-row-left"><div className="dp-icon">📦</div>Stock bajo: MAC</div>
                      <span className="chip chip-yellow">Alerta</span>
                    </div>
                    <div className="dp-row">
                      <div className="dp-row-left"><div className="dp-icon">🧾</div>Venta #38 facturada</div>
                      <span className="chip chip-green">OK</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="logos-section">
        <div className="container">
          <p className="logos-label">Integraciones incluidas</p>
          <div className="logos-grid">
            <div className="logo-item">WOMPI</div>
            <div className="logo-item">FACTUS</div>
            <div className="logo-item">DIAN</div>
            <div className="logo-item">PostgreSQL</div>
            <div className="logo-item">WhatsApp</div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <div className="features-header">
            <div className="section-tag"><span className="badge badge-accent">Funcionalidades</span></div>
            <h2 className="section-title">Todo lo que necesita tu negocio, en un solo lugar</h2>
            <p className="section-sub">Sin tecnicismos, sin configuraciones complejas. Empieza a vender en minutos.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feat-icon" style={{ background: "#e0f2fe" }}>📦</div>
              <h3>Inventario Inteligente</h3>
              <p>Controla tu stock en tiempo real. Alertas automáticas cuando un producto baje del mínimo.</p>
              <span className="feat-tag">→ Ver más</span>
            </div>
            <div className="feature-card">
              <div className="feat-icon" style={{ background: "#d1fae5" }}>🛍️</div>
              <h3>Tienda Online Propia</h3>
              <p>Tu e-commerce personalizado con tu logo y colores. Pagos vía Wompi integrados.</p>
              <span className="feat-tag">→ Ver más</span>
            </div>
            <div className="feature-card">
              <div className="feat-icon" style={{ background: "#fef9c3" }}>🧾</div>
              <h3>Facturación Electrónica</h3>
              <p>Genera facturas DIAN-válidas con Factus automáticamente desde cada venta.</p>
              <span className="feat-tag">→ Ver más</span>
            </div>
            <div className="feature-card">
              <div className="feat-icon" style={{ background: "#ede9fe" }}>📊</div>
              <h3>Dashboard en Tiempo Real</h3>
              <p>KPIs de ventas, inventario y e-commerce en una sola pantalla.</p>
              <span className="feat-tag">→ Ver más</span>
            </div>
            <div className="feature-card">
              <div className="feat-icon" style={{ background: "#fee2e2" }}>👥</div>
              <h3>Gestión de Clientes</h3>
              <p>CRM básico con historial de compras, datos de facturación y segmentación.</p>
              <span className="feat-tag">→ Ver más</span>
            </div>
            <div className="feature-card">
              <div className="feat-icon" style={{ background: "#fce7f3" }}>🎨</div>
              <h3>Tienda Personalizable</h3>
              <p>Cambia colores, logo y contenido de tu tienda en vivo. Sin código, sin diseñador.</p>
              <span className="feat-tag">→ Ver más</span>
            </div>
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <div className="container">
          <div className="how-header">
            <div className="section-tag"><span className="badge badge-accent">Proceso</span></div>
            <h2 className="section-title">En 4 pasos estás vendiendo</h2>
            <p className="section-sub">Sin instalaciones ni conocimiento técnico requerido.</p>
          </div>
          <div className="steps">
            <div className="step"><div className="step-num">1</div><h4>Crea tu cuenta</h4><p>Regístrarte toma menos de 2 minutos.</p></div>
            <div className="step"><div className="step-num">2</div><h4>Carga tu inventario</h4><p>Importa desde Excel o carga uno a uno.</p></div>
            <div className="step"><div className="step-num">3</div><h4>Personaliza tu tienda</h4><p>Elige colores, sube tu logo y configura categorías.</p></div>
            <div className="step"><div className="step-num">4</div><h4>¡Empieza a vender!</h4><p>Comparte el link de tu tienda.</p></div>
          </div>
        </div>
      </section>

      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid-4">
            <div className="stat-item"><div className="num">+800</div><div className="label">Comercios activos</div></div>
            <div className="stat-item"><div className="num">$2.4B</div><div className="label">Facturado en la plataforma</div></div>
            <div className="stat-item"><div className="num">99.9%</div><div className="label">Uptime garantizado</div></div>
            <div className="stat-item"><div className="num">4.9★</div><div className="label">Calificación promedio</div></div>
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="container">
          <div className="pricing-header">
            <div className="section-tag"><span className="badge badge-accent">Planes</span></div>
            <h2 className="section-title">Precios claros, sin sorpresas</h2>
            <p className="section-sub">Empieza gratis. Crece sin límites.</p>
          </div>
          <div className="pricing-grid">
            <div className="price-card">
              <div className="price-name">Starter</div>
              <div className="price-amount"><span className="curr">$</span><span className="amt">0</span><span className="period">/mes</span></div>
              <div className="price-desc">Para comercios que empiezan</div>
              <hr className="price-divider" />
              <div className="price-features">
                <div className="pf"><div className="pf-check">✓</div>Hasta 50 productos</div>
                <div className="pf"><div className="pf-check">✓</div>1 usuario</div>
                <div className="pf"><div className="pf-check">✓</div>Tienda online básica</div>
                <div className="pf"><div className="pf-check">✓</div>10 ventas/mes</div>
              </div>
              <a href="/register" className="btn-price btn-price-outline">Comenzar gratis</a>
            </div>
            <div className="price-card popular">
              <div className="popular-label">⚡ Más popular</div>
              <div className="price-name">Pro</div>
              <div className="price-amount"><span className="curr">$</span><span className="amt">89K</span><span className="period">/mes</span></div>
              <div className="price-desc">Para comercios en crecimiento</div>
              <hr className="price-divider" />
              <div className="price-features">
                <div className="pf"><div className="pf-check">✓</div>Productos ilimitados</div>
                <div className="pf"><div className="pf-check">✓</div>3 usuarios</div>
                <div className="pf"><div className="pf-check">✓</div>Tienda personalizable</div>
                <div className="pf"><div className="pf-check">✓</div>Ventas ilimitadas</div>
                <div className="pf"><div className="pf-check">✓</div>Facturación electrónica</div>
                <div className="pf"><div className="pf-check">✓</div>Soporte prioritario</div>
              </div>
              <a href="/register" className="btn-price btn-price-accent">Empezar ahora →</a>
            </div>
            <div className="price-card">
              <div className="price-name">Enterprise</div>
              <div className="price-amount"><span className="curr">$</span><span className="amt">199K</span><span className="period">/mes</span></div>
              <div className="price-desc">Para cadenas y multitiendas</div>
              <hr className="price-divider" />
              <div className="price-features">
                <div className="pf"><div className="pf-check">✓</div>Todo en Pro</div>
                <div className="pf"><div className="pf-check">✓</div>Usuarios ilimitados</div>
                <div className="pf"><div className="pf-check">✓</div>Múltiples sucursales</div>
                <div className="pf"><div className="pf-check">✓</div>API acceso completo</div>
              </div>
              <a href="/login" className="btn-price btn-price-outline">Contactar ventas</a>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials" id="testimonials">
        <div className="container">
          <div className="test-header">
            <div className="section-tag"><span className="badge badge-accent">Testimonios</span></div>
            <h2 className="section-title">Lo que dicen nuestros clientes</h2>
          </div>
          <div className="test-grid">
            <div className="test-card">
              <div className="stars">★★★★★</div>
              <p className="test-text">Antes llevaba todo en Excel. Hoy tengo mi tienda online, facturo y veo mis ventas en tiempo real.</p>
              <div className="test-author"><div className="test-avatar">M</div><div><div className="test-name">María González</div><div className="test-role">Farmacia La Salud, Bogotá</div></div></div>
            </div>
            <div className="test-card">
              <div className="stars">★★★★★</div>
              <p className="test-text">La facturación electrónica con Factus me salvó. Ahora todo sale automático desde el sistema.</p>
              <div className="test-author"><div className="test-avatar">C</div><div><div className="test-name">Carlos Rodríguez</div><div className="test-role">Distribuidora CR, Medellín</div></div></div>
            </div>
            <div className="test-card">
              <div className="stars">★★★★★</div>
              <p className="test-text">Personalicé mi tienda online con mis colores en 10 minutos. Mis clientes sienten que es mi propia plataforma.</p>
              <div className="test-author"><div className="test-avatar">A</div><div><div className="test-name">Ana Martínez</div><div className="test-role">Beauty Store, Cali</div></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <h2 className="cta-title">Listo para llevar tu<br />comercio al <span>siguiente nivel</span>?</h2>
            <p className="cta-sub">14 días gratis. Sin tarjeta de crédito. Cancela cuando quieras.</p>
            <div className="cta-actions">
              <a className="btn btn-primary" href="/register">Crear cuenta gratis →</a>
              <a className="btn btn-outline" href="/login">Hablar con un asesor</a>
            </div>
            <p className="cta-note">✓ Sin contrato · ✓ Soporte en español · ✓ Datos en Colombia</p>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="lp-logo" style={{ marginBottom: 12 }}>
                <div className="logo-icon">🛍</div>
                Comercios<span>Conecta</span>
              </div>
              <p>La plataforma todo-en-uno para pymes colombianas. Vende más, gestiona mejor.</p>
              <div className="footer-social">
                <a className="soc" href="#" aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a className="soc" href="#" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a className="soc" href="#" aria-label="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a className="soc" href="#" aria-label="X / Twitter">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>
            <div className="footer-col">
              <h5>Producto</h5>
              <a href="#features">Funciones</a>
              <a href="#pricing">Precios</a>
              <a href="#how">Cómo funciona</a>
            </div>
            <div className="footer-col">
              <h5>Empresa</h5>
              <a href="/nosotros">Nosotros</a>
              <a href="/blog">Blog</a>
            </div>
            <div className="footer-col">
              <h5>Soporte</h5>
              <a href="/centro-ayuda">Centro de ayuda</a>
              <a href="/contacto">Contacto</a>
            </div>
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

"use client";
import { useState } from "react";
import "../landing.css";
import "./centro-ayuda.css";

const FAQS = [
  {
    cat: "Cuenta y registro",
    items: [
      { q: "¿Cómo creo mi cuenta en ComerciosConecta?", a: "Ve a la página de registro, ingresa tus datos personales y los de tu comercio. En menos de 2 minutos tendrás acceso a tu panel. No necesitas tarjeta de crédito para la prueba de 14 días." },
      { q: "¿Puedo registrarme con mi cuenta de Google?", a: "Sí. En la pantalla de registro verás el botón 'Registrarse con Google'. Conecta tu cuenta y completa los datos de tu comercio para finalizar." },
      { q: "¿Cómo cambio mi contraseña?", a: "Inicia sesión, ve a Mi Perfil (ícono superior derecho) y en la sección 'Cambiar Contraseña' ingresa tu nueva clave. Los cambios se aplican de inmediato." },
      { q: "¿Puedo tener varios usuarios con el mismo comercio?", a: "Actualmente cada comercio tiene un usuario administrador. El soporte multi-usuario está en nuestro roadmap para el segundo semestre de 2026." },
    ],
  },
  {
    cat: "Facturación electrónica",
    items: [
      { q: "¿Necesito algo especial para facturar electrónicamente?", a: "Solo necesitas tu RUT y estar registrado en el RUTe de la DIAN. ComerciosConecta se conecta con Factus para generar y enviar las facturas automáticamente." },
      { q: "¿Puedo facturar a personas naturales sin RUT?", a: "Sí. Para consumidores finales puedes emitir una factura de venta con número de cédula. Para empresas se requiere NIT." },
      { q: "¿Qué pasa si la DIAN rechaza mi factura?", a: "El sistema te notifica el error con el código de rechazo de la DIAN. Puedes corregir los datos y volver a enviarla desde el mismo panel." },
      { q: "¿Las facturas se envían por correo automáticamente al cliente?", a: "Sí, cuando marcas una venta como facturada el sistema envía automáticamente el PDF de la factura al correo del cliente registrado." },
    ],
  },
  {
    cat: "E-commerce y pagos",
    items: [
      { q: "¿Cómo activo mi tienda online?", a: "Ve a Personalización → Tu Tienda. Puedes personalizar colores, logo y descripción. Tu tienda tendrá una URL única que puedes compartir con tus clientes." },
      { q: "¿Cómo funciona el pago con Wompi?", a: "Al crear un pedido en tu tienda, el cliente elige pagar con Wompi y es redirigido a la pasarela. Cuando el pago se aprueba, el inventario se descuenta automáticamente." },
      { q: "¿Cuánto tiempo demora el desembolso de Wompi?", a: "Wompi desembolsa en 2 días hábiles directamente a tu cuenta bancaria. ComerciosConecta no retiene ningún pago." },
      { q: "¿Puedo recibir pagos en efectivo desde la tienda?", a: "Por ahora la tienda online solo procesa pagos digitales vía Wompi. Los pagos en efectivo se registran manualmente desde el módulo de Ventas." },
    ],
  },
  {
    cat: "Inventario y productos",
    items: [
      { q: "¿Cómo agrego productos al inventario?", a: "Ve a Productos → Agregar Producto. Completa nombre, precio, categoría y stock inicial. Puedes subir una imagen de hasta 2 MB." },
      { q: "¿El inventario se descuenta automáticamente al hacer una venta?", a: "Sí. Cuando registras una venta o se aprueba un pedido del e-commerce, el stock se actualiza en tiempo real." },
      { q: "¿Puedo importar mis productos desde Excel?", a: "La importación masiva por Excel está en desarrollo. Mientras tanto, puedes agregar productos uno a uno desde el panel." },
      { q: "¿Qué es el stock mínimo?", a: "Es la cantidad mínima de unidades que quieres tener. Cuando el stock baja de ese valor, el sistema te alerta para que hagas un pedido a tu proveedor." },
    ],
  },
];

export default function CentroAyudaPage() {
  const [openCat, setOpenCat] = useState(0);
  const [openItem, setOpenItem] = useState<number | null>(null);

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
      <section className="ayuda-hero">
        <div className="container">
          <span className="badge badge-white">❓ Centro de ayuda</span>
          <h1>¿En qué podemos<br /><span className="hl">ayudarte?</span></h1>
          <div className="ayuda-search">
            <input type="text" placeholder="Busca tu pregunta… ej: ¿cómo facturo?" />
            <button>Buscar</button>
          </div>
          <div className="ayuda-quick">
            {["Crear cuenta", "Facturación electrónica", "Mi tienda online", "Pagos Wompi"].map(t => (
              <span key={t} className="quick-tag">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="ayuda-faq">
        <div className="container">
          <div className="faq-layout">

            {/* Categorías */}
            <div className="faq-cats">
              {FAQS.map((cat, i) => (
                <button
                  key={cat.cat}
                  className={`faq-cat-btn${openCat === i ? " active" : ""}`}
                  onClick={() => { setOpenCat(i); setOpenItem(null); }}
                >
                  {cat.cat}
                </button>
              ))}
              <div className="faq-contact-box">
                <p>¿No encontraste tu respuesta?</p>
                <a href="/contacto" className="btn btn-dark" style={{ fontSize: ".82rem", padding: "10px 18px" }}>
                  Contactar soporte →
                </a>
              </div>
            </div>

            {/* Preguntas */}
            <div className="faq-items">
              <h2>{FAQS[openCat].cat}</h2>
              {FAQS[openCat].items.map((item, idx) => (
                <div
                  key={idx}
                  className={`faq-item${openItem === idx ? " open" : ""}`}
                  onClick={() => setOpenItem(openItem === idx ? null : idx)}
                >
                  <div className="faq-q">
                    <span>{item.q}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: openItem === idx ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openItem === idx && (
                    <div className="faq-a">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA CONTACTO */}
      <section className="ayuda-cta">
        <div className="container">
          <div className="ayuda-cta-grid">
            <div className="ayuda-cta-card">
              <div className="ayuda-cta-icon">💬</div>
              <h4>Chat en vivo</h4>
              <p>Habla con un asesor en tiempo real de lunes a viernes, 8 a.m. – 6 p.m.</p>
              <a href="/contacto#chat" className="btn btn-dark" style={{ fontSize: ".82rem", padding: "10px 20px", marginTop: 12 }}>Abrir chat</a>
            </div>
            <div className="ayuda-cta-card ayuda-cta-card--accent">
              <div className="ayuda-cta-icon">📧</div>
              <h4>Correo electrónico</h4>
              <p>Envíanos tu pregunta y te respondemos en menos de 24 horas hábiles.</p>
              <a href="/contacto" className="btn btn-primary" style={{ fontSize: ".82rem", padding: "10px 20px", marginTop: 12 }}>Escribirnos</a>
            </div>
            <div className="ayuda-cta-card">
              <div className="ayuda-cta-icon">📚</div>
              <h4>Documentación</h4>
              <p>Tutoriales en video y guías paso a paso para cada función del sistema.</p>
              <a href="/blog" className="btn btn-dark" style={{ fontSize: ".82rem", padding: "10px 20px", marginTop: 12 }}>Ver guías</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand"><div className="lp-logo" style={{ marginBottom: 12 }}><div className="logo-icon">🛍</div>Comercios<span>Conecta</span></div><p>La plataforma todo-en-uno para pymes colombianas.</p></div>
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

"use client";
import { useState } from "react";
import "../landing.css";
import "./contacto.css";

export default function ContactoPage() {
  const [tab, setTab] = useState<"chat" | "email">("chat");
  const [chatMsgs, setChatMsgs] = useState([
    { from: "bot", text: "¡Hola! 👋 Soy el asistente de ComerciosConecta. ¿En qué puedo ayudarte hoy?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [form, setForm] = useState({ nombre: "", email: "", asunto: "", mensaje: "" });
  const [sent, setSent] = useState(false);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMsgs(prev => [...prev, { from: "user", text: userMsg }]);
    setChatInput("");
    setTimeout(() => {
      setChatMsgs(prev => [...prev, {
        from: "bot",
        text: "Gracias por tu mensaje. Un asesor revisará tu consulta y te responderá en breve. También puedes enviarnos un correo desde la pestaña de Correo electrónico.",
      }]);
    }, 900);
  };

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

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
      <section className="contacto-hero">
        <div className="container">
          <span className="badge badge-white">📩 Contacto</span>
          <h1>Estamos aquí<br /><span className="hl">para ayudarte</span></h1>
          <p>Elige cómo quieres comunicarte con nuestro equipo de soporte.</p>
        </div>
      </section>

      {/* INFO CARDS */}
      <section className="contacto-info">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">⏰</div>
              <h4>Horario de atención</h4>
              <p>Lunes a viernes<br /><strong>8:00 a.m. – 6:00 p.m.</strong></p>
            </div>
            <div className="info-card">
              <div className="info-icon">⚡</div>
              <h4>Tiempo de respuesta</h4>
              <p>Chat: <strong>inmediato</strong><br />Correo: <strong>menos de 24 h</strong></p>
            </div>
            <div className="info-card">
              <div className="info-icon">🇨🇴</div>
              <h4>Soporte en español</h4>
              <p>Equipo colombiano,<br /><strong>sin bots de otro país</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* TABS: CHAT / CORREO */}
      <section className="contacto-main" id="chat">
        <div className="container">
          <div className="contacto-box">
            {/* Tabs */}
            <div className="contacto-tabs">
              <button
                className={`contacto-tab${tab === "chat" ? " active" : ""}`}
                onClick={() => setTab("chat")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Chat en vivo
              </button>
              <button
                className={`contacto-tab${tab === "email" ? " active" : ""}`}
                onClick={() => setTab("email")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Enviar correo
              </button>
            </div>

            {/* CHAT */}
            {tab === "chat" && (
              <div className="chat-panel">
                <div className="chat-header">
                  <div className="chat-avatar">CC</div>
                  <div>
                    <div className="chat-name">Soporte ComerciosConecta</div>
                    <div className="chat-status"><span className="online-dot" />En línea</div>
                  </div>
                </div>
                <div className="chat-messages">
                  {chatMsgs.map((m, i) => (
                    <div key={i} className={`chat-bubble ${m.from === "user" ? "user" : "bot"}`}>
                      {m.text}
                    </div>
                  ))}
                </div>
                <div className="chat-input-row">
                  <input
                    type="text"
                    placeholder="Escribe tu mensaje…"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendChat()}
                  />
                  <button onClick={sendChat}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
              </div>
            )}

            {/* EMAIL FORM */}
            {tab === "email" && (
              <div className="email-panel">
                {sent ? (
                  <div className="email-success">
                    <div className="success-icon">✅</div>
                    <h3>¡Mensaje enviado!</h3>
                    <p>Recibimos tu consulta. Te responderemos a <strong>{form.email}</strong> en menos de 24 horas hábiles.</p>
                    <button className="btn btn-dark" onClick={() => { setSent(false); setForm({ nombre: "", email: "", asunto: "", mensaje: "" }); }} style={{ marginTop: 20, fontSize: ".85rem" }}>
                      Enviar otra consulta
                    </button>
                  </div>
                ) : (
                  <form onSubmit={sendEmail} className="email-form">
                    <h3>Envíanos un mensaje</h3>
                    <p style={{ fontSize: ".85rem", color: "#6b7280", marginBottom: 20 }}>
                      Responderemos en menos de 24 horas hábiles.
                    </p>
                    <div className="email-row">
                      <div className="email-field">
                        <label>Nombre completo *</label>
                        <input required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Tu nombre" />
                      </div>
                      <div className="email-field">
                        <label>Correo electrónico *</label>
                        <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="tu@correo.com" />
                      </div>
                    </div>
                    <div className="email-field" style={{ marginTop: 14 }}>
                      <label>Asunto *</label>
                      <select required value={form.asunto} onChange={e => setForm(f => ({ ...f, asunto: e.target.value }))}>
                        <option value="">Selecciona un tema…</option>
                        <option>Problema técnico</option>
                        <option>Facturación electrónica</option>
                        <option>Pagos y Wompi</option>
                        <option>Mi cuenta o suscripción</option>
                        <option>Sugerencia de mejora</option>
                        <option>Otro</option>
                      </select>
                    </div>
                    <div className="email-field" style={{ marginTop: 14 }}>
                      <label>Mensaje *</label>
                      <textarea
                        required
                        rows={5}
                        value={form.mensaje}
                        onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
                        placeholder="Describe tu consulta con el mayor detalle posible…"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: 20, color: "#1F3B4D" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      Enviar mensaje
                    </button>
                  </form>
                )}
              </div>
            )}
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

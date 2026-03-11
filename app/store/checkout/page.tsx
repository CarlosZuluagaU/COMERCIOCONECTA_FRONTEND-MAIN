"use client";
import React, { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiLock, FiCreditCard, FiTruck, FiUser } from "react-icons/fi";
import "../store.css";

interface CarritoItem {
  producto: {
    id: string;
    nombre: string;
    precio: number;
    imagen: string;
  };
  cantidad: number;
}

interface FormData {
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [pasoActual, setPasoActual] = useState(1);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🛒 Ejemplo de carrito (en producción vendría del contexto o store)
  const [carrito] = useState<CarritoItem[]>([
    {
      producto: {
        id: "1",
        nombre: "Crema Hidratante Nivea",
        precio: 1599, // En centavos
        imagen: "/api/placeholder/100/100"
      },
      cantidad: 2
    },
    {
      producto: {
        id: "2",
        nombre: "Shampoo Head & Shoulders",
        precio: 2250,
        imagen: "/api/placeholder/100/100"
      },
      cantidad: 1
    }
  ]);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    codigoPostal: ""
  });

  const subtotal = carrito.reduce((t, item) => t + item.producto.precio * item.cantidad, 0);
  const envio = subtotal > 5000 ? 0 : 599;
  const impuestos = Math.round(subtotal * 0.16);
  const total = subtotal + envio + impuestos;

  const handleInputChange =
    (field: keyof FormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const siguientePaso = () => pasoActual < 2 && setPasoActual(pasoActual + 1);
  const pasoAnterior = () => pasoActual > 1 && setPasoActual(pasoActual - 1);

  // 🧾 Crear orden y generar link de pago
  const procesarPago = async () => {
    if (!aceptaTerminos) {
      alert("Debe aceptar los términos y condiciones");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Crear orden
      const orderRes = await fetch("http://localhost:8080/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${formData.nombre} ${formData.apellido}`,
          customerEmail: formData.email,
          customerPhone: formData.telefono,
          totalInCents: total,
          items: carrito.map((item) => ({
            productoId: item.producto.id,
            nombre: item.producto.nombre,
            cantidad: item.cantidad,
            priceInCents: item.producto.precio
          }))
        })
      });

      if (!orderRes.ok) throw new Error("Error creando la orden");
      const orderData = await orderRes.json();
      const orderId = orderData.id;

      // 2️⃣ Crear link de pago
      const paymentRes = await fetch(
        `http://localhost:8080/api/checkout/create-payment-link/${orderId}`,
        { method: "POST" }
      );

      if (!paymentRes.ok) throw new Error("Error creando el link de pago");
      const paymentData = await paymentRes.json();

      const paymentUrl = paymentData.payment_url || paymentData.url;

      // 3️⃣ Redirigir a Wompi
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error("No se recibió el enlace de pago");
      }
    } catch (err: any) {
      console.error(err);
      alert("Hubo un error procesando el pago. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 1 - Información
  const pasoInformacion = (
    <div className="checkout-step">
      <h3>Información de Contacto</h3>
      <div className="form-grid">
        {[
          { label: "Email *", type: "email", field: "email", placeholder: "tu@email.com" },
          { label: "Nombre *", type: "text", field: "nombre", placeholder: "Tu nombre" },
          { label: "Apellido *", type: "text", field: "apellido", placeholder: "Tu apellido" },
          { label: "Teléfono *", type: "tel", field: "telefono", placeholder: "+57 300 123 4567" },
          { label: "Dirección *", type: "text", field: "direccion", placeholder: "Calle 123 #45-67" },
          { label: "Ciudad *", type: "text", field: "ciudad", placeholder: "Bogotá" },
          { label: "Código Postal *", type: "text", field: "codigoPostal", placeholder: "110111" }
        ].map((input) => (
          <div key={input.field} className="form-group">
            <label>{input.label}</label>
            <input
              type={input.type}
              value={(formData as any)[input.field]}
              onChange={handleInputChange(input.field as keyof FormData)}
              placeholder={input.placeholder}
              required
            />
          </div>
        ))}
      </div>
    </div>
  );

  // Paso 2 - Resumen y botón de pago
  const pasoResumen = (
    <div className="checkout-step">
      <h3>Resumen del Pedido</h3>
      <div className="order-summary">
        {carrito.map((item) => (
          <div key={item.producto.id} className="order-item">
            <img src={item.producto.imagen} alt={item.producto.nombre} className="order-item-image" />
            <div className="order-item-info">
              <h4>{item.producto.nombre}</h4>
              <span>Cantidad: {item.cantidad}</span>
            </div>
            <span className="order-item-price">
              ${(item.producto.precio * item.cantidad / 100).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="order-totals">
          <div className="total-row">
            <span>Subtotal</span>
            <span>${(subtotal / 100).toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Envío</span>
            <span>{envio === 0 ? "Gratis" : `$${(envio / 100).toFixed(2)}`}</span>
          </div>
          <div className="total-row">
            <span>Impuestos</span>
            <span>${(impuestos / 100).toFixed(2)}</span>
          </div>
          <div className="total-row final">
            <span>Total</span>
            <span>${(total / 100).toFixed(2)}</span>
          </div>
        </div>

        <label className="terms-checkbox">
          <input
            type="checkbox"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
          />
          <span>
            Acepto los <a href="/terminos">términos</a> y la{" "}
            <a href="/privacidad">política de privacidad</a>.
          </span>
        </label>

        <button
          className="btn-primary large"
          onClick={procesarPago}
          disabled={!aceptaTerminos || loading}
        >
          <FiLock style={{ marginRight: "8px" }} />
          {loading ? "Procesando..." : "Ir a Pagar"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="store-page">
      <header className="store-header">
        <div className="container">
          <div className="header-content">
            <button className="back-button" onClick={() => router.back()}>
              <FiArrowLeft style={{ marginRight: "8px" }} /> Volver
            </button>
            <div className="logo">
              <h1>ComerciosConecta</h1>
              <span className="store-subtitle">Finalizar Compra</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="checkout-layout">
          <div className="checkout-progress">
            {[1, 2].map((paso) => (
              <div
                key={paso}
                className={`progress-step ${paso === pasoActual ? "active" : ""} ${
                  paso < pasoActual ? "completed" : ""
                }`}
              >
                <div className="step-number">{paso}</div>
                <span className="step-label">{paso === 1 ? "Información" : "Resumen"}</span>
              </div>
            ))}
          </div>

          <div className="checkout-content">
            {pasoActual === 1 ? pasoInformacion : pasoResumen}
            <div className="checkout-navigation">
              {pasoActual > 1 && (
                <button className="btn-secondary" onClick={pasoAnterior}>
                  Anterior
                </button>
              )}
              {pasoActual < 2 && (
                <button className="btn-primary" onClick={siguientePaso}>
                  Continuar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiShoppingBag, FiTruck, FiMail, FiHome, FiDownload } from "react-icons/fi";
import "../store.css";

interface Pedido {
  id: string;
  fecha: string;
  estado: string;
  total: number;
  items: Array<{
    producto: {
      id: string;
      nombre: string;
      precio: number;
      imagen: string;
    };
    cantidad: number;
  }>;
  envio: {
    direccion: string;
    ciudad: string;
    codigoPostal: string;
    metodo: string;
    tiempoEstimado: string;
  };
  pago: {
    metodo: string;
    ultimosDigitos?: string;
    email: string;
  };
}

export default function OrderConfirmationPage() {
  const router = useRouter();

  // Datos de ejemplo del pedido confirmado
  const pedido: Pedido = {
    id: "ORD-00125",
    fecha: new Date().toISOString(),
    estado: "Confirmado",
    total: 156.80,
    items: [
      {
        producto: {
          id: "1",
          nombre: "Crema Hidratante Nivea",
          precio: 15.99,
          imagen: "/api/placeholder/80/80"
        },
        cantidad: 2
      },
      {
        producto: {
          id: "2",
          nombre: "Shampoo Head & Shoulders", 
          precio: 22.50,
          imagen: "/api/placeholder/80/80"
        },
        cantidad: 1
      }
    ],
    envio: {
      direccion: "Calle 123 #45-67",
      ciudad: "Bogotá",
      codigoPostal: "110111",
      metodo: "Estándar",
      tiempoEstimado: "3-5 días hábiles"
    },
    pago: {
      metodo: "Tarjeta de Crédito",
      ultimosDigitos: "3456",
      email: "cliente@email.com"
    }
  };

  const continuarComprando = () => {
    router.push("/store");
  };

  const verHistorial = () => {
    router.push("/store/orders");
  };

  const descargarFactura = () => {
    alert("Descargando factura...");
    // En una app real, aquí se generaría el PDF
  };

  return React.createElement(
    "div",
    { className: "store-page" },

    // Header
    React.createElement(
      "header",
      { className: "store-header" },
      React.createElement(
        "div",
        { className: "container" },
        React.createElement(
          "div",
          { className: "header-content" },
          React.createElement(
            "div",
            { className: "logo" },
            React.createElement("h1", null, "ComerciosConecta"),
            React.createElement("span", { className: "store-subtitle" }, "Confirmación de Pedido")
          ),
          React.createElement("div", { className: "header-actions" })
        )
      )
    ),

    // Contenido principal
    React.createElement(
      "div",
      { className: "container" },
      React.createElement(
        "div",
        { className: "confirmation-layout" },
        
        // Tarjeta de confirmación
        React.createElement(
          "div",
          { className: "confirmation-card" },
          React.createElement(
            "div",
            { className: "confirmation-header" },
            React.createElement(
              "div",
              { className: "success-icon" },
              React.createElement(FiCheck)
            ),
            React.createElement("h1", null, "¡Pedido Confirmado!"),
            React.createElement("p", null, "Gracias por tu compra. Tu pedido ha sido procesado exitosamente."),
            React.createElement(
              "div",
              { className: "order-number" },
              React.createElement("strong", null, "Número de orden:"),
              React.createElement("span", null, pedido.id)
            )
          ),

          // Resumen rápido
          React.createElement(
            "div",
            { className: "quick-summary" },
            React.createElement(
              "div",
              { className: "summary-item" },
              React.createElement(FiShoppingBag),
              React.createElement(
                "div",
                null,
                React.createElement("span", null, "Total"),
                React.createElement("strong", null, `$${pedido.total.toFixed(2)}`)
              )
            ),
            React.createElement(
              "div",
              { className: "summary-item" },
              React.createElement(FiTruck),
              React.createElement(
                "div",
                null,
                React.createElement("span", null, "Envío"),
                React.createElement("strong", null, pedido.envio.tiempoEstimado)
              )
            ),
            React.createElement(
              "div",
              { className: "summary-item" },
              React.createElement(FiMail),
              React.createElement(
                "div",
                null,
                React.createElement("span", null, "Email"),
                React.createElement("strong", null, pedido.pago.email)
              )
            )
          )
        ),

        // Detalles del pedido
        React.createElement(
          "div",
          { className: "order-details" },
          React.createElement(
            "div",
            { className: "details-section" },
            React.createElement("h2", null, "Detalles del Pedido"),
            React.createElement(
              "div",
              { className: "order-items" },
              pedido.items.map(item =>
                React.createElement(
                  "div",
                  { key: item.producto.id, className: "order-item-confirm" },
                  React.createElement("img", {
                    src: item.producto.imagen,
                    alt: item.producto.nombre
                  }),
                  React.createElement(
                    "div",
                    { className: "item-info-confirm" },
                    React.createElement("h4", null, item.producto.nombre),
                    React.createElement("span", null, `Cantidad: ${item.cantidad}`)
                  ),
                  React.createElement(
                    "span",
                    { className: "item-price-confirm" },
                    `$${(item.producto.precio * item.cantidad).toFixed(2)}`
                  )
                )
              )
            )
          ),

          // Información de envío y pago
          React.createElement(
            "div",
            { className: "info-grid" },
            React.createElement(
              "div",
              { className: "info-card" },
              React.createElement(
                "div",
                { className: "info-header" },
                React.createElement(FiHome),
                React.createElement("h3", null, "Dirección de Envío")
              ),
              React.createElement(
                "div",
                { className: "info-content" },
                React.createElement("p", null, pedido.envio.direccion),
                React.createElement("p", null, `${pedido.envio.ciudad}, ${pedido.envio.codigoPostal}`),
                React.createElement("p", null, `Método: ${pedido.envio.metodo}`)
              )
            ),
            React.createElement(
              "div",
              { className: "info-card" },
              React.createElement(
                "div",
                { className: "info-header" },
                React.createElement(FiShoppingBag),
                React.createElement("h3", null, "Información de Pago")
              ),
              React.createElement(
                "div",
                { className: "info-content" },
                React.createElement("p", null, pedido.pago.metodo),
                pedido.pago.ultimosDigitos && React.createElement("p", null, `Terminada en: ${pedido.pago.ultimosDigitos}`),
                React.createElement("p", null, `Email: ${pedido.pago.email}`),
                React.createElement("p", null, `Total: $${pedido.total.toFixed(2)}`)
              )
            )
          )
        ),

        // Siguientes pasos
        React.createElement(
          "div",
          { className: "next-steps" },
          React.createElement("h2", null, "¿Qué sigue?"),
          React.createElement(
            "div",
            { className: "steps-timeline" },
            React.createElement(
              "div",
              { className: "step active" },
              React.createElement("div", { className: "step-number" }, "1"),
              React.createElement(
                "div",
                { className: "step-content" },
                React.createElement("strong", null, "Pedido Confirmado"),
                React.createElement("span", null, "Hemos recibido tu pedido exitosamente")
              )
            ),
            React.createElement(
              "div",
              { className: "step" },
              React.createElement("div", { className: "step-number" }, "2"),
              React.createElement(
                "div",
                { className: "step-content" },
                React.createElement("strong", null, "Preparando Envío"),
                React.createElement("span", null, "Estamos preparando tu pedido para el envío")
              )
            ),
            React.createElement(
              "div",
              { className: "step" },
              React.createElement("div", { className: "step-number" }, "3"),
              React.createElement(
                "div",
                { className: "step-content" },
                React.createElement("strong", null, "En Camino"),
                React.createElement("span", null, "Tu pedido ha sido enviado")
              )
            ),
            React.createElement(
              "div",
              { className: "step" },
              React.createElement("div", { className: "step-number" }, "4"),
              React.createElement(
                "div",
                { className: "step-content" },
                React.createElement("strong", null, "Entregado"),
                React.createElement("span", null, "¡Tu pedido ha llegado!")
              )
            )
          )
        ),

        // Acciones
        React.createElement(
          "div",
          { className: "confirmation-actions" },
          React.createElement(
            "button",
            {
              className: "btn-primary",
              onClick: continuarComprando
            },
            "Seguir Comprando"
          ),
          React.createElement(
            "button",
            {
              className: "btn-secondary",
              onClick: verHistorial
            },
            "Ver Historial de Pedidos"
          ),
          React.createElement(
            "button",
            {
              className: "btn-outline",
              onClick: descargarFactura
            },
            React.createElement(FiDownload, { style: { marginRight: "8px" } }),
            "Descargar Factura"
          )
        ),

        // Información adicional
        React.createElement(
          "div",
          { className: "additional-info" },
          React.createElement("h3", null, "¿Necesitas ayuda?"),
          React.createElement("p", null, 
            "Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos:"
          ),
          React.createElement(
            "div",
            { className: "contact-options" },
            React.createElement(
              "div",
              { className: "contact-option" },
              React.createElement("strong", null, "Email:"),
              React.createElement("span", null, "soporte@comerciosconecta.com")
            ),
            React.createElement(
              "div",
              { className: "contact-option" },
              React.createElement("strong", null, "Teléfono:"),
              React.createElement("span", null, "+57 1 234 5678")
            ),
            React.createElement(
              "div",
              { className: "contact-option" },
              React.createElement("strong", null, "Horario:"),
              React.createElement("span", null, "Lun-Vie: 8:00 AM - 6:00 PM")
            )
          )
        )
      )
    )
  );
}
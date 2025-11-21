"use client";
import React, { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiTag } from "react-icons/fi";
import "../store.css";

interface CarritoItem {
  producto: {
    id: string;
    nombre: string;
    precio: number;
    precioOriginal?: number;
    imagen: string;
    categoria: string;
    marca: string;
    stock: number;
  };
  cantidad: number;
}

export default function CarritoPage() {
  const router = useRouter();
  const [cupon, setCupon] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState(false);
  const [descuento, setDescuento] = useState(0);

  // Datos de ejemplo del carrito
  const [carrito, setCarrito] = useState<CarritoItem[]>([
    {
      producto: {
        id: "1",
        nombre: "Crema Hidratante Nivea",
        precio: 15.99,
        precioOriginal: 19.99,
        imagen: "/api/placeholder/100/100",
        categoria: "Cuidado Personal",
        marca: "Nivea",
        stock: 45
      },
      cantidad: 2
    },
    {
      producto: {
        id: "2",
        nombre: "Shampoo Head & Shoulders",
        precio: 22.50,
        imagen: "/api/placeholder/100/100",
        categoria: "Cuidado Capilar", 
        marca: "Head & Shoulders",
        stock: 28
      },
      cantidad: 1
    },
    {
      producto: {
        id: "4",
        nombre: "Protector Solar 50 FPS",
        precio: 32.00,
        precioOriginal: 38.00,
        imagen: "/api/placeholder/100/100",
        categoria: "Cuidado Personal",
        marca: "Nivea",
        stock: 15
      },
      cantidad: 1
    }
  ]);

  const subtotal = carrito.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0);
  const envio = subtotal > 50 ? 0 : 5.99;
  const impuestos = subtotal * 0.16;
  const descuentoAplicado = subtotal * (descuento / 100);
  const total = subtotal + envio + impuestos - descuentoAplicado;

  const actualizarCantidad = (productoId: string, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    
    setCarrito(prev =>
      prev.map(item =>
        item.producto.id === productoId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      )
    );
  };

  const eliminarProducto = (productoId: string) => {
    setCarrito(prev => prev.filter(item => item.producto.id !== productoId));
  };

  const aplicarCupon = () => {
    if (cupon.toUpperCase() === "DESCUENTO10") {
      setDescuento(10);
      setCuponAplicado(true);
      alert("¡Cupón aplicado! 10% de descuento");
    } else if (cupon.toUpperCase() === "ENVIOGRATIS") {
      setDescuento(0);
      setCuponAplicado(true);
      alert("¡Cupón aplicado! Envío gratis");
    } else {
      alert("Cupón no válido");
    }
  };

  const removerCupon = () => {
    setCupon("");
    setCuponAplicado(false);
    setDescuento(0);
  };

  const handleCuponChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCupon(event.target.value);
  };

  const procederCheckout = () => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }
    router.push("/store/checkout");
  };

  const continuarComprando = () => {
    router.push("/store");
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
            "button",
            {
              className: "back-button",
              onClick: () => router.back()
            },
            React.createElement(FiArrowLeft, { style: { marginRight: "8px" } }),
            "Seguir Comprando"
          ),
          React.createElement(
            "div",
            { className: "logo" },
            React.createElement("h1", null, "ComerciosConecta"),
            React.createElement("span", { className: "store-subtitle" }, "Mi Carrito")
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
        { className: "cart-layout" },
        
        // Lista de productos
        React.createElement(
          "div",
          { className: "cart-items-section" },
          React.createElement(
            "div",
            { className: "section-header" },
            React.createElement("h2", null, `Tu Carrito (${carrito.length} productos)`)
          ),

          carrito.length === 0 ? 
            React.createElement(
              "div",
              { className: "empty-cart" },
              React.createElement(FiShoppingCart, { size: 64 }),
              React.createElement("h3", null, "Tu carrito está vacío"),
              React.createElement("p", null, "Agrega algunos productos increíbles"),
              React.createElement(
                "button",
                {
                  className: "btn-primary large",
                  onClick: continuarComprando
                },
                "Descubrir Productos"
              )
            ) :
            React.createElement(
              "div",
              { className: "cart-items-list" },
              carrito.map(item =>
                React.createElement(
                  "div",
                  { key: item.producto.id, className: "cart-item-full" },
                  React.createElement(
                    "div",
                    { className: "item-image" },
                    React.createElement("img", {
                      src: item.producto.imagen,
                      alt: item.producto.nombre
                    })
                  ),
                  React.createElement(
                    "div",
                    { className: "item-details" },
                    React.createElement(
                      "div",
                      { className: "item-info" },
                      React.createElement("h3", null, item.producto.nombre),
                      React.createElement("span", { className: "item-category" }, item.producto.categoria),
                      React.createElement("span", { className: "item-brand" }, item.producto.marca),
                      item.producto.precioOriginal && React.createElement(
                        "span",
                        { className: "item-original-price" },
                        `$${item.producto.precioOriginal}`
                      ),
                      React.createElement("span", { className: "item-price" }, `$${item.producto.precio}`)
                    ),
                    React.createElement(
                      "div",
                      { className: "item-actions" },
                      React.createElement(
                        "div",
                        { className: "quantity-selector-full" },
                        React.createElement(
                          "button",
                          {
                            className: "quantity-btn",
                            onClick: () => actualizarCantidad(item.producto.id, item.cantidad - 1),
                            disabled: item.cantidad <= 1
                          },
                          React.createElement(FiMinus)
                        ),
                        React.createElement("span", { className: "quantity-display" }, item.cantidad),
                        React.createElement(
                          "button",
                          {
                            className: "quantity-btn",
                            onClick: () => actualizarCantidad(item.producto.id, item.cantidad + 1),
                            disabled: item.cantidad >= item.producto.stock
                          },
                          React.createElement(FiPlus)
                        )
                      ),
                      React.createElement(
                        "button",
                        {
                          className: "remove-btn",
                          onClick: () => eliminarProducto(item.producto.id)
                        },
                        React.createElement(FiTrash2),
                        "Eliminar"
                      )
                    )
                  ),
                  React.createElement(
                    "div",
                    { className: "item-total" },
                    React.createElement("span", null, "Subtotal:"),
                    React.createElement("strong", null, `$${(item.producto.precio * item.cantidad).toFixed(2)}`)
                  )
                )
              )
            )
        ),

        // Resumen y checkout
        carrito.length > 0 && React.createElement(
          "div",
          { className: "cart-summary" },
          React.createElement(
            "div",
            { className: "summary-card" },
            React.createElement("h3", null, "Resumen del Pedido"),
            
            // Cupón de descuento
            React.createElement(
              "div",
              { className: "coupon-section" },
              cuponAplicado ? 
                React.createElement(
                  "div",
                  { className: "coupon-applied" },
                  React.createElement("span", null, "Cupón aplicado"),
                  React.createElement(
                    "button",
                    {
                      onClick: removerCupon,
                      className: "remove-coupon"
                    },
                    "Remover"
                  )
                ) :
                React.createElement(
                  "div",
                  { className: "coupon-input" },
                  React.createElement(FiTag, { className: "coupon-icon" }),
                  React.createElement("input", {
                    type: "text",
                    placeholder: "Código de cupón",
                    value: cupon,
                    onChange: handleCuponChange
                  }),
                  React.createElement(
                    "button",
                    {
                      onClick: aplicarCupon,
                      className: "apply-coupon-btn"
                    },
                    "Aplicar"
                  )
                )
            ),

            // Totales
            React.createElement(
              "div",
              { className: "summary-totals" },
              React.createElement(
                "div",
                { className: "total-row" },
                React.createElement("span", null, "Subtotal"),
                React.createElement("span", null, `$${subtotal.toFixed(2)}`)
              ),
              
              descuento > 0 && React.createElement(
                "div",
                { className: "total-row discount" },
                React.createElement("span", null, `Descuento (${descuento}%)`),
                React.createElement("span", null, `-$${descuentoAplicado.toFixed(2)}`)
              ),
              
              React.createElement(
                "div",
                { className: "total-row" },
                React.createElement("span", null, "Envío"),
                React.createElement("span", null, envio === 0 ? "Gratis" : `$${envio.toFixed(2)}`)
              ),
              
              React.createElement(
                "div",
                { className: "total-row" },
                React.createElement("span", null, "Impuestos (16%)"),
                React.createElement("span", null, `$${impuestos.toFixed(2)}`)
              ),
              
              React.createElement(
                "div",
                { className: "total-row final" },
                React.createElement("span", null, "Total"),
                React.createElement("span", null, `$${total.toFixed(2)}`)
              )
            ),

            // Beneficios
            subtotal < 50 && React.createElement(
              "div",
              { className: "shipping-notice" },
              React.createElement("p", null, 
                `¡Faltan $${(50 - subtotal).toFixed(2)} para envío GRATIS!`
              )
            ),

            // Botones de acción
            React.createElement(
              "div",
              { className: "checkout-actions" },
              React.createElement(
                "button",
                {
                  className: "btn-primary large full-width",
                  onClick: procederCheckout
                },
                React.createElement(FiShoppingCart, { style: { marginRight: "8px" } }),
                "Proceder al Checkout"
              ),
              React.createElement(
                "button",
                {
                  className: "continue-shopping-btn",
                  onClick: continuarComprando
                },
                "Continuar Comprando"
              )
            ),

            // Garantías
            React.createElement(
              "div",
              { className: "guarantees" },
              React.createElement(
                "div",
                { className: "guarantee-item" },
                React.createElement("span", { className: "guarantee-icon" }, "🚚"),
                React.createElement("span", null, "Envío rápido y seguro")
              ),
              React.createElement(
                "div",
                { className: "guarantee-item" },
                React.createElement("span", { className: "guarantee-icon" }, "🛡️"),
                React.createElement("span", null, "Compra 100% protegida")
              ),
              React.createElement(
                "div",
                { className: "guarantee-item" },
                React.createElement("span", { className: "guarantee-icon" }, "↩️"),
                React.createElement("span", null, "Devoluciones fáciles")
              )
            )
          )
        )
      )
    )
  );
}
"use client";
import React, { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  FiShoppingCart,
  FiHeart,
  FiStar,
  FiArrowLeft,
  FiShare2,
  FiTruck,
  FiShield,
} from "react-icons/fi";
import "../../store.css";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  precioOriginal?: number;
  imagen: string;
  categoria: string;
  marca: string;
  rating: number;
  reviews: number;
  descuento?: number;
  descripcion: string;
  caracteristicas: string[];
  stock: number;
  imagenes: string[];
}

interface Params {
  id: string;
}

export default function ProductoPage({ params }: { params: Params }) {
  const router = useRouter();
  const [cantidad, setCantidad] = useState(1);
  const [imagenPrincipal, setImagenPrincipal] = useState(0);
  const [agregadoFavoritos, setAgregadoFavoritos] = useState(false);

  // Simulamos datos del producto (en una app real vendría de una API)
  const producto: Producto = {
    id: params.id,
    nombre: "Crema Hidratante Nivea",
    precio: 15.99,
    precioOriginal: 19.99,
    imagen: "/api/placeholder/600/600",
    categoria: "Cuidado Personal",
    marca: "Nivea",
    rating: 4.5,
    reviews: 128,
    descuento: 20,
    descripcion:
      "Crema hidratante de uso diario con protección UV. Formulada con aceite de almendras y vitamina E para una hidratación profunda y duradera. Ideal para todo tipo de piel.",
    caracteristicas: [
      "Hidratación 24 horas",
      "Protección UV 15",
      "No comedogénica",
      "Apto para piel sensible",
      "Testado dermatológicamente",
    ],
    stock: 45,
    imagenes: [
      "/api/placeholder/600/600",
      "/api/placeholder/600/600",
      "/api/placeholder/600/600",
      "/api/placeholder/600/600",
    ],
  };

  const productosRelacionados: Producto[] = [
    {
      id: "2",
      nombre: "Shampoo Anticaspa Head & Shoulders",
      precio: 22.5,
      imagen: "/api/placeholder/300/300",
      categoria: "Cuidado Capilar",
      marca: "Head & Shoulders",
      rating: 4.3,
      reviews: 89,
      descripcion: "",
      caracteristicas: [],
      stock: 28,
      imagenes: [],
    },
    {
      id: "4",
      nombre: "Protector Solar 50 FPS",
      precio: 32.0,
      precioOriginal: 38.0,
      imagen: "/api/placeholder/300/300",
      categoria: "Cuidado Personal",
      marca: "Nivea",
      rating: 4.6,
      reviews: 167,
      descuento: 16,
      descripcion: "",
      caracteristicas: [],
      stock: 15,
      imagenes: [],
    },
  ];

  const agregarAlCarrito = () => {
    alert(`Agregado ${cantidad} unidad(es) de ${producto.nombre} al carrito`);
  };

  const toggleFavoritos = () => {
    setAgregadoFavoritos(!agregadoFavoritos);
    alert(agregadoFavoritos ? "Removido de favoritos" : "Agregado a favoritos");
  };

  const comprarAhora = () => {
    agregarAlCarrito();
    router.push("/store/checkout");
  };

  const handleCantidadChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setCantidad(Number(event.target.value));
  };

  const renderEstrellas = (rating: number) =>
    Array.from({ length: 5 }, (_, i) =>
      React.createElement(FiStar, {
        key: i,
        className: i < Math.floor(rating) ? "star filled" : "star",
        fill: i < rating ? "currentColor" : "none",
      })
    );

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
            { className: "back-button", onClick: () => router.back() },
            React.createElement(FiArrowLeft, { style: { marginRight: "8px" } }),
            "Volver"
          ),
          React.createElement(
            "div",
            { className: "logo" },
            React.createElement("h1", null, "ComerciosConecta"),
            React.createElement(
              "span",
              { className: "store-subtitle" },
              "Tienda Online"
            )
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
        { className: "product-detail" },

        // Galería
        React.createElement(
          "div",
          { className: "product-gallery" },
          React.createElement(
            "div",
            { className: "gallery-main" },
            React.createElement("img", {
              src: producto.imagenes[imagenPrincipal],
              alt: producto.nombre,
              className: "main-image",
            })
          ),
          React.createElement(
            "div",
            { className: "gallery-thumbnails" },
            producto.imagenes.map((imagen, index) =>
              React.createElement(
                "button",
                {
                  key: index,
                  className: `thumbnail ${
                    imagenPrincipal === index ? "active" : ""
                  }`,
                  onClick: () => setImagenPrincipal(index),
                },
                React.createElement("img", {
                  src: imagen,
                  alt: `${producto.nombre} ${index + 1}`,
                })
              )
            )
          )
        ),

        // Info producto
        React.createElement(
          "div",
          { className: "product-info" },
          React.createElement(
            "div",
            { className: "product-header" },
            React.createElement(
              "span",
              { className: "product-category" },
              producto.categoria
            ),
            React.createElement("h1", { className: "product-title" }, producto.nombre),
            React.createElement("span", { className: "product-brand" }, producto.marca)
          ),

          // Rating
          React.createElement(
            "div",
            { className: "product-rating-section" },
            React.createElement(
              "div",
              { className: "rating-display" },
              renderEstrellas(producto.rating),
              React.createElement("span", { className: "rating-value" }, producto.rating),
              React.createElement(
                "span",
                { className: "reviews-count" },
                `(${producto.reviews} reviews)`
              )
            )
          ),

          // Precio
          React.createElement(
            "div",
            { className: "product-price-section" },
            producto.precioOriginal &&
              React.createElement(
                "span",
                { className: "original-price large" },
                `$${producto.precioOriginal}`
              ),
            React.createElement(
              "span",
              { className: "current-price large" },
              `$${producto.precio}`
            ),
            producto.descuento &&
              React.createElement(
                "span",
                { className: "discount-badge large" },
                `-${producto.descuento}%`
              )
          ),

          // Descripción
          React.createElement(
            "div",
            { className: "product-description" },
            React.createElement("h3", null, "Descripción"),
            React.createElement("p", null, producto.descripcion)
          ),

          // Características
          React.createElement(
            "div",
            { className: "product-features" },
            React.createElement("h3", null, "Características"),
            React.createElement(
              "ul",
              null,
              producto.caracteristicas.map((c, i) =>
                React.createElement("li", { key: i }, c)
              )
            )
          ),

          // Beneficios
          React.createElement(
            "div",
            { className: "product-benefits" },
            React.createElement(
              "div",
              { className: "benefit-item" },
              React.createElement(FiTruck),
              React.createElement("span", null, "Envío gratis en compras mayores a $50")
            ),
            React.createElement(
              "div",
              { className: "benefit-item" },
              React.createElement(FiShield),
              React.createElement("span", null, "Garantía de satisfacción de 30 días")
            )
          ),

          // Acciones
          React.createElement(
            "div",
            { className: "product-actions" },
            React.createElement(
              "div",
              { className: "quantity-selector" },
              React.createElement("label", null, "Cantidad:"),
              React.createElement(
                "select",
                {
                  value: cantidad,
                  onChange: handleCantidadChange,
                  className: "quantity-select",
                },
                Array.from({ length: Math.min(producto.stock, 10) }, (_, i) =>
                  React.createElement("option", { key: i + 1, value: i + 1 }, i + 1)
                )
              ),
              React.createElement(
                "span",
                { className: "stock-info" },
                `${producto.stock} disponibles`
              )
            ),
            React.createElement(
              "div",
              { className: "action-buttons" },
              React.createElement(
                "button",
                { className: "add-to-cart-btn large", onClick: agregarAlCarrito },
                React.createElement(FiShoppingCart, { style: { marginRight: "8px" } }),
                "Agregar al Carrito"
              ),
              React.createElement(
                "button",
                { className: "buy-now-btn", onClick: comprarAhora },
                "Comprar Ahora"
              )
            ),
            React.createElement(
              "div",
              { className: "secondary-actions" },
              React.createElement(
                "button",
                {
                  className: `favorite-btn ${agregadoFavoritos ? "active" : ""}`,
                  onClick: toggleFavoritos,
                },
                React.createElement(FiHeart, { style: { marginRight: "8px" } }),
                agregadoFavoritos ? "En Favoritos" : "Agregar a Favoritos"
              ),
              React.createElement(
                "button",
                { className: "share-btn" },
                React.createElement(FiShare2, { style: { marginRight: "8px" } }),
                "Compartir"
              )
            )
          )
        )
      )
    ),

    // Relacionados
    React.createElement(
      "section",
      { className: "related-products" },
      React.createElement(
        "div",
        { className: "container" },
        React.createElement(
          "div",
          { className: "section-header" },
          React.createElement("h2", null, "Productos Relacionados")
        ),
        React.createElement(
          "div",
          { className: "products-grid" },
          productosRelacionados.map((producto) =>
            React.createElement(
              "div",
              {
                key: producto.id,
                className: "product-card",
                onClick: () => router.push(`/store/product/${producto.id}`),
              },
              producto.descuento &&
                React.createElement(
                  "span",
                  { className: "discount-badge" },
                  `-${producto.descuento}%`
                ),
              React.createElement(
                "div",
                { className: "product-image" },
                React.createElement("img", {
                  src: producto.imagen,
                  alt: producto.nombre,
                })
              ),
              React.createElement(
                "div",
                { className: "product-info" },
                React.createElement(
                  "span",
                  { className: "product-category" },
                  producto.categoria
                ),
                React.createElement(
                  "h3",
                  { className: "product-name" },
                  producto.nombre
                ),
                React.createElement(
                  "span",
                  { className: "product-brand" },
                  producto.marca
                ),
                React.createElement(
                  "div",
                  { className: "product-rating" },
                  renderEstrellas(producto.rating),
                  React.createElement("span", null, `(${producto.reviews})`)
                ),
                React.createElement(
                  "div",
                  { className: "product-price" },
                  producto.precioOriginal &&
                    React.createElement(
                      "span",
                      { className: "original-price" },
                      `$${producto.precioOriginal}`
                    ),
                  React.createElement(
                    "span",
                    { className: "current-price" },
                    `$${producto.precio}`
                  )
                )
              )
            )
          )
        )
      )
    )
  );
}

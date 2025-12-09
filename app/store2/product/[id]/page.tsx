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
  FiCheck,
  FiHome,
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

  // Producto principal
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

  // Productos relacionados
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

  // Funciones existentes
  const agregarAlCarrito = () => {
    alert(`Agregado ${cantidad} unidad(es) de ${producto.nombre} al carrito`);
  };

  const toggleFavoritos = () => {
    setAgregadoFavoritos(!agregadoFavoritos);
    alert(agregadoFavoritos ? "Removido de favoritos" : "Agregado a favoritos");
  };

  const comprarAhora = () => {
    agregarAlCarrito();
    router.push("/store2/checkout");
  };

  const handleCantidadChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setCantidad(Number(event.target.value));
  };

  // Función de estrellas usando clases existentes
  const renderEstrellas = (rating: number) => {
    return (
      <div className="product-rating-tienda">
        <div className="stars-tienda">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`star ${i < Math.floor(rating) ? "filled" : ""}`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="reviews-tienda">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header usando las clases de tienda existentes */}
      <nav className="nav-tienda">
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}>
          <div className="nav-content-tienda">
            <button 
              className="nav-item-tienda"
              onClick={() => router.back()}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <FiArrowLeft />
              Volver
            </button>
            
            <button 
              className="nav-item-tienda"
              onClick={() => router.push("/store2")}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <FiHome />
              Tienda
            </button>
            
            <div style={{ marginLeft: "auto", display: "flex", gap: "1rem" }}>
              <button className="cart-btn-tienda">
                <FiShoppingCart />
                <span className="cart-count-tienda">3</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal - USANDO SOLO CLASES EXISTENTES */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}>
        
        {/* Breadcrumb simple */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem", 
          marginBottom: "2rem",
          color: "#6b7280",
          fontSize: "0.875rem"
        }}>
          <span 
            style={{ cursor: "pointer", color: "#8b5cf6" }}
            onClick={() => router.push("/store2")}
          >
            Tienda
          </span>
          <span>›</span>
          <span 
            style={{ cursor: "pointer", color: "#8b5cf6" }}
            onClick={() => router.push(`/store2/categoria/${producto.categoria.toLowerCase()}`)}
          >
            {producto.categoria}
          </span>
          <span>›</span>
          <span style={{ color: "#374151", fontWeight: "600" }}>
            {producto.nombre}
          </span>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "3rem",
          background: "white",
          borderRadius: "16px",
          padding: "2rem",
          border: "1px solid #e2e8f0"
        }}>
          
          {/* Galería de imágenes CORREGIDA */}
          <div>
            <div className="product-image-section" style={{ 
              height: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative"
            }}>
              <div className="image-container-tienda" style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <img
                  src={producto.imagenes[imagenPrincipal]}
                  alt={producto.nombre}
                  style={{ 
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain"
                  }}
                />
              </div>
              
              {/* Badge de descuento si existe */}
              {producto.descuento && (
                <div className="product-badges-tienda">
                  <span className="badge discount-badge-tienda">
                    -{producto.descuento}% OFF
                  </span>
                </div>
              )}
              
              {/* Acciones usando clases existentes */}
              <div className="product-actions-tienda">
                <button className="action-btn-tienda" onClick={toggleFavoritos}>
                  <FiHeart style={{ color: agregadoFavoritos ? "#ef4444" : "inherit" }} />
                </button>
                <button className="action-btn-tienda">
                  <FiShare2 />
                </button>
              </div>
            </div>

            {/* Miniaturas */}
            <div style={{ 
              display: "flex", 
              gap: "0.75rem", 
              marginTop: "1rem",
              overflowX: "auto",
              padding: "0.5rem 0",
              justifyContent: "center"
            }}>
              {producto.imagenes.map((imagen, index) => (
                <button
                  key={index}
                  onClick={() => setImagenPrincipal(index)}
                  style={{
                    flex: "0 0 auto",
                    width: "80px",
                    height: "80px",
                    border: `2px solid ${imagenPrincipal === index ? "#8b5cf6" : "#e2e8f0"}`,
                    borderRadius: "8px",
                    overflow: "hidden",
                    padding: "0.25rem",
                    background: "white",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <img 
                    src={imagen} 
                    alt={`${producto.nombre} ${index + 1}`}
                    style={{ 
                      width: "auto", 
                      height: "auto",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain"
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Información del producto usando clases existentes */}
          <div>
            <div className="product-info-tienda">
              <div className="product-category-tienda">{producto.categoria}</div>
              <h1 className="product-name-tienda" style={{ fontSize: "2rem", lineHeight: "1.2" }}>
                {producto.nombre}
              </h1>
              <div className="product-brand-tienda" style={{ fontSize: "1rem" }}>
                Marca: {producto.marca}
              </div>

              {/* Rating */}
              <div style={{ margin: "1.5rem 0" }}>
                {renderEstrellas(producto.rating)}
              </div>

              {/* Precio usando clases existentes */}
              <div className="product-pricing-tienda">
                <div className="price-container-tienda" style={{ marginBottom: "1.5rem" }}>
                  {producto.precioOriginal && (
                    <span className="original-price-tienda" style={{ fontSize: "1.25rem" }}>
                      ${producto.precioOriginal.toFixed(2)}
                    </span>
                  )}
                  <span className="current-price-tienda" style={{ fontSize: "2rem" }}>
                    ${producto.precio.toFixed(2)}
                  </span>
                </div>

                {/* Stock info */}
                <div style={{ 
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  background: producto.stock > 10 ? "#d1fae5" : 
                            producto.stock > 0 ? "#fef3c7" : "#fee2e2",
                  color: producto.stock > 10 ? "#059669" : 
                        producto.stock > 0 ? "#d97706" : "#dc2626",
                  marginBottom: "1.5rem",
                  fontWeight: "600"
                }}>
                  <FiCheck />
                  {producto.stock > 10 ? "Disponible" : 
                   producto.stock > 0 ? `¡Solo ${producto.stock} disponibles!` : "Agotado"}
                </div>

                {/* Descripción */}
                <div style={{ marginBottom: "2rem" }}>
                  <h3 style={{ 
                    fontSize: "1.125rem", 
                    fontWeight: "700", 
                    color: "#1f2937",
                    marginBottom: "1rem"
                  }}>
                    Descripción
                  </h3>
                  <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
                    {producto.descripcion}
                  </p>
                </div>

                {/* Características */}
                <div style={{ marginBottom: "2rem" }}>
                  <h3 style={{ 
                    fontSize: "1.125rem", 
                    fontWeight: "700", 
                    color: "#1f2937",
                    marginBottom: "1rem"
                  }}>
                    Características
                  </h3>
                  <ul style={{ listStyle: "none", padding: "0", margin: "0" }}>
                    {producto.caracteristicas.map((caracteristica, index) => (
                      <li key={index} style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                        color: "#4b5563"
                      }}>
                        <FiCheck style={{ color: "#059669", flexShrink: "0" }} />
                        <span>{caracteristica}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cantidad selector */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ 
                    display: "block", 
                    fontSize: "0.875rem", 
                    fontWeight: "600", 
                    color: "#4b5563",
                    marginBottom: "0.5rem"
                  }}>
                    Cantidad:
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button
                      onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                      disabled={cantidad <= 1}
                      style={{
                        background: "#f8fafc",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: cantidad <= 1 ? "not-allowed" : "pointer",
                        fontSize: "1.25rem",
                        color: "#374151",
                        opacity: cantidad <= 1 ? 0.5 : 1
                      }}
                    >
                      -
                    </button>
                    <span style={{ 
                      fontSize: "1.125rem", 
                      fontWeight: "700", 
                      minWidth: "60px", 
                      textAlign: "center" 
                    }}>
                      {cantidad}
                    </span>
                    <button
                      onClick={() => setCantidad(prev => Math.min(producto.stock, prev + 1))}
                      disabled={cantidad >= producto.stock}
                      style={{
                        background: "#f8fafc",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: cantidad >= producto.stock ? "not-allowed" : "pointer",
                        fontSize: "1.25rem",
                        color: "#374151",
                        opacity: cantidad >= producto.stock ? 0.5 : 1
                      }}
                    >
                      +
                    </button>
                    <span style={{ marginLeft: "auto", fontSize: "0.875rem", color: "#6b7280" }}>
                      Total: <strong style={{ color: "#059669", fontSize: "1.125rem" }}>
                        ${(producto.precio * cantidad).toFixed(2)}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Botones de acción */}
                <button
                  onClick={agregarAlCarrito}
                  disabled={producto.stock === 0}
                  style={{
                    width: "100%",
                    background: producto.stock === 0 ? "#9ca3af" : "#8b5cf6",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "1rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    cursor: producto.stock === 0 ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem"
                  }}
                  onMouseEnter={(e) => {
                    if (producto.stock > 0) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(139, 92, 246, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (producto.stock > 0) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <FiShoppingCart />
                  {producto.stock === 0 ? "Agotado" : "Agregar al carrito"}
                </button>

                <button
                  onClick={comprarAhora}
                  disabled={producto.stock === 0}
                  style={{
                    width: "100%",
                    background: producto.stock === 0 ? "#9ca3af" : "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "1rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    cursor: producto.stock === 0 ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    opacity: producto.stock === 0 ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (producto.stock > 0) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(5, 150, 105, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (producto.stock > 0) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  Comprar ahora
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Productos relacionados usando el grid existente */}
        <div style={{ marginTop: "4rem" }}>
          <div className="products-header-tienda">
            <h2>Productos relacionados</h2>
            <p>Descubre productos similares que podrían interesarte</p>
          </div>

          <div className="products-grid-tienda">
            {productosRelacionados.map((prod) => (
              <div 
                key={prod.id} 
                className="product-card-tienda"
                onClick={() => router.push(`/store2/product/${prod.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="product-image-section" style={{ height: "200px" }}>
                  <div className="image-container-tienda" style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%"
                  }}>
                    <img
                      src={prod.imagen}
                      alt={prod.nombre}
                      style={{ 
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain"
                      }}
                    />
                  </div>
                  
                  {prod.descuento && (
                    <div className="product-badges-tienda">
                      <span className="badge discount-badge-tienda">
                        -{prod.descuento}% OFF
                      </span>
                    </div>
                  )}
                </div>

                <div className="product-info-tienda">
                  <div className="product-category-tienda">{prod.categoria}</div>
                  <h3 className="product-name-tienda">{prod.nombre}</h3>
                  <div className="product-brand-tienda">{prod.marca}</div>
                  
                  {renderEstrellas(prod.rating)}
                  
                  <div className="product-pricing-tienda">
                    <div className="price-container-tienda">
                      {prod.precioOriginal && (
                        <span className="original-price-tienda">
                          ${prod.precioOriginal.toFixed(2)}
                        </span>
                      )}
                      <span className="current-price-tienda">
                        ${prod.precio.toFixed(2)}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => router.push(`/store2/product/${prod.id}`)}
                      style={{
                        width: "100%",
                        background: "#8b5cf6",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        padding: "0.75rem 1.5rem",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        marginTop: "0.5rem"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(139, 92, 246, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <FiShoppingCart />
                      Ver producto
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
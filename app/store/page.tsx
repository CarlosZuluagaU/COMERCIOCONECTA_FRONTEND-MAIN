"use client";
import React, { useState, ChangeEvent } from "react";
import { FiShoppingCart, FiSearch, FiStar, FiX, FiPlus, FiMinus, FiCheck } from "react-icons/fi";
import "./store.css";

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
  destacado: boolean;
}

interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

export default function TiendaPage() {
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [cliente, setCliente] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  const productos: Producto[] = [
    
    {
      id: "2",
      nombre: "Shampoo Anticaspa Head & Shoulders",
      precio: 33000,
      imagen: "/images/hys.avif",
      categoria: "Cuidado Capilar",
      marca: "Head & Shoulders",
      rating: 4.3,
      reviews: 89,
      destacado: true,
    },
    {
      id: "3",
      nombre: "Labial Matte MAC",
      precio: 45000,
      imagen: "/images/labial.jpg",
      categoria: "Maquillaje",
      marca: "MAC",
      rating: 4.8,
      reviews: 256,
      destacado: false,
    },
    {
      id: "4",
      nombre: "Protector Solar 50 FPS",
      precio: 32000,
      precioOriginal: 38000,
      imagen: "/images/Protector.jpg",
      categoria: "Cuidado Personal",
      marca: "Nivea",
      rating: 4.6,
      reviews: 167,
      descuento: 16,
      destacado: true,
    }
    
  ];

  const categorias = [
    "Todos",
    "Cuidado Personal",
    "Cuidado Capilar",
    "Maquillaje",
    "Cuidado Piel",
    "Medicamentos",
  ];

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.marca.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria =
      categoriaActiva === "Todos" || producto.categoria === categoriaActiva;
    return coincideBusqueda && coincideCategoria;
  });

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.producto.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const actualizarCantidad = (productoId: string, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) {
      setCarrito((prev) => prev.filter((item) => item.producto.id !== productoId));
      return;
    }
    
    setCarrito((prev) =>
      prev.map((item) =>
        item.producto.id === productoId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      )
    );
  };

  const removerDelCarrito = (productoId: string) => {
    setCarrito((prev) => prev.filter((item) => item.producto.id !== productoId));
  };

  const totalCarrito = carrito.reduce(
    (total, item) => total + item.producto.precio * item.cantidad,
    0
  );

  const handleBusquedaChange = (event: ChangeEvent<HTMLInputElement>) => {
    setBusqueda(event.target.value);
  };

  const renderEstrellas = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={i < Math.floor(rating) ? "star filled" : "star"}
      />
    ));
  };

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio);
  };

  const handleCheckout = async () => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    if (!cliente.nombre || !cliente.email || !cliente.telefono) {
      alert("Por favor completa los datos del cliente");
      return;
    }

    let total = totalCarrito * 100;
    if (total < 15000000) {
      const diferencia = 15000000 - total;
      alert(
        `El monto mínimo permitido por Wompi es de $150.000 COP. Se ajustará automáticamente con un cargo adicional de ${formatPrecio(diferencia / 100)}.`
      );
      total = 15000000;
    }

    const ivaPercentage = 19;
    const ivaFinal = Math.min(ivaPercentage, 50);

    setProcesandoPago(true);

    try {
      const orderReq = {
        customerName: cliente.nombre,
        customerEmail: cliente.email,
        customerPhone: cliente.telefono,
        totalInCents: Math.round(total),
        items: carrito.map((item) => ({
          productoId: Number(item.producto.id),
          nombre: item.producto.nombre,
          cantidad: item.cantidad,
          priceInCents: Math.round(item.producto.precio * 100),
          ivaPercentage: ivaFinal,
          subtotalInCents: Math.round(
            item.producto.precio * item.cantidad * 100
          ),
        })),
      };

      const createOrderRes = await fetch(
        "http://localhost:8080/api/checkout/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderReq),
        }
      );

      if (!createOrderRes.ok) throw new Error("Error creando la orden");
      const orderData = await createOrderRes.json();
      const orderId = orderData.orderId;

      const linkRes = await fetch(
        `http://localhost:8080/api/checkout/create-payment-link/${orderId}`,
        { method: "POST" }
      );

      if (!linkRes.ok) throw new Error("Error creando link de pago");
      const linkData = await linkRes.json();

      window.location.href = linkData.payment_url;
    } catch (error) {
      console.error(error);
      alert("Error procesando el pago");
    } finally {
      setProcesandoPago(false);
    }
  };

  return (
    <div className="store-page">
      {/* Header Mejorado */}
      <header className="store-header">
        <div className="header-content">
          <div className="logo-section">
            <a href="#" className="logo">
              <h1>Comercios Conecta</h1>
            </a>
            <span className="store-subtitle">Tu tienda de confianza</span>
          </div>

          <div className="search-container">
            <div className="search-bar">
              <FiSearch />
              <input
                type="text"
                placeholder="Buscar productos, marcas..."
                value={busqueda}
                onChange={handleBusquedaChange}
              />
            </div>
          </div>

          <div className="header-actions">
            <button className="icon-button">
              <FiSearch />
            </button>
            <button 
              className="cart-button"
              onClick={() => setMostrarCarrito(true)}
            >
              <FiShoppingCart />
              {carrito.length > 0 && (
                <span className="cart-count">{carrito.length}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Navegación Mejorada */}
      <nav className="store-nav">
        <div className="nav-container">
          <div className="nav-menu">
            {categorias.map((cat) => (
              <button
                key={cat}
                className={`nav-link ${categoriaActiva === cat ? 'active' : ''}`}
                onClick={() => setCategoriaActiva(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-banner">
          <div className="hero-content">
            <h1>Descubre tu belleza interior</h1>
            <p>Productos de calidad premium para el cuidado personal. Envíos rápidos y precios increíbles.</p>
            <button className="btn-primary large">
              Explorar Productos
            </button>
          </div>
        </div>
      </section>

      {/* Productos Section */}
      <section className="products-section">
        <div className="section-header">
          <h2>Productos Destacados</h2>
          <p>Descubre nuestra selección de productos más populares</p>
        </div>

        <div className="products-grid">
          {productosFiltrados.map((producto) => (
            <div key={producto.id} className="product-card">
              <div className="product-badges">
                {producto.descuento && (
                  <div className="discount-badge">
                    -{producto.descuento}%
                  </div>
                )}
                {producto.destacado && (
                  <div className="featured-badge">
                    Destacado
                  </div>
                )}
              </div>

              <div className="product-image">
                <img src={producto.imagen} alt={producto.nombre} />
              </div>

              <div className="product-info">
                <div className="product-category">{producto.categoria}</div>
                <h3 className="product-name">{producto.nombre}</h3>
                <div className="product-brand">{producto.marca}</div>
                
                <div className="product-rating">
                  <div className="stars">
                    {renderEstrellas(producto.rating)}
                  </div>
                  <span className="rating-count">({producto.reviews})</span>
                </div>

                <div className="product-price">
                  {producto.precioOriginal && (
                    <span className="original-price">
                      {formatPrecio(producto.precioOriginal)}
                    </span>
                  )}
                  <span className="current-price">
                    {formatPrecio(producto.precio)}
                  </span>
                </div>

                <div className="product-actions">
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    <FiShoppingCart />
                    Agregar al Carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Carrito Lateral Mejorado */}
      {mostrarCarrito && (
        <div className="cart-overlay">
          <div className="cart-sidebar">
            <div className="cart-header">
              <h3>Tu Carrito de Compras</h3>
              <button 
                className="close-cart"
                onClick={() => setMostrarCarrito(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="cart-items">
              {carrito.length === 0 ? (
                <div className="empty-cart">
                  <FiShoppingCart size={48} />
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                carrito.map((item) => (
                  <div key={item.producto.id} className="cart-item">
                    <img
                      src={item.producto.imagen}
                      alt={item.producto.nombre}
                      className="cart-item-image"
                    />
                    <div className="cart-item-info">
                      <h4>{item.producto.nombre}</h4>
                      <div className="cart-item-price">
                        {formatPrecio(item.producto.precio)}
                      </div>
                      <div className="quantity-controls">
                        <button
                          onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                        >
                          <FiMinus />
                        </button>
                        <span>{item.cantidad}</span>
                        <button
                          onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removerDelCarrito(item.producto.id)}
                    >
                      <FiX />
                    </button>
                  </div>
                ))
              )}
            </div>

            {carrito.length > 0 && (
              <>
                <div className="checkout-form">
                  <h4>Información del Cliente</h4>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={cliente.nombre}
                      onChange={(e) =>
                        setCliente({ ...cliente, nombre: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      value={cliente.email}
                      onChange={(e) =>
                        setCliente({ ...cliente, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="tel"
                      placeholder="Teléfono"
                      value={cliente.telefono}
                      onChange={(e) =>
                        setCliente({ ...cliente, telefono: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total:</span>
                    <span>{formatPrecio(totalCarrito)}</span>
                  </div>
                  <button
                    className="checkout-btn"
                    onClick={handleCheckout}
                    disabled={procesandoPago}
                  >
                    {procesandoPago ? (
                      <>Procesando...</>
                    ) : (
                      <>
                        <FiCheck />
                        Proceder al Pago
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
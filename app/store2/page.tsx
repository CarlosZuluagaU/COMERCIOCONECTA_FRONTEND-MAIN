"use client";
import React, { useState, ChangeEvent } from "react";
import { FiShoppingCart, FiSearch, FiStar, FiX, FiPlus, FiMinus, FiCheck, FiHeart, FiShare2, FiEye } from "react-icons/fi";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
      nombre: "Labial Matte MAC - Color Rojo Intenso",
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
      nombre: "Protector Solar FPS 50 - Protección Avanzada",
      precio: 32000,
      precioOriginal: 38000,
      imagen: "/images/Protector.jpg",
      categoria: "Cuidado Personal",
      marca: "Nivea",
      rating: 4.6,
      reviews: 167,
      descuento: 16,
      destacado: true,
    },
    {
      id: "5", 
      nombre: "Serum Facial Revitalizante - 30ml",
      precio: 55000,
      imagen: "/images/serum.jpg",
      categoria: "Cuidado Piel",
      marca: "La Roche-Posay",
      rating: 4.7,
      reviews: 189,
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
        `${API_BASE_URL}/checkout/create-order`,
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
        `${API_BASE_URL}/checkout/create-payment-link/${orderId}`,
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
    <div className="tienda-premium">
      {/* Header Minimalista */}
      <header className="tienda-header">
        <div className="container">
          <div className="header-content-tienda">
            <div className="brand-tienda">
              <h1>ComerciosConecta</h1>
              <span>Belleza & Cuidado</span>
            </div>
            
            <div className="search-bar-tienda">
              <FiSearch />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={handleBusquedaChange}
              />
            </div>

            <div className="header-actions-tienda">
              <button 
                className="cart-btn-tienda"
                onClick={() => setMostrarCarrito(true)}
              >
                <FiShoppingCart />
                <span className="cart-count-tienda">{carrito.length}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación Simple */}
      <nav className="nav-tienda">
        <div className="container">
          <div className="nav-content-tienda">
            {categorias.map((cat) => (
              <button
                key={cat}
                className={`nav-item-tienda ${categoriaActiva === cat ? 'active' : ''}`}
                onClick={() => setCategoriaActiva(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section Impactante */}
      <section className="hero-tienda">
        <div className="container">
          <div className="hero-content-tienda">
            <div className="hero-text-tienda">
              <h1>Belleza que Inspira Confianza</h1>
              <p>Productos premium para realzar tu belleza natural. Calidad garantizada y envío rápido.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Productos con Tarjetas Mejoradas */}
      <main className="main-tienda">
        <div className="container">
          <div className="products-header-tienda">
            <h2>Nuestros Productos</h2>
            <p>Selección cuidadosa para tu bienestar</p>
          </div>

          <div className="products-grid-tienda">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="product-card-tienda">
                {/* Imagen con Badges Mejorados */}
                <div className="product-image-section">
                  <div className="image-container-tienda">
                    <img 
                      src={producto.imagen} 
                      alt={producto.nombre}
                      className="product-image-tienda"
                    />
                  </div>
                  
                  <div className="product-badges-tienda">
                    {producto.descuento && (
                      <span className="badge discount-badge-tienda">
                        -{producto.descuento}%
                      </span>
                    )}
                    {producto.destacado && (
                      <span className="badge featured-badge-tienda">
                        ⭐ Popular
                      </span>
                    )}
                  </div>

                  <div className="product-actions-tienda">
                    <button className="action-btn-tienda wishlist-btn">
                      <FiHeart />
                    </button>
                    <button className="action-btn-tienda view-btn">
                      <FiEye />
                    </button>
                  </div>
                </div>

                {/* Información del Producto Mejorada */}
                <div className="product-info-tienda">
                  <div className="product-category-tienda">
                    {producto.categoria}
                  </div>
                  
                  <h3 className="product-name-tienda">
                    {producto.nombre}
                  </h3>
                  
                  <div className="product-brand-tienda">
                    {producto.marca}
                  </div>

                  <div className="product-rating-tienda">
                    <div className="stars-tienda">
                      {renderEstrellas(producto.rating)}
                    </div>
                    <span className="reviews-tienda">
                      ({producto.reviews})
                    </span>
                  </div>

                  <div className="product-pricing-tienda">
                    <div className="price-container-tienda">
                      {producto.precioOriginal && (
                        <span className="original-price-tienda">
                          {formatPrecio(producto.precioOriginal)}
                        </span>
                      )}
                      <span className="current-price-tienda">
                        {formatPrecio(producto.precio)}
                      </span>
                    </div>
                  </div>

                  <button 
                    className="add-to-cart-btn-tienda"
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    <FiShoppingCart />
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="no-products-tienda">
              <FiSearch size={64} />
              <h3>No encontramos productos</h3>
              <p>Prueba con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      </main>

      {/* Carrito Mejorado */}
      {mostrarCarrito && (
        <div className="cart-overlay-tienda">
          <div className="cart-sidebar-tienda">
            <div className="cart-header-tienda">
              <h3>🛒 Tu Carrito</h3>
              <button 
                className="close-cart-tienda"
                onClick={() => setMostrarCarrito(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="cart-content-tienda">
              {carrito.length === 0 ? (
                <div className="empty-cart-tienda">
                  <FiShoppingCart size={80} />
                  <h4>Tu carrito está vacío</h4>
                  <p>Agrega productos increíbles</p>
                  <button 
                    className="continue-shopping-tienda"
                    onClick={() => setMostrarCarrito(false)}
                  >
                    Explorar Productos
                  </button>
                </div>
              ) : (
                <>
                  <div className="cart-items-tienda">
                    {carrito.map((item) => (
                      <div key={item.producto.id} className="cart-item-tienda">
                        <div className="item-image-tienda">
                          <img src={item.producto.imagen} alt={item.producto.nombre} />
                        </div>
                        
                        <div className="item-details-tienda">
                          <h4>{item.producto.nombre}</h4>
                          <div className="item-price-tienda">
                            {formatPrecio(item.producto.precio)}
                          </div>
                          
                          <div className="quantity-controls-tienda">
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
                          className="remove-item-tienda"
                          onClick={() => removerDelCarrito(item.producto.id)}
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="checkout-section-tienda">
                    <div className="customer-info-tienda">
                      <h4>Información de Contacto</h4>
                      <div className="form-tienda">
                        <input
                          type="text"
                          placeholder="Nombre completo"
                          value={cliente.nombre}
                          onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={cliente.email}
                          onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                        />
                        <input
                          type="tel"
                          placeholder="Teléfono"
                          value={cliente.telefono}
                          onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="cart-total-tienda">
                      <div className="total-line-tienda">
                        <span>Subtotal:</span>
                        <span>{formatPrecio(totalCarrito)}</span>
                      </div>
                      <div className="total-line-tienda">
                        <span>Envío:</span>
                        <span>Gratis</span>
                      </div>
                      <div className="total-line-tienda final-total-tienda">
                        <span>Total:</span>
                        <span>{formatPrecio(totalCarrito)}</span>
                      </div>
                    </div>

                    <button
                      className="checkout-btn-tienda"
                      onClick={handleCheckout}
                      disabled={procesandoPago}
                    >
                      {procesandoPago ? (
                        "Procesando..."
                      ) : (
                        <>
                          <FiCheck />
                          Comprar Ahora
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
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

  // Usa las mismas imágenes de tu tienda
  const [carrito, setCarrito] = useState<CarritoItem[]>([
    {
      producto: {
        id: "1",
        nombre: "Crema Hidratante Nivea",
        precio: 15.99,
        precioOriginal: 19.99,
        imagen: "/images/Protector.jpg", // RUTA REAL
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
        imagen: "/images/hys.avif", // RUTA REAL
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
        imagen: "/images/Protector.jpg", // RUTA REAL
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

  return (
    <div className="tienda-premium">
      {/* Header - Igual que tienda */}
      <header className="tienda-header">
        <div className="container">
          <div className="header-content-tienda">
            <button
              className="back-button"
              onClick={() => router.back()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#4b5563',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <FiArrowLeft />
              Seguir Comprando
            </button>
            
            <div className="brand-tienda">
              <h1>ComerciosConecta</h1>
              <span>Mi Carrito</span>
            </div>
            
            <div className="header-actions-tienda">
              <button 
                className="cart-btn-tienda"
                onClick={() => router.push("/store")}
              >
                <FiShoppingCart />
                <span className="cart-count-tienda">{carrito.length}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación simple */}
      <nav className="nav-tienda">
        <div className="container">
          <div className="nav-content-tienda">
            <button className="nav-item-tienda active">
              Carrito de Compras
            </button>
            <button className="nav-item-tienda" onClick={() => router.push("/store")}>
              Volver a Tienda
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="main-tienda">
        <div className="container">
          <div className="products-header-tienda">
            <h2>Tu Carrito de Compras</h2>
            <p>{carrito.length} producto{carrito.length !== 1 ? 's' : ''} en tu carrito</p>
          </div>

          <div className="cart-content-tienda">
            {carrito.length === 0 ? (
              <div className="empty-cart-tienda">
                <FiShoppingCart size={80} />
                <h4>Tu carrito está vacío</h4>
                <p>Agrega productos increíbles</p>
                <button 
                  className="continue-shopping-tienda"
                  onClick={continuarComprando}
                >
                  Explorar Productos
                </button>
              </div>
            ) : (
              <div className="cart-layout">
                {/* Lista de productos - Usando clases de tienda */}
                <div className="cart-items-section" style={{ flex: 1 }}>
                  <div className="cart-items-tienda">
                    {carrito.map(item => (
                      <div key={item.producto.id} className="cart-item-tienda">
                        <div className="item-image-tienda">
                          <img 
                            src={item.producto.imagen} 
                            alt={item.producto.nombre}
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                        
                        <div className="item-details-tienda">
                          <h4>{item.producto.nombre}</h4>
                          <div className="product-brand-tienda">
                            {item.producto.marca}
                          </div>
                          <div className="item-price-tienda">
                            {item.producto.precioOriginal && (
                              <span style={{
                                textDecoration: 'line-through',
                                color: '#9ca3af',
                                marginRight: '0.5rem',
                                fontSize: '0.875rem'
                              }}>
                                ${item.producto.precioOriginal}
                              </span>
                            )}
                            <strong style={{ color: '#059669', fontSize: '1.125rem' }}>
                              ${item.producto.precio}
                            </strong>
                          </div>
                          
                          <div className="quantity-controls-tienda">
                            <button
                              onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                              disabled={item.cantidad <= 1}
                            >
                              <FiMinus />
                            </button>
                            <span>{item.cantidad}</span>
                            <button
                              onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                              disabled={item.cantidad >= item.producto.stock}
                            >
                              <FiPlus />
                            </button>
                          </div>
                        </div>
                        
                        <button 
                          className="remove-item-tienda"
                          onClick={() => eliminarProducto(item.producto.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumen del pedido */}
                <div className="checkout-section-tienda" style={{ maxWidth: '400px' }}>
                  <div className="customer-info-tienda">
                    <h4>Resumen del Pedido</h4>
                    
                    {/* Cupón */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      {cuponAplicado ? 
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#10b981',
                          color: 'white',
                          padding: '1rem',
                          borderRadius: '8px',
                          marginBottom: '1rem'
                        }}>
                          <span>Cupón aplicado</span>
                          <button
                            onClick={removerCupon}
                            style={{
                              background: 'rgba(255, 255, 255, 0.2)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Remover
                          </button>
                        </div>
                        :
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '1rem'
                        }}>
                          <FiTag />
                          <input
                            type="text"
                            placeholder="Código de cupón"
                            value={cupon}
                            onChange={handleCuponChange}
                            style={{
                              flex: 1,
                              padding: '0.75rem',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px'
                            }}
                          />
                          <button
                            onClick={aplicarCupon}
                            style={{
                              padding: '0.75rem 1rem',
                              background: '#8b5cf6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Aplicar
                          </button>
                        </div>
                      }
                    </div>

                    {/* Totales - Usando clases existentes */}
                    <div className="cart-total-tienda">
                      <div className="total-line-tienda">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      
                      {descuento > 0 && (
                        <div className="total-line-tienda" style={{ color: '#10b981' }}>
                          <span>Descuento ({descuento}%):</span>
                          <span>-${descuentoAplicado.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="total-line-tienda">
                        <span>Envío:</span>
                        <span>{envio === 0 ? "Gratis" : `$${envio.toFixed(2)}`}</span>
                      </div>
                      
                      <div className="total-line-tienda">
                        <span>Impuestos (16%):</span>
                        <span>${impuestos.toFixed(2)}</span>
                      </div>
                      
                      <div className="total-line-tienda final-total-tienda">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Nota de envío */}
                    {subtotal < 50 && (
                      <div style={{
                        background: '#fef3c7',
                        border: '1px solid #fcd34d',
                        borderRadius: '8px',
                        padding: '1rem',
                        margin: '1rem 0',
                        textAlign: 'center'
                      }}>
                        <p style={{ margin: 0, color: '#92400e', fontSize: '0.875rem' }}>
                          ¡Faltan ${(50 - subtotal).toFixed(2)} para envío GRATIS!
                        </p>
                      </div>
                    )}

                    {/* Botones */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                      <button
                        className="checkout-btn-tienda"
                        onClick={procederCheckout}
                      >
                        <FiShoppingCart style={{ marginRight: '8px' }} />
                        Proceder al Pago
                      </button>
                      
                      <button
                        className="continue-shopping-tienda"
                        onClick={continuarComprando}
                      >
                        Continuar Comprando
                      </button>
                    </div>

                    {/* Garantías */}
                    <div style={{
                      marginTop: '1.5rem',
                      paddingTop: '1.5rem',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🚚</span>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Envìo rápido y seguro</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🛡️</span>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Compra 100% protegida</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>↩️</span>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Devoluciones fáciles</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
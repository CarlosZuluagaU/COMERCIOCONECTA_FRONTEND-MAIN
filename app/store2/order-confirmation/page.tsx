"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiShoppingBag, FiTruck, FiMail, FiHome, FiDownload, FiClock, FiPackage, FiStar, FiHeart, FiArrowLeft } from "react-icons/fi";
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

  // Datos de ejemplo con imágenes REALES
  const pedido: Pedido = {
    id: "ORD-00125",
    fecha: new Date().toISOString(),
    estado: "Confirmado",
    total: 156800, // En centavos
    items: [
      {
        producto: {
          id: "1",
          nombre: "Crema Hidratante Nivea",
          precio: 1599,
          imagen: "/images/Protector.jpg"
        },
        cantidad: 2
      },
      {
        producto: {
          id: "2",
          nombre: "Shampoo Head & Shoulders", 
          precio: 2250,
          imagen: "/images/hys.avif"
        },
        cantidad: 1
      },
      {
        producto: {
          id: "3",
          nombre: "Labial Matte MAC",
          precio: 4500,
          imagen: "/images/labial.jpg"
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

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio / 100);
  };

  const continuarComprando = () => {
    router.push("/store");
  };

  const verHistorial = () => {
    router.push("/store/orders");
  };

  const descargarFactura = () => {
    alert("Descargando factura...");
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
              Volver a Tienda
            </button>
            
            <div className="brand-tienda">
              <h1>ComerciosConecta</h1>
              <span>Confirmación de Pedido</span>
            </div>
            
            <div className="header-actions-tienda">
              <button 
                className="cart-btn-tienda"
                onClick={() => router.push("/store")}
              >
                <FiShoppingBag />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="nav-tienda">
        <div className="container">
          <div className="nav-content-tienda">
            <button className="nav-item-tienda active">
              Confirmación
            </button>
            <button className="nav-item-tienda" onClick={verHistorial}>
              Historial
            </button>
            <button className="nav-item-tienda" onClick={continuarComprando}>
              Seguir Comprando
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section de Confirmación */}
      <section className="hero-tienda" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
        <div className="container">
          <div className="hero-content-tienda" style={{ textAlign: 'center' }}>
            <div style={{
              width: '100px',
              height: '100px',
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              color: '#059669',
              fontSize: '3rem'
            }}>
              <FiCheck />
            </div>
            <div className="hero-text-tienda">
              <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>¡Pedido Confirmado!</h1>
              <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>
                Gracias por tu compra. Tu pedido <strong>#{pedido.id}</strong> ha sido procesado exitosamente.
              </p>
            </div>
            
            {/* Estadísticas rápidas */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '3rem',
              marginTop: '3rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                  {formatPrecio(pedido.total)}
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                  {pedido.items.length}
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Productos</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                  {pedido.envio.tiempoEstimado}
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Entrega</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <main className="main-tienda">
        <div className="container">
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            {/* Columna izquierda - Información principal */}
            <div style={{ flex: 1 }}>
              {/* Productos del pedido */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#1f2937' }}>
                  Productos en tu Pedido
                </h2>
                
                <div className="order-summary-sidebar">
                  {pedido.items.map(item => (
                    <div key={item.producto.id} className="summary-item-sidebar" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      marginBottom: '0.75rem'
                    }}>
                      <div className="item-preview-sidebar" style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.25rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        <img 
                          src={item.producto.imagen} 
                          alt={item.producto.nombre}
                          style={{
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                      <div className="item-info-sidebar" style={{ flex: 1 }}>
                        <div className="item-name-sidebar" style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '0.25rem'
                        }}>
                          {item.producto.nombre}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          Cantidad: {item.cantidad}
                        </div>
                      </div>
                      <div className="item-price-sidebar" style={{ 
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: '#059669'
                      }}>
                        {formatPrecio(item.producto.precio * item.cantidad)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información de envío y pago */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                marginBottom: '2rem'
              }}>
                {/* Envío */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      background: '#3b82f6',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <FiTruck />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#1f2937' }}>
                      Información de Envío
                    </h3>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Dirección:</span>
                      <span style={{ fontWeight: '500', textAlign: 'right' }}>{pedido.envio.direccion}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Ciudad:</span>
                      <span style={{ fontWeight: '500' }}>{pedido.envio.ciudad}, {pedido.envio.codigoPostal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Método:</span>
                      <span style={{ fontWeight: '500' }}>{pedido.envio.metodo}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Entrega estimada:</span>
                      <span style={{ fontWeight: '600', color: '#059669' }}>{pedido.envio.tiempoEstimado}</span>
                    </div>
                  </div>
                </div>

                {/* Pago */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      background: '#8b5cf6',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <FiShoppingBag />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#1f2937' }}>
                      Información de Pago
                    </h3>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Método:</span>
                      <span style={{ fontWeight: '500' }}>{pedido.pago.metodo}</span>
                    </div>
                    {pedido.pago.ultimosDigitos && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Tarjeta:</span>
                        <span style={{ fontWeight: '500' }}>•••• {pedido.pago.ultimosDigitos}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Email:</span>
                      <span style={{ fontWeight: '500' }}>{pedido.pago.email}</span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '2px solid #e5e7eb'
                    }}>
                      <span style={{ fontSize: '1rem', fontWeight: '700' }}>Total pagado:</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#059669' }}>
                        {formatPrecio(pedido.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seguimiento del pedido */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#1f2937' }}>
                  Seguimiento del Pedido
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                  Así avanzará tu compra hasta la entrega
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {[
                    { icon: FiCheck, title: 'Confirmado', desc: 'Pedido recibido y confirmado', active: true },
                    { icon: FiPackage, title: 'Preparando', desc: 'Empaquetando tu pedido', active: false },
                    { icon: FiTruck, title: 'En camino', desc: 'Pedido enviado y en ruta', active: false },
                    { icon: FiHome, title: 'Entregado', desc: '¡Tu pedido ha llegado!', active: false }
                  ].map((step, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem'
                    }}>
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '50%',
                        background: step.active ? '#10b981' : '#f3f4f6',
                        color: step.active ? 'white' : '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        flexShrink: 0
                      }}>
                        <step.icon />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          {step.title}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar de acciones */}
            <div style={{ width: '350px', flexShrink: 0 }}>
              {/* Resumen del pedido */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#1f2937', textAlign: 'center' }}>
                  Resumen del Pedido
                </h3>
                
                <div className="totals-sidebar" style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '1.5rem'
                }}>
                  <div className="total-line-sidebar" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{ color: '#6b7280' }}>Subtotal:</span>
                    <span>{formatPrecio(pedido.total)}</span>
                  </div>
                  <div className="total-line-sidebar" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{ color: '#6b7280' }}>Envìo:</span>
                    <span>Gratis</span>
                  </div>
                  <div className="total-line-sidebar grand-total" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '2px solid #e5e7eb',
                    fontWeight: '700',
                    fontSize: '1.125rem'
                  }}>
                    <span>Total:</span>
                    <span style={{ color: '#059669' }}>{formatPrecio(pedido.total)}</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    className="checkout-btn-tienda"
                    onClick={continuarComprando}
                    style={{ background: '#8b5cf6' }}
                  >
                    <FiShoppingBag />
                    Seguir Comprando
                  </button>
                  
                  <button
                    className="continue-shopping-tienda"
                    onClick={verHistorial}
                  >
                    <FiClock />
                    Ver Historial
                  </button>
                  
                  <button
                    className="continue-shopping-tienda"
                    onClick={descargarFactura}
                    style={{ background: '#f1f5f9', color: '#4b5563' }}
                  >
                    <FiDownload />
                    Descargar Factura
                  </button>
                </div>
              </div>

              {/* Soporte */}
              <div style={{
                background: '#f0f9ff',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem',
                border: '1px solid #bae6fd'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <FiStar style={{ color: '#f59e0b' }} />
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0369a1' }}>
                    ¿Necesitas ayuda?
                  </h4>
                </div>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#0c4a6e' }}>
                  Estamos aquí para ayudarte con tu pedido
                </p>
                
                <div style={{ fontSize: '0.875rem', color: '#0c4a6e' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Email</strong>
                    <div>soporte@comerciosconecta.com</div>
                  </div>
                  <div>
                    <strong>Teléfono</strong>
                    <div>+57 1 234 5678</div>
                  </div>
                </div>
              </div>

              {/* Garantía */}
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #fcd34d'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <FiHeart style={{ color: '#dc2626' }} />
                  <span style={{ fontWeight: '600', color: '#92400e' }}>Garantía de Satisfacción</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#92400e' }}>
                  30 días para devoluciones • Soporte prioritario
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
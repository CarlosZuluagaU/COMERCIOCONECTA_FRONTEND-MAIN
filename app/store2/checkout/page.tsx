"use client";
import React, { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiLock, FiCreditCard, FiTruck, FiUser, FiCheck, FiShield, FiClock } from "react-icons/fi";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function CheckoutPage() {
  const router = useRouter();
  const [pasoActual, setPasoActual] = useState(1);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);


  const [carrito] = useState<CarritoItem[]>([
    {
      producto: {
        id: "1",
        nombre: "Crema Hidratante Nivea",
        precio: 1599, // En centavos
        imagen: "/images/Protector.jpg" // RUTA REAL
      },
      cantidad: 2
    },
    {
      producto: {
        id: "2",
        nombre: "Shampoo Head & Shoulders",
        precio: 2250,
        imagen: "/images/hys.avif" // RUTA REAL
      },
      cantidad: 1
    },
    {
      producto: {
        id: "3",
        nombre: "Labial Matte MAC",
        precio: 4500,
        imagen: "/images/labial.jpg" // RUTA REAL
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

  // Crear orden y generar link de pago
  const procesarPago = async () => {
    if (!aceptaTerminos) {
      alert("Debe aceptar los términos y condiciones");
      return;
    }

    try {
      setLoading(true);

      // Crear orden
      const orderRes = await fetch(`${API_BASE_URL}/checkout/create-order`, {
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
        `${API_BASE_URL}/checkout/create-payment-link/${orderId}`,
        { method: "POST" }
      );

      if (!paymentRes.ok) throw new Error("Error creando el link de pago");
      const paymentData = await paymentRes.json();

      const paymentUrl = paymentData.payment_url || paymentData.url;

      // 3 Redirigir a Wompi
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

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio / 100);
  };

  // Paso 1 - Información
  const pasoInformacion = (
    <div className="checkout-step" style={{ marginBottom: '2rem' }}>
      <div className="step-header" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div className="step-icon" style={{
          width: '3rem',
          height: '3rem',
          background: '#8b5cf6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <FiUser size={20} />
        </div>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', color: '#1f2937' }}>
            Información de Contacto
          </h3>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Completa tus datos para el envío y facturación
          </p>
        </div>
      </div>
      
      <div className="form-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        {[
          { label: "Email", type: "email", field: "email", placeholder: "tu@email.com" },
          { label: "Nombre", type: "text", field: "nombre", placeholder: "Tu nombre" },
          { label: "Apellido", type: "text", field: "apellido", placeholder: "Tu apellido" },
          { label: "Teléfono", type: "tel", field: "telefono", placeholder: "+57 300 123 4567" },
          { label: "Dirección", type: "text", field: "direccion", placeholder: "Calle 123 #45-67", span: 2 },
          { label: "Ciudad", type: "text", field: "ciudad", placeholder: "Bogotá" },
          { label: "Código Postal", type: "text", field: "codigoPostal", placeholder: "110111" }
        ].map((input) => (
          <div 
            key={input.field} 
            className="form-group" 
            style={{ gridColumn: input.span === 2 ? 'span 2' : 'auto' }}
          >
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151',
              fontSize: '0.875rem'
            }}>
              {input.label} *
            </label>
            <input
              type={input.type}
              value={(formData as any)[input.field]}
              onChange={handleInputChange(input.field as keyof FormData)}
              placeholder={input.placeholder}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  // Paso 2 - Resumen y botón de pago
  const pasoResumen = (
    <div className="checkout-step" style={{ marginBottom: '2rem' }}>
      <div className="step-header" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div className="step-icon" style={{
          width: '3rem',
          height: '3rem',
          background: '#8b5cf6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <FiCreditCard size={20} />
        </div>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', color: '#1f2937' }}>
            Resumen del Pedido
          </h3>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Revisa tu pedido y procede al pago seguro
          </p>
        </div>
      </div>

      <div className="order-summary">
        <div className="order-items" style={{ marginBottom: '2rem' }}>
          {carrito.map((item) => (
            <div key={item.producto.id} className="order-item" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '0.75rem'
            }}>
              <div className="order-item-image" style={{
                width: '60px',
                height: '60px',
                borderRadius: '6px',
                overflow: 'hidden',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.25rem'
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
              <div className="order-item-info" style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                  {item.producto.nombre}
                </h4>
                <span className="item-quantity" style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Cantidad: {item.cantidad}
                </span>
              </div>
              <span className="order-item-price" style={{ fontWeight: '700', color: '#059669' }}>
                {formatPrecio(item.producto.precio * item.cantidad)}
              </span>
            </div>
          ))}
        </div>

        <div className="order-totals" style={{
          background: '#f8fafc',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div className="total-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.5rem 0',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <span style={{ color: '#6b7280' }}>Subtotal</span>
            <span>{formatPrecio(subtotal)}</span>
          </div>
          <div className="total-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.5rem 0',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <span style={{ color: '#6b7280' }}>Envìo</span>
            <span>{envio === 0 ? "Gratis" : formatPrecio(envio)}</span>
          </div>
          <div className="total-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.5rem 0',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <span style={{ color: '#6b7280' }}>Impuestos</span>
            <span>{formatPrecio(impuestos)}</span>
          </div>
          <div className="total-row final" style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '1rem 0 0 0',
            marginTop: '0.5rem',
            borderTop: '2px solid #e5e7eb'
          }}>
            <span style={{ fontWeight: '700', fontSize: '1.125rem' }}>Total</span>
            <span className="total-amount" style={{ 
              fontWeight: '800', 
              fontSize: '1.25rem',
              color: '#059669' 
            }}>
              {formatPrecio(total)}
            </span>
          </div>
        </div>

        <div className="security-features" style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div className="security-item" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            <FiShield className="security-icon" style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '0.875rem', color: '#1e40af' }}>
              Pago 100% seguro con encriptación SSL
            </span>
          </div>
          <div className="security-item" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <FiClock className="security-icon" style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '0.875rem', color: '#1e40af' }}>
              Procesamiento inmediato
            </span>
          </div>
        </div>

        <label className="terms-checkbox" style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
            style={{ marginTop: '0.25rem' }}
          />
          <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
            Acepto los <a href="/terminos" style={{ color: '#8b5cf6' }}>términos y condiciones</a> y la{" "}
            <a href="/privacidad" style={{ color: '#8b5cf6' }}>política de privacidad</a>
          </span>
        </label>

        <button
          className="checkout-btn-tienda"
          onClick={procesarPago}
          disabled={!aceptaTerminos || loading}
          style={{
            width: '100%',
            padding: '1rem 2rem',
            background: !aceptaTerminos ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: !aceptaTerminos ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            transition: 'all 0.2s'
          }}
        >
          <FiLock />
          {loading ? "Procesando..." : "Proceder al Pago Seguro"}
        </button>
      </div>
    </div>
  );

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
              <span>Checkout Seguro</span>
            </div>
            
            <div className="header-security" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              color: '#0369a1'
            }}>
              <FiShield />
              <span style={{ fontSize: '0.875rem' }}>Conexión segura</span>
            </div>
          </div>
        </div>
      </header>

      {/* Barra de progreso */}
      <div style={{ background: '#f8fafc', padding: '1rem 0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem'
          }}>
            {[1, 2].map((paso) => (
              <div
                key={paso}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  background: paso <= pasoActual ? '#8b5cf6' : '#d1d5db',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>
                  {paso < pasoActual ? <FiCheck size={16} /> : paso}
                </div>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: paso === pasoActual ? '600' : '400',
                  color: paso <= pasoActual ? '#8b5cf6' : '#6b7280'
                }}>
                  {paso === 1 ? 'Información' : 'Pago'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="main-tienda">
        <div className="container">
          <div className="products-header-tienda">
            <h2>Completa tu Compra</h2>
            <p>Sigue los pasos para finalizar tu pedido de forma segura</p>
          </div>

          <div className="cart-layout" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            {/* Formulario principal */}
            <div style={{ flex: 1, background: 'white', borderRadius: '12px', padding: '2rem' }}>
              {pasoActual === 1 ? pasoInformacion : pasoResumen}
              
              {/* Navegación */}
              {pasoActual < 2 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '2rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button
                    className="continue-shopping-tienda"
                    onClick={() => router.back()}
                  >
                    Cancelar
                  </button>
                  <button
                    className="checkout-btn-tienda"
                    onClick={siguientePaso}
                    style={{ background: '#8b5cf6', color: 'white', padding: '0.875rem 2rem' }}
                  >
                    Continuar
                    <FiCreditCard style={{ marginLeft: '0.5rem' }} />
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar de resumen */}
            <div style={{ width: '350px', flexShrink: 0 }}>
              <div className="summary-card" style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', color: '#1f2937' }}>
                  Resumen de Compra
                </h4>
                
                <div className="order-summary-sidebar" style={{ marginBottom: '1.5rem' }}>
                  {carrito.map((item) => (
                    <div key={item.producto.id} className="summary-item-sidebar" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      marginBottom: '0.75rem'
                    }}>
                      <div className="item-preview-sidebar" style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.25rem'
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
                          fontSize: '0.75rem',
                          color: '#4b5563',
                          marginBottom: '0.25rem'
                        }}>
                          {item.producto.nombre}
                        </div>
                        <div className="item-price-sidebar" style={{ 
                          fontSize: '0.875rem',
                          color: '#059669',
                          fontWeight: '600'
                        }}>
                          {formatPrecio(item.producto.precio)} c/u
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#6b7280'
                      }}>
                        x{item.cantidad}
                      </span>
                    </div>
                  ))}
                </div>

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
                    <span>{formatPrecio(subtotal)}</span>
                  </div>
                  <div className="total-line-sidebar" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{ color: '#6b7280' }}>Envío:</span>
                    <span>{envio === 0 ? "Gratis" : formatPrecio(envio)}</span>
                  </div>
                  <div className="total-line-sidebar" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{ color: '#6b7280' }}>Impuestos:</span>
                    <span>{formatPrecio(impuestos)}</span>
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
                    <span style={{ color: '#059669' }}>{formatPrecio(total)}</span>
                  </div>
                </div>
              </div>

              {/* Soporte */}
              <div style={{
                background: '#f0f9ff',
                borderRadius: '12px',
                padding: '1.5rem',
                marginTop: '1rem',
                border: '1px solid #bae6fd'
              }}>
                <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#0369a1' }}>
                  ¿Necesitas ayuda?
                </h5>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#0c4a6e' }}>
                  Estamos aquí para ayudarte con tu compra
                </p>
                <div style={{ fontSize: '0.875rem', color: '#0c4a6e' }}>
                  <div style={{ marginBottom: '0.5rem' }}>📞 +57 1 123 4567</div>
                  <div>✉️ soporte@comerciosconecta.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
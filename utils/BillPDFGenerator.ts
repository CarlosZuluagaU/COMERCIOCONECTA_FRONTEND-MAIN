import jsPDF from 'jspdf';
import { FactusResponse, VentaData } from '../types/factus';

export const generateBillPDF = async (
  respuestaFactus: FactusResponse, 
  ventaData: VentaData
): Promise<string> => {
  // Extraer datos importantes de la respuesta
  const billData = respuestaFactus.data?.bill;
  const companyData = respuestaFactus.data?.company;
  const customerData = respuestaFactus.data?.customer;
  const items = respuestaFactus.data?.items || [];
  
  if (!billData) {
    throw new Error('Datos de factura no disponibles');
  }

  // Crear PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  
  // Configuración de estilos
  const titleSize = 16;
  const subtitleSize = 12;
  const normalSize = 10;
  const smallSize = 8;
  
  let yPos = margin;
  
  // ====================
  //   ENCABEZADO
  // ====================
  
  // Título principal
  pdf.setFontSize(titleSize);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FACTURA ELECTRÓNICA DE VENTA', pageWidth / 2, yPos, { align: 'center' } as any);
  yPos += 10;
  
  // Número de factura
  pdf.setFontSize(subtitleSize);
  pdf.text(`No: ${billData.number || 'N/A'}`, pageWidth / 2, yPos, { align: 'center' } as any);
  yPos += 8;
  
  // CUFÉ (acortado si es muy largo)
  const cufe = billData.cufe || 'No disponible';
  const cufeShort = cufe.length > 40 ? cufe.substring(0, 40) + '...' : cufe;
  pdf.setFontSize(smallSize);
  pdf.text(`CUFÉ: ${cufeShort}`, pageWidth / 2, yPos, { align: 'center' } as any);
  yPos += 15;
  
  // ====================
  //   DATOS DEL EMISOR
  // ====================
  pdf.setFontSize(normalSize);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EMISOR', margin, yPos);
  pdf.setFont('helvetica', 'normal');
  yPos += 6;
  
  // Nombre de la empresa
  const empresaNombre = companyData?.company || companyData?.name || 'No disponible';
  pdf.text(empresaNombre, margin, yPos);
  yPos += 5;
  
  // NIT
  pdf.text(`NIT: ${companyData?.nit || 'N/A'}${companyData?.dv ? `-${companyData.dv}` : ''}`, margin, yPos);
  yPos += 5;
  
  // Dirección
  const direccion = companyData?.direction || 'No disponible';
  const direccionLines = pdf.splitTextToSize(`Dirección: ${direccion}`, pageWidth - 2 * margin);
  pdf.text(direccionLines[0], margin, yPos);
  yPos += 5;
  if (direccionLines.length > 1) {
    pdf.text(direccionLines[1], margin, yPos);
    yPos += 5;
  }
  
  // Contacto
  pdf.text(`Tel: ${companyData?.phone || 'N/A'}`, margin, yPos);
  yPos += 5;
  pdf.text(`Email: ${companyData?.email || 'N/A'}`, margin, yPos);
  yPos += 10;
  
  // Línea separadora
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  
  // ====================
  //   DATOS DEL CLIENTE
  // ====================
  pdf.setFont('helvetica', 'bold');
  pdf.text('CLIENTE', margin, yPos);
  pdf.setFont('helvetica', 'normal');
  yPos += 6;
  
  // Nombre del cliente
  const clienteNombre = customerData?.names || ventaData?.nombreCliente || 'No disponible';
  pdf.text(clienteNombre, margin, yPos);
  yPos += 5;
  
  // Identificación
  pdf.text(`Identificación: ${customerData?.identification || ventaData?.numeroDocumentoCliente || 'N/A'}`, margin, yPos);
  yPos += 5;
  
  // Dirección del cliente
  const clienteDireccion = customerData?.address || 'No disponible';
  const clienteDirLines = pdf.splitTextToSize(`Dirección: ${clienteDireccion}`, pageWidth - 2 * margin);
  pdf.text(clienteDirLines[0], margin, yPos);
  yPos += 5;
  if (clienteDirLines.length > 1) {
    pdf.text(clienteDirLines[1], margin, yPos);
    yPos += 5;
  }
  
  // Contacto del cliente
  pdf.text(`Tel: ${customerData?.phone || 'N/A'}`, margin, yPos);
  yPos += 5;
  pdf.text(`Email: ${customerData?.email || 'N/A'}`, margin, yPos);
  yPos += 10;
  
  // Línea separadora
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  
  // ====================
  //   DETALLES DE FACTURA
  // ====================
  pdf.setFont('helvetica', 'bold');
  pdf.text('DETALLES DE LA FACTURA', margin, yPos);
  pdf.setFont('helvetica', 'normal');
  yPos += 8;
  
  // Fechas
  if (billData.validated) {
    pdf.text(`Fecha de validación: ${formatDate(billData.validated)}`, margin, yPos);
    yPos += 5;
  }
  
  if (billData.created_at) {
    pdf.text(`Fecha de creación: ${formatDate(billData.created_at)}`, margin, yPos);
    yPos += 5;
  }
  
  // Referencia
  if (billData.reference_code) {
    pdf.text(`Referencia: ${billData.reference_code}`, margin, yPos);
    yPos += 5;
  }
  
  yPos += 5;
  
  // ====================
  //   TABLA DE ITEMS
  // ====================
  
  // Encabezados de la tabla
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(smallSize);
  
  // Definir posiciones de columnas
  const colCodigo = margin;
  const colDescripcion = margin + 15;
  const colCantidad = margin + 80;
  const colPrecio = margin + 100;
  const colTotal = margin + 140;
  
  pdf.text('Código', colCodigo, yPos);
  pdf.text('Descripción', colDescripcion, yPos);
  pdf.text('Cant.', colCantidad, yPos);
  pdf.text('Precio', colPrecio, yPos);
  pdf.text('Total', colTotal, yPos);
  yPos += 6;
  
  // Línea separadora
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 3;
  
  // Items
  pdf.setFont('helvetica', 'normal');
  
  items.forEach((item, index) => {
    // Verificar si necesitamos nueva página
    if (yPos > 250) {
      pdf.addPage();
      yPos = margin;
    }
    
    // Código
    const codigo = item.code_reference || 'N/A';
    pdf.text(codigo, colCodigo, yPos);
    
    // Descripción (con ajuste de línea)
    const descripcion = item.name || 'N/A';
    const descLines = pdf.splitTextToSize(descripcion, 50);
    if (descLines.length > 1) {
      pdf.text(descLines[0], colDescripcion, yPos);
      // Si la descripción es muy larga, continuar en la siguiente fila
      for (let i = 1; i < descLines.length; i++) {
        yPos += 4;
        pdf.text(descLines[i], colDescripcion, yPos);
      }
    } else {
      pdf.text(descripcion, colDescripcion, yPos);
    }
    
    // Cantidad
    const cantidad = parseFloat(item.quantity || '0').toLocaleString('es-CO');
    pdf.text(cantidad, colCantidad, yPos);
    
    // Precio unitario
    const precio = parseFloat(item.price || '0').toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    pdf.text(`$${precio}`, colPrecio, yPos);
    
    // Total
    const total = item.total?.toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) || '0.00';
    pdf.text(`$${total}`, colTotal, yPos);
    
    yPos += 8;
    
    // Línea separadora entre items (opcional)
    if (index < items.length - 1) {
      pdf.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
    }
  });
  
  // Línea separadora final de tabla
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  
  // ====================
  //   RESUMEN DE VALORES
  // ====================
  pdf.setFontSize(normalSize);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RESUMEN DE VALORES', pageWidth - margin, yPos, { align: 'right' } as any);
  yPos += 8;
  
  const taxableAmount = parseFloat(billData.taxable_amount || '0');
  const taxAmount = parseFloat(billData.tax_amount || '0');
  const surchargeAmount = parseFloat(billData.surcharge_amount || '0');
  const totalAmount = parseFloat(billData.total || '0');
  const discountAmount = parseFloat(billData.discount_amount || '0');
  
  // Subtotal
  pdf.setFont('helvetica', 'normal');
  pdf.text('Subtotal:', pageWidth - margin - 60, yPos);
  pdf.text(`$${taxableAmount.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`, pageWidth - margin, yPos, { align: 'right' } as any);
  yPos += 6;
  
  // Descuento (si existe)
  if (discountAmount > 0) {
    pdf.text('Descuento:', pageWidth - margin - 60, yPos);
    pdf.text(`$${discountAmount.toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`, pageWidth - margin, yPos, { align: 'right' } as any);
    yPos += 6;
  }
  
  // IVA
  const ivaPercentage = items[0]?.tax_rate || '19';
  pdf.text(`IVA (${ivaPercentage}%):`, pageWidth - margin - 60, yPos);
  pdf.text(`$${taxAmount.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`, pageWidth - margin, yPos, { align: 'right' } as any);
  yPos += 6;
  
  // Recargos (si existen)
  if (surchargeAmount > 0) {
    pdf.text('Recargos:', pageWidth - margin - 60, yPos);
    pdf.text(`$${surchargeAmount.toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`, pageWidth - margin, yPos, { align: 'right' } as any);
    yPos += 6;
  }
  
  // Línea separadora antes del total
  pdf.line(pageWidth - margin - 60, yPos + 2, pageWidth - margin, yPos + 2);
  yPos += 8;
  
  // TOTAL
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 255); // Azul para el total
  pdf.text('TOTAL:', pageWidth - margin - 60, yPos);
  pdf.text(`$${totalAmount.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`, pageWidth - margin, yPos, { align: 'right' } as any);
  pdf.setTextColor(0, 0, 0); // Volver a negro
  yPos += 15;
  
  // ====================
  //   CÓDIGO QR (si está disponible)
  // ====================
  if (billData.qr_image) {
    try {
      // Título QR
      pdf.setFontSize(smallSize);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CÓDIGO QR PARA VERIFICACIÓN:', margin, yPos);
      yPos += 5;
      
      // Extraer imagen base64
      const qrImage = billData.qr_image;
      const imgData = qrImage.split(',')[1] || qrImage;
      
      // Agregar imagen QR (tamaño 40x40 mm)
      pdf.addImage(imgData, 'PNG', margin, yPos, 40, 40);
      
      // Información de verificación
      yPos += 45;
      pdf.setFont('helvetica', 'normal');
      pdf.text('Verifique esta factura en:', margin, yPos);
      yPos += 4;
      
      // URL de verificación (cortada si es muy larga)
      const qrUrl = billData.qr || 'No disponible';
      const qrUrlShort = qrUrl.length > 60 ? qrUrl.substring(0, 60) + '...' : qrUrl;
      pdf.text(qrUrlShort, margin, yPos, { 
        maxWidth: pageWidth - 2 * margin 
      } as any);
      
    } catch (error) {
      console.error('Error al agregar QR:', error);
      pdf.text('QR no disponible', margin, yPos);
      yPos += 10;
    }
  }
  
  yPos += 10;
  
  // ====================
  //   INFORMACIÓN ADICIONAL
  // ====================
  
  // Estado de la factura
  pdf.setFont('helvetica', 'bold');
  const estadoColor = billData.status === 1 ? [0, 128, 0] : [255, 0, 0]; // Verde o rojo
  pdf.setTextColor(estadoColor[0], estadoColor[1], estadoColor[2]);
  pdf.text(`ESTADO: ${billData.status === 1 ? 'VALIDADA POR DIAN' : 'PENDIENTE'}`, margin, yPos);
  pdf.setTextColor(0, 0, 0); // Volver a negro
  yPos += 8;
  
  // URL pública (si existe)
  if (billData.public_url) {
    pdf.setFontSize(smallSize);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Enlace público de verificación:', margin, yPos);
    yPos += 4;
    
    const publicUrl = billData.public_url;
    const publicUrlShort = publicUrl.length > 70 ? publicUrl.substring(0, 70) + '...' : publicUrl;
    pdf.text(publicUrlShort, margin, yPos, { 
      maxWidth: pageWidth - 2 * margin 
    } as any);
    yPos += 8;
  }
  
  // ====================
  //   OBSERVACIONES/ADVERTENCIAS
  // ====================
  if (billData.errors && Object.keys(billData.errors).length > 0) {
    yPos += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 0, 0); // Rojo para errores
    pdf.text('OBSERVACIONES / ADVERTENCIAS:', margin, yPos);
    yPos += 6;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    
    Object.values(billData.errors).forEach((error: any, index) => {
      if (yPos > 270) { // Si se acerca al final de la página
        pdf.addPage();
        yPos = margin;
      }
      
      const errorText = `• ${error}`;
      const errorLines = pdf.splitTextToSize(errorText, pageWidth - 2 * margin);
      
      errorLines.forEach((line: string) => {
        pdf.text(line, margin + 5, yPos);
        yPos += 4;
      });
    });
    
    pdf.setTextColor(0, 0, 0); // Volver a negro
  }
  
  // ====================
  //   PIE DE PÁGINA
  // ====================
  
  // Fecha de generación del PDF
  yPos = 280;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text(`Documento generado el: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`, 
    pageWidth / 2, yPos, { align: 'center' } as any);
  yPos += 5;
  
  // Número de página
  const totalPages = (pdf as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, 290, { align: 'center' } as any);
  }
  
  // ====================
  //   GUARDAR PDF
  // ====================
  
  // Generar nombre de archivo
  const nombreArchivo = `Factura_${billData.number || ventaData.id}_${new Date().getTime()}.pdf`;
  
  // Guardar PDF
  pdf.save(nombreArchivo);
  
  return nombreArchivo;
};

// ====================
//   FUNCIONES AUXILIARES
// ====================

// Función para formatear fechas
const formatDate = (dateString: string): string => {
  try {
    // Intentar parsear diferentes formatos de fecha
    let date: Date;
    
    if (dateString.includes('AM') || dateString.includes('PM')) {
      // Formato con AM/PM
      const cleaned = dateString.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3');
      date = new Date(cleaned);
    } else {
      // Intentar parsear directamente
      date = new Date(dateString);
    }
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return dateString; // Devolver original si no se puede parsear
    }
    
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
  } catch (error) {
    console.error('Error formateando fecha:', error, dateString);
    return dateString; // Devolver original en caso de error
  }
};

// Función alternativa para generar PDF sin ventaData (solo con respuesta Factus)
export const generateBillPDFFromFactusOnly = async (
  respuestaFactus: FactusResponse,
  fileName?: string
): Promise<string> => {
  const billData = respuestaFactus.data?.bill;
  
  if (!billData) {
    throw new Error('Datos de factura no disponibles');
  }
  
  // Crear un objeto VentaData mínimo a partir de los datos de Factus
  const ventaDataMinimal: VentaData = {
    id: billData.id.toString(),
    uuid: billData.cufe || '',
    nombreCliente: respuestaFactus.data?.customer?.names || 'Cliente',
    numeroDocumentoCliente: respuestaFactus.data?.customer?.identification || 'N/A',
    totalFactura: parseFloat(billData.total || '0'),
    items: respuestaFactus.data?.items?.map(item => ({
      codigoProducto: item.code_reference,
      nombre: item.name,
      cantidad: parseFloat(item.quantity || '0'),
      precioTotal: item.total || 0,
      porcentajeIva: parseFloat(item.tax_rate || '19')
    })) || [],
    estado: billData.status === 1 ? 'VALIDADA' : 'PENDIENTE',
    referencia: billData.reference_code,
    createdAt: billData.created_at
  };
  
  return generateBillPDF(respuestaFactus, ventaDataMinimal);
};

// Función para generar PDF desde un objeto InvoiceWithDetails
export const generatePDFFromInvoice = async (invoiceData: any): Promise<string> => {
  if (!invoiceData.factusData) {
    throw new Error('No hay datos de Factus disponibles');
  }
  
  if (invoiceData.ventaData) {
    return generateBillPDF(invoiceData.factusData, invoiceData.ventaData);
  } else {
    return generateBillPDFFromFactusOnly(invoiceData.factusData);
  }
};
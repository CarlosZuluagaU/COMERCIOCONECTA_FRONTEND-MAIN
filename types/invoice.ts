// Primero importar los tipos que necesitas
import { FactusResponse, VentaData } from './factus';

export interface Invoice {
  id: number;
  ventaId: number;
  factusBillId: number | null;
  number: string | null;
  status: string;
  rawResponse: string;
  createdAt: string;
}

export interface InvoiceResponse extends Invoice {
  parsedData?: FactusResponse;
}

export interface InvoiceWithDetails {
  invoice: Invoice;
  factusData: FactusResponse | null;
  ventaData?: VentaData; // Agregar esto para que funcione con generateBillPDF
  error?: string;
}

// También podrías crear un tipo para la respuesta del endpoint
export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
}
// types/factus.ts
export interface FactusCompany {
  url_logo?: string;
  nit: string;
  dv: string;
  company: string;
  name: string;
  graphic_representation_name: string;
  registration_code: string;
  economic_activity: string;
  phone: string;
  email: string;
  direction: string;
  municipality: string;
}

export interface FactusMunicipality {
  id: number;
  code: string;
  name: string;
  department?: {
    id: number;
    code: string;
    name: string;
  };
}

export interface FactusCustomer {
  identification: string;
  dv: string | null;
  graphic_representation_name: string;
  trade_name: string | null;
  company: string | null;
  names: string;
  address: string;
  email: string;
  phone: string;
  legal_organization: {
    id: number;
    code: string;
    name: string;
  };
  tribute: {
    id: number;
    code: string;
    name: string;
  };
  municipality: FactusMunicipality;
}

export interface FactusNumberingRange {
  prefix: string;
  from: number;
  to: number;
  resolution_number: string;
  start_date: string;
  end_date: string;
  months: number;
}

export interface FactusItem {
  scheme_id: string | null;
  note: string;
  code_reference: string;
  name: string;
  quantity: string;
  discount_rate: string;
  discount: string;
  gross_value: string;
  tax_rate: string;
  taxable_amount: string;
  tax_amount: string;
  price: string;
  is_excluded: number;
  unit_measure: {
    id: number;
    code: string;
    name: string;
  };
  standard_code: {
    id: number;
    code: string;
    name: string;
  };
  tribute: {
    id: number;
    code: string;
    name: string;
  };
  total: number;
  withholding_taxes: any[];
  mandate: any;
  additional_properties: any[];
}

export interface FactusAllowanceCharge {
  concept_type: {
    code: string;
    name: string;
  };
  is_surcharge: boolean;
  reason: string;
  base_amount: string;
  percentage: string;
  amount: string;
}

export interface FactusBill {
  id: number;
  document: {
    code: string;
    name: string;
  };
  number: string;
  reference_code: string;
  operation_type: {
    code: string;
    name: string;
  };
  order_reference: string | null;
  status: number;
  send_email: number;
  qr: string;
  cufe: string;
  validated: string;
  gross_value: string;
  taxable_amount: string;
  tax_amount: string;
  discount_amount: string;
  surcharge_amount: string;
  total: string;
  observation: string | null;
  errors: Record<string, string> | null;
  created_at: string;
  payment_due_date: string | null;
  qr_image: string;
  has_claim: number;
  is_negotiable_instrument: number;
  payment_form: {
    code: string;
    name: string;
  };
  payment_method: {
    code: string;
    name: string;
  };
  public_url: string;
}

export interface FactusResponse {
  status: string;
  message: string;
  data: {
    company: FactusCompany;
    establishment?: {
      name: string;
      address: string;
      phone_number: string;
      email: string;
      municipality: FactusMunicipality;
    };
    customer: FactusCustomer;
    numbering_range: FactusNumberingRange;
    billing_period: any[];
    bill: FactusBill;
    related_documents: any[];
    items: FactusItem[];
    allowance_charges: FactusAllowanceCharge[];
    withholding_taxes: any[];
    credit_notes: any[];
    debit_notes: any[];
  };
  errors: any;
}

export interface VentaData {
  id: string;
  uuid: string;
  nombreCliente: string;
  numeroDocumentoCliente: string;
  totalFactura: number;
  items: Array<{
    codigoProducto: string;
    nombre: string;
    cantidad: number;
    precioTotal: number;
    porcentajeIva: number;
  }>;
  estado: string;
  referencia?: string;
  nota?: string;
  createdAt: string;
}
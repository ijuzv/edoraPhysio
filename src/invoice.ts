export const invoicePaymentStatuses = [
  'PAYMENT_DUE',
  'PARTIALLY_PAID',
  'PAID',
] as const;

export type InvoicePaymentStatus = (typeof invoicePaymentStatuses)[number];

export const invoicePaymentStatusLabels: Record<InvoicePaymentStatus, string> = {
  PAYMENT_DUE: 'Payment due',
  PARTIALLY_PAID: 'Partially paid',
  PAID: 'Paid',
};

export const invoicePaymentStatusPrint: Record<InvoicePaymentStatus, string> = {
  PAYMENT_DUE: 'PAYMENT DUE',
  PARTIALLY_PAID: 'PARTIALLY PAID',
  PAID: 'PAID',
};

export interface InvoiceLineItem {
  description: string;
  service_date: string;
  qty: number;
  rate: number;
}

export interface InvoiceTotals {
  total: number;
  paid: number;
  balance: number;
  status: InvoicePaymentStatus;
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function lineAmount(item: Pick<InvoiceLineItem, 'qty' | 'rate'>): number {
  return roundMoney(Number(item.qty || 0) * Number(item.rate || 0));
}

export function invoiceTotals(
  items: Array<Pick<InvoiceLineItem, 'qty' | 'rate'>>,
  amountPaid: number,
): InvoiceTotals {
  const total = roundMoney(
    items.reduce((sum, item) => sum + lineAmount(item), 0),
  );
  const paid = roundMoney(Math.max(0, Number(amountPaid || 0)));
  const balance = roundMoney(Math.max(0, total - paid));
  let status: InvoicePaymentStatus = 'PAYMENT_DUE';
  if (total > 0 && balance <= 0) {
    status = 'PAID';
  } else if (paid > 0 && balance > 0) {
    status = 'PARTIALLY_PAID';
  }
  return { total, paid, balance, status };
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundMoney(value));
}

export function isInvoicePaymentStatus(
  value: string,
): value is InvoicePaymentStatus {
  return invoicePaymentStatuses.includes(value as InvoicePaymentStatus);
}

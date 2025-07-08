import { InvoiceStatuses } from '@/data/invoices';

export const isInvoiceOverdue = (invoice) => {
  if (!invoice || invoice.status !== InvoiceStatuses.PENDING) {
    return false;
  }
  return new Date(invoice.dueDate) < new Date();
};

export const getInvoiceDisplayStatus = (invoice) => {
  if (!invoice) return InvoiceStatuses.PENDING;
  
  if (invoice.status === InvoiceStatuses.PENDING && isInvoiceOverdue(invoice)) {
    return 'overdue';
  }
  
  return invoice.status;
};

export const calculateInvoiceSubtotal = (invoice) => {
  if (!invoice) return 0;
  
  // If we have a tax amount, subtract it from total to get subtotal
  if (invoice.taxAmount) {
    return invoice.totalAmount - invoice.taxAmount;
  }
  
  // Otherwise, assume total is the subtotal (no tax)
  return invoice.totalAmount;
};

export const getDaysUntilDue = (invoice) => {
  if (!invoice) return 0;
  
  const dueDate = new Date(invoice.dueDate);
  const today = new Date();
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const getDaysOverdue = (invoice) => {
  if (!invoice || !isInvoiceOverdue(invoice)) return 0;
  
  const dueDate = new Date(invoice.dueDate);
  const today = new Date();
  const diffTime = today - dueDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
export function getStatusSortOrder() {
  return {
    [InvoiceStatuses.PAID]: 1,
    [InvoiceStatuses.PENDING]: 2,
    [InvoiceStatuses.OVERDUE]: 3,
    [InvoiceStatuses.CANCELLED]: 4,
  };
}
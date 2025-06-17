export const Invoices = [
  {
    id: 1,
    invoiceNumber: "INV-2023-001",
    unitId: 3,
    buyerId: 3,
    projectId: 1,
    issueDate: new Date("2023-12-15"),
    dueDate: new Date("2024-01-15"),
    paidDate: new Date("2023-12-20"),
    status: "paid", // pending, paid, overdue, cancelled
    subtotal: 850000,
    taxAmount: 68000, // 8% tax
    totalAmount: 918000,
    description: "Purchase of Unit 201, Skyline Tower",
    paymentTerms: "Net 30",
    notes: "Full payment received",
    createdAt: new Date("2023-12-15"),
    updatedAt: new Date("2023-12-20"),
  },
  {
    id: 2,
    invoiceNumber: "INV-2024-001",
    unitId: 2,
    buyerId: 2,
    projectId: 1,
    issueDate: new Date("2024-01-10"),
    dueDate: new Date("2024-02-10"),
    paidDate: null,
    status: "pending",
    subtotal: 650000,
    taxAmount: 52000,
    totalAmount: 702000,
    description: "Reservation deposit for Unit 102, Skyline Tower",
    paymentTerms: "Net 30",
    notes: "Reservation invoice - 10% deposit required",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
];

export const InvoiceStatuses = {
  PENDING: "pending",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELLED: "cancelled"
};

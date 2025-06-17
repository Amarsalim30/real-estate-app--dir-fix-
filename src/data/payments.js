export const Payments = [
  {
    id: 1,
    invoiceId: 1,
    unitId: 3,
    buyerId: 3,
    amount: 918000,
    paymentDate: new Date("2023-12-20"),
    paymentMethod: "wire_transfer",
    transactionId: "TXN-2023-12-20-001",
    status: "completed",
    notes: "Full payment for Unit 201",
    createdAt: new Date("2023-12-20"),
    updatedAt: new Date("2023-12-20"),
  },
  {
    id: 2,
    invoiceId: 2,
    unitId: 2,
    buyerId: 2,
    amount: 70200, // 10% deposit
    paymentDate: new Date("2024-01-12"),
    paymentMethod: "check",
    transactionId: "CHK-2024-001",
    status: "completed",
    notes: "Reservation deposit - 10%",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
];

export const PaymentMethods = {
  CASH: "cash",
  CHECK: "check",
  CREDIT_CARD: "credit_card",
  WIRE_TRANSFER: "wire_transfer",
  ACH: "ach",
  FINANCING: "financing"
};

export const PaymentStatuses = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded"
};

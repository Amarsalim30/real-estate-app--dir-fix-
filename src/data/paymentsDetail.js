export const PaymentDetails = [
  {
    id: 1,
    paymentNumber: "PAY-2023-001",
    buyerId: 3,
    invoiceId: 1,
    amount: 918000,
    processingFee: 2754, // 0.3% processing fee
    paymentMethod: "bank_transfer",
    paymentDate: new Date("2023-12-20T14:30:00"),
    status: "completed", // pending, processing, completed, failed, cancelled
    transactionId: "TXN-BT-20231220-001",
    description: "Full payment for Unit 201, Skyline Tower",
    notes: "Wire transfer completed successfully",
    bankDetails: {
      bankName: "Chase Bank",
      accountLast4: "4567",
      routingNumber: "021000021"
    },
    createdAt: new Date("2023-12-20T14:25:00"),
    updatedAt: new Date("2023-12-20T14:35:00"),
  },
  {
    id: 2,
    paymentNumber: "PAY-2024-001",
    buyerId: 2,
    invoiceId: 2,
    amount: 70200, // 10% deposit
    processingFee: 211,
    paymentMethod: "credit_card",
    paymentDate: new Date("2024-01-10T10:15:00"),
    status: "completed",
    transactionId: "TXN-CC-20240110-001",
    description: "Reservation deposit for Unit 102, Skyline Tower",
    notes: "Credit card payment processed",
    cardDetails: {
      lastFour: "4242",
      brand: "Visa",
      expiryMonth: "12",
      expiryYear: "2025"
    },
    createdAt: new Date("2024-01-10T10:10:00"),
    updatedAt: new Date("2024-01-10T10:20:00"),
  },
  {
    id: 3,
    paymentNumber: "PAY-2024-002",
    buyerId: 1,
    invoiceId: null,
    amount: 50000,
    processingFee: 0,
    paymentMethod: "cash",
    paymentDate: new Date("2024-01-15T16:45:00"),
    status: "completed",
    transactionId: null,
    description: "Earnest money deposit",
    notes: "Cash payment received at office",
    createdAt: new Date("2024-01-15T16:40:00"),
    updatedAt: new Date("2024-01-15T16:50:00"),
  },
  {
    id: 4,
    paymentNumber: "PAY-2024-003",
    buyerId: 1,
    invoiceId: null,
    amount: 25000,
    processingFee: 75,
    paymentMethod: "check",
    paymentDate: new Date("2024-01-20T11:30:00"),
    status: "pending",
    transactionId: "CHK-20240120-001",
    description: "Additional deposit payment",
    notes: "Check deposited, awaiting clearance",
    checkDetails: {
      checkNumber: "1234",
      bankName: "Bank of America",
      accountNumber: "****5678"
    },
    createdAt: new Date("2024-01-20T11:25:00"),
    updatedAt: new Date("2024-01-20T11:35:00"),
  },
  {
    id: 5,
    paymentNumber: "PAY-2024-004",
    buyerId: 2,
    invoiceId: null,
    amount: 15000,
    processingFee: 45,
    paymentMethod: "credit_card",
    paymentDate: new Date("2024-01-22T09:20:00"),
    status: "failed",
    transactionId: "TXN-CC-20240122-001",
    description: "Monthly installment payment",
    notes: "Payment failed due to insufficient funds",
    failureReason: "Insufficient funds",
    cardDetails: {
      lastFour: "1234",
      brand: "Mastercard",
      expiryMonth: "08",
      expiryYear: "2024"
    },
    createdAt: new Date("2024-01-22T09:15:00"),
    updatedAt: new Date("2024-01-22T09:25:00"),
  },
  {
    id: 6,
    paymentNumber: "PAY-2024-005",
    buyerId: 3,
    invoiceId: null,
    amount: 5000,
    processingFee: 0,
    paymentMethod: "cash",
    paymentDate: new Date("2024-01-25T14:10:00"),
    status: "completed",
    transactionId: null,
    description: "Property management fee",
    notes: "Annual property management fee",
    refundDate: new Date("2024-01-26T10:00:00"),
    refundAmount: 5000,
    refundReason: "Fee waived for first year",
    createdAt: new Date("2024-01-25T14:05:00"),
    updatedAt: new Date("2024-01-26T10:05:00"),
  },
  {
    id: 7,
    paymentNumber: "PAY-2024-006",
    buyerId: 1,
    invoiceId: null,
    amount: 100000,
    processingFee: 300,
    paymentMethod: "bank_transfer",
    paymentDate: new Date("2024-01-28T13:45:00"),
    status: "processing",
    transactionId: "TXN-BT-20240128-001",
    description: "Down payment for unit reservation",
    notes: "Wire transfer initiated, awaiting confirmation",
    bankDetails: {
      bankName: "Wells Fargo",
      accountLast4: "9876",
      routingNumber: "121000248"
    },
    createdAt: new Date("2024-01-28T13:40:00"),
    updatedAt: new Date("2024-01-28T13:50:00"),
  },
  {
    id: 8,
    paymentNumber: "PAY-2024-007",
    buyerId: 2,
    invoiceId: null,
    amount: 7500,
    processingFee: 22.5,
    paymentMethod: "credit_card",
    paymentDate: new Date("2024-01-30T15:20:00"),
    status: "cancelled",
    transactionId: "TXN-CC-20240130-001",
    description: "Booking fee payment",
    notes: "Payment cancelled by customer request",
    cardDetails: {
      lastFour: "5555",
      brand: "American Express",
      expiryMonth: "03",
      expiryYear: "2026"
    },
    createdAt: new Date("2024-01-30T15:15:00"),
    updatedAt: new Date("2024-01-30T15:25:00"),
  }
];

export const PaymentStatuses = {
  PENDING: "pending",
  PROCESSING: "processing", 
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled"
};

export const PaymentMethods = {
  CREDIT_CARD: "credit_card",
  BANK_TRANSFER: "bank_transfer",
  CASH: "cash",
  CHECK: "check"
};

// Helper functions
export const getPaymentsByBuyer = (buyerId) => {
  return Payments.filter(payment => payment.buyerId === buyerId);
};

export const getPaymentsByStatus = (status) => {
  return Payments.filter(payment => payment.status === status);
};

export const getPaymentsByDateRange = (startDate, endDate) => {
  return Payments.filter(payment => {
    const paymentDate = new Date(payment.paymentDate);
    return paymentDate >= startDate && paymentDate <= endDate;
  });
};

export const getTotalPaymentAmount = (payments = Payments) => {
  return payments.reduce((total, payment) => {
    return payment.status === 'completed' ? total + payment.amount : total;
  }, 0);
};

export const getPaymentStats = () => {
  const total = Payments.length;
  const completed = Payments.filter(p => p.status === 'completed').length;
  const pending = Payments.filter(p => p.status === 'pending').length;
  const failed = Payments.filter(p => p.status === 'failed').length;
  const processing = Payments.filter(p => p.status === 'processing').length;
  
  const totalAmount = getTotalPaymentAmount();
  const pendingAmount = getTotalPaymentAmount(Payments.filter(p => p.status === 'pending'));
  
  return {
    total,
    completed,
    pending,
    failed,
    processing,
    totalAmount,
    pendingAmount,
    completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0
  };
};

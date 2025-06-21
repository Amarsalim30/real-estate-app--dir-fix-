export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "manager", 
  CASHIER: "cashier",
  USER: "USER",
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    buyers: ['read', 'write', 'delete'], // Admins can read, write, delete buyers
    invoices: ['read', 'write', 'delete'],
    canViewAllInvoices: true,
    canViewAllPayments: true,
    canEditInvoices: true,
    canDeleteInvoices: true,
    canProcessPayments: true,
    canViewAllBuyers: true,
    canManageUsers: true,
  },
  [ROLES.MANAGER]: {
    canViewAllInvoices: true,
    canViewAllPayments: true,
    canEditInvoices: true,
    canDeleteInvoices: false,
    canProcessPayments: true,
    canViewAllBuyers: true,
    canManageUsers: false,
  },
  [ROLES.CASHIER]: {
    canViewAllInvoices: true,
    canViewAllPayments: true,
    canEditInvoices: false,
    canDeleteInvoices: false,
    canProcessPayments: true,
    canViewAllBuyers: true,
    canManageUsers: false,
  },
  [ROLES.USER]: {
    canViewAllInvoices: false,
    canViewAllPayments: false,
    canEditInvoices: false,
    canDeleteInvoices: false,
    canProcessPayments: false,
    canViewAllBuyers: false,
    canManageUsers: false,
  },
};

export const hasPermission = (userRole, permission) => {
  return ROLE_PERMISSIONS[userRole]?.[permission] || false;
};

export const canAccessResource = (userRole, resourceOwnerId, currentUserId) => {
  // Admin and managers can access all resources
  if (userRole === ROLES.ADMIN || userRole === ROLES.MANAGER) {
    return true;
  }
  
  // Users can only access their own resources
  if (userRole === ROLES.USER) {
    return resourceOwnerId === currentUserId;
  }
  
  // Cashiers can access all customer resources but not admin resources
  if (userRole === ROLES.CASHIER) {
    return true;
  }
  
  return false;
};

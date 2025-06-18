import { Units } from '@/data/units';
import { Projects } from '@/data/projects';
import { Payments } from '@/data/payments';
import { Invoices } from '@/data/invoices';

// Get units by status
export const getUnitsByStatus = (status) => {
  return Units.filter(unit => unit.status === status);
};

// Get units by project
export const getUnitsByProject = (projectId) => {
  return Units.filter(unit => unit.projectId === projectId);
};

// Get units by type
export const getUnitsByType = (type) => {
  return Units.filter(unit => unit.type === type);
};

// Get unit statistics
export const getUnitStats = () => {
  const total = Units.length;
  const available = Units.filter(u => u.status === 'available').length;
  const reserved = Units.filter(u => u.status === 'reserved').length;
  const sold = Units.filter(u => u.status === 'sold').length;
  
  const totalValue = Units.reduce((sum, unit) => sum + unit.price, 0);
  const availableValue = Units
    .filter(u => u.status === 'available')
    .reduce((sum, unit) => sum + unit.price, 0);
  
  const avgPrice = total > 0 ? totalValue / total : 0;
  const avgSqft = total > 0 ? Units.reduce((sum, unit) => sum + unit.sqft, 0) / total : 0;
  const avgPricePerSqft = avgSqft > 0 ? avgPrice / avgSqft : 0;

  return {
    total,
    available,
    reserved,
    sold,
    totalValue,
    availableValue,
    avgPrice,
    avgSqft,
    avgPricePerSqft,
    availabilityRate: total > 0 ? (available / total * 100).toFixed(1) : 0,
    soldRate: total > 0 ? (sold / total * 100).toFixed(1) : 0
  };
};

// Get unit with related data
export const getUnitWithRelatedData = (unitId) => {
  const unit = Units.find(u => u.id === unitId);
  if (!unit) return null;

  const project = Projects.find(p => p.id === unit.projectId);
  const payments = Payments.filter(p => p.unitId === unitId);
  const invoices = Invoices.filter(i => i.unitId === unitId);

  return {
    ...unit,
    project,
    payments,
    invoices,
    totalPayments: payments.reduce((sum, payment) => 
      payment.status === 'completed' ? sum + payment.amount : sum, 0
    ),
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    completedPayments: payments.filter(p => p.status === 'completed').length
  };
};

// Search units
export const searchUnits = (query) => {
  const searchTerm = query.toLowerCase();
  return Units.filter(unit => {
    const project = Projects.find(p => p.id === unit.projectId);
    return (
      unit.unitNumber.toLowerCase().includes(searchTerm) ||
      unit.type.toLowerCase().includes(searchTerm) ||
      unit.description.toLowerCase().includes(searchTerm) ||
      (project && project.name.toLowerCase().includes(searchTerm)) ||
      unit.features.some(feature => feature.toLowerCase().includes(searchTerm))
    );
  });
};

// Get units in price range
export const getUnitsInPriceRange = (minPrice, maxPrice) => {
  return Units.filter(unit => unit.price >= minPrice && unit.price <= maxPrice);
};

// Get units by floor range
export const getUnitsByFloorRange = (minFloor, maxFloor) => {
  return Units.filter(unit => unit.floor >= minFloor && unit.floor <= maxFloor);
};

// Get similar units (same type and similar price)
export const getSimilarUnits = (unitId, priceVariance = 0.2) => {
  const unit = Units.find(u => u.id === unitId);
  if (!unit) return [];

  const minPrice = unit.price * (1 - priceVariance);
  const maxPrice = unit.price * (1 + priceVariance);

  return Units.filter(u => 
    u.id !== unitId &&
    u.type === unit.type &&
    u.price >= minPrice &&
    u.price <= maxPrice
  ).slice(0, 5); // Return max 5 similar units
};

// Format unit display name
export const formatUnitDisplayName = (unit) => {
  const project = Projects.find(p => p.id === unit.projectId);
  return `${project?.name || 'Unknown Project'} - Unit ${unit.unitNumber}`;
};

// Get unit type statistics
export const getUnitTypeStats = () => {
  const typeStats = {};
  
  Units.forEach(unit => {
    if (!typeStats[unit.type]) {
      typeStats[unit.type] = {
        total: 0,
        available: 0,
        reserved: 0,
        sold: 0,
        avgPrice: 0,
        avgSqft: 0,
        totalValue: 0
      };
    }
    
    typeStats[unit.type].total++;
    typeStats[unit.type][unit.status]++;
    typeStats[unit.type].totalValue += unit.price;
  });

  // Calculate averages
  Object.keys(typeStats).forEach(type => {
    const stats = typeStats[type];
    const unitsOfType = Units.filter(u => u.type === type);
    stats.avgPrice = stats.totalValue / stats.total;
    stats.avgSqft = unitsOfType.reduce((sum, unit) => sum + unit.sqft, 0) / stats.total;
    stats.avgPricePerSqft = stats.avgPrice / stats.avgSqft;
  });

  return typeStats;
};

// Validate unit data
export const validateUnitData = (unitData) => {
  const errors = [];

  if (!unitData.unitNumber || unitData.unitNumber.trim() === '') {
    errors.push('Unit number is required');
  }

  if (!unitData.projectId) {
    errors.push('Project is required');
  }

  if (!unitData.type || unitData.type.trim() === '') {
    errors.push('Unit type is required');
  }

  if (!unitData.price || unitData.price <= 0) {
    errors.push('Valid price is required');
  }

  if (!unitData.sqft || unitData.sqft <= 0) {
    errors.push('Valid square footage is required');
  }

  if (!unitData.bedrooms || unitData.bedrooms < 0) {
    errors.push('Valid number of bedrooms is required');
  }

  if (!unitData.bathrooms || unitData.bathrooms <= 0) {
    errors.push('Valid number of bathrooms is required');
  }

  if (!unitData.floor || unitData.floor <= 0) {
    errors.push('Valid floor number is required');
  }

  // Check for duplicate unit number in same project
  const existingUnit = Units.find(u => 
    u.unitNumber === unitData.unitNumber && 
    u.projectId === unitData.projectId &&
    u.id !== unitData.id // Exclude current unit when editing
  );

  if (existingUnit) {
    errors.push('Unit number already exists in this project');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

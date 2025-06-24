export const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return 'KES 0';
  }

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatPriceRange = (min, max) => {
  return `${formatPrice(min)} - ${formatPrice(max)}`;
};

export const formatCompactPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return 'KES 0';
  }

  if (price >= 1000000) {
    return `KES ${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `KES ${(price / 1000).toFixed(0)}K`;
  }

  return formatPrice(price);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-KE').format(num);
};


export const formatPercentage = (value, decimals = 1) => {
  if (!value || value === 0) return '0%';
  
  return `${value.toFixed(decimals)}%`;
};

export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

export const formatDateShort = (date) => {
  return formatDate(date, { month: 'short' });
};

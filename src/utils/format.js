export const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '$0';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatPriceRange = (min, max) => {
  return `${formatPrice(min)} - ${formatPrice(max)}`;
};

export const formatCompactPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '$0';
  }

  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}K`;
  }
  
  return formatPrice(price);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export { formatPrice, formatNumber };

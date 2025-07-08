// Format price with "KES" currency, no decimals
export const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return 'KES 0';

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(price);
};

// Format range between two prices
export const formatPriceRange = (min, max) => {
  return `${formatPrice(min)} - ${formatPrice(max)}`;
};

// Format compact price (e.g., KES 1.2M, 850K)
export const formatCompactPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return 'KES 0';

  if (price >= 1_000_000) return `KES ${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `KES ${(price / 1_000).toFixed(0)}K`;

  return formatPrice(price);
};

// Format number with commas (e.g., 1,234,567)
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-KE').format(num);
};

// Format percentage value with optional decimals
export const formatPercentage = (value, decimals = 1) => {
  if (!value || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
};

// General date formatter (default: full date)
export const formatDate = (date, options = {}) => {
  if (!date) return '';

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

// Short month format (e.g., Jul 6, 2025)
export const formatShortDate = (date) => {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

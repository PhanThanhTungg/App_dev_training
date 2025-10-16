export function formatPrice(priceRange) {
  const { minVariantPrice, maxVariantPrice } = priceRange;
  const minPrice = parseFloat(minVariantPrice.amount);
  const maxPrice = parseFloat(maxVariantPrice.amount);
  const currency = minVariantPrice.currencyCode;
  
  if (minPrice === maxPrice) {
    return `${minPrice.toFixed(2)} ${currency}`;
  }
  return `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} ${currency}`;
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN');
}
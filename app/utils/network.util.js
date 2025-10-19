export function buildProductsQuery(searchValue, filters = {}) {
  const queries = [];
  const { statusFilter = null, taggedWith = null, priceRange = null } = filters;

  // Add text search if provided
  if (searchValue && searchValue.trim()) {
    const escaped = searchValue.trim().replace(/"/g, "\\\"");
    queries.push(`title:*${escaped}*`);
  }

  // Add status filter if provided
  if (statusFilter && statusFilter.length > 0) {
    const statusQueries = statusFilter.map(status => `status:${status.toUpperCase()}`);
    if (statusQueries.length === 1) {
      queries.push(statusQueries[0]);
    } else {
      queries.push(`(${statusQueries.join(' OR ')})`);
    }
  }

  // Add tag filter if provided
  if (taggedWith && taggedWith.trim()) {
    const escapedTag = taggedWith.trim().replace(/"/g, "\\\"");
    queries.push(`tag:${escapedTag}`);
  }

  // Note: Price range filtering is handled client-side since Shopify's 
  // product query doesn't support price range filtering directly
  
  return queries.length > 0 ? queries.join(' AND ') : null;
}


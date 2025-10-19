export function buildProductsQuery(searchValue) {
  if (!searchValue) {
    return null;
  }

  const trimmed = searchValue.trim();
  if (!trimmed) {
    return null;
  }

  const escaped = trimmed.replace(/"/g, "\\\"");
  return `title:*${escaped}*`;
}


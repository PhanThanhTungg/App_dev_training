export const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int) {
    products(first: $first) {
      nodes {
        id
        title
        featuredImage {
          url
          altText
        }
        priceRangeV2 {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        tags
        status
        createdAt
        updatedAt
        handle
        productType
        vendor
      }
    }
  }
`;

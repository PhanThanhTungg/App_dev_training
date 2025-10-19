export const GET_PRODUCTS_QUERY = `
  query GetProducts(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(
      first: $first
      after: $after
      last: $last
      before: $before
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      edges {
        cursor
        node {
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
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_PRODUCTS_COUNT_QUERY = `
  query GetProductsCount($query: String) {
    productsCount(query: $query) {
      count
    }
  }
`;

export const UPDATE_PRODUCT_TAGS_MUTATION = `
  mutation UpdateProductTags($id: ID!, $tags: [String!]!) {
    productUpdate(input: { id: $id, tags: $tags }) {
      product {
        id
        tags
      }
      userErrors {
        field
        message
      }
    }
  }
`;

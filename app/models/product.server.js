import {
  GET_PRODUCTS_QUERY,
  GET_PRODUCTS_COUNT_QUERY,
} from "../graphqlActions/product.grapql";
import { buildProductsQuery } from "../utils/network.util";

export async function getProducts(admin, options = {}) {
  const {
    limit = 10,
    after = null,
    before = null,
    direction = 'forward',
    query = null,
    sort = null,
  } = options;

  try {
    const baseVariables = direction === 'forward'
      ? { first: limit, after }
      : { last: limit, before };

    let sortKey = null;
    let reverse = false;

    if (sort) {
      const [field, direction] = sort[0].split(' ');
      switch (field) {
        case 'title':
          sortKey = 'TITLE';
          reverse = direction === 'desc';
          break;
        case 'price':
          sortKey = null;
          reverse = direction === 'desc';
          break;
        case 'created':
          sortKey = 'CREATED_AT';
          reverse = direction === 'desc';
          break;
        case 'updated':
          sortKey = 'UPDATED_AT';
          reverse = direction === 'desc';
          break;
        default:
          sortKey = 'CREATED_AT';
          reverse = true;
      }
    }

    const variables = {
      ...baseVariables,
      query: buildProductsQuery(query) || undefined,
      sortKey: sortKey || undefined,
      reverse: reverse || undefined,
    };

    const response = await admin.graphql(GET_PRODUCTS_QUERY, {
      variables
    });
    const json = await response.json();
    
    const products = json.data.products;
    return {
      nodes: products.edges.map(edge => edge.node),
      pageInfo: products.pageInfo,
      edges: products.edges
    };
  } catch (error) {
    console.error("error", error);
    throw error;
  }
}

export async function getProductsCount(admin, options = {}) {
  const { query = null } = options;
  try {
    const response = await admin.graphql(GET_PRODUCTS_COUNT_QUERY, {
      variables: {
        query: buildProductsQuery(query) || undefined,
      },
    });
    const json = await response.json();
    return json.data.productsCount.count;
  } catch (error) {
    console.error("error getting products count", error);
    return 0;
  }
}

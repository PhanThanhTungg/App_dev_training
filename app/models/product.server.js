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
    filters = {},
    sort = null,
  } = options;

  try {
    const baseVariables = direction === 'forward'
      ? { first: limit, after }
      : { last: limit, before };

    let sortKey = null;
    let reverse = false;

    if (sort && sort.length > 0) {
      const [field, direction] = sort[0].split(' ');
      switch (field) {
        case 'title':
          sortKey = 'TITLE';
          reverse = direction === 'desc';
          break;
        case 'price':
          sortKey = null; // Price sorting handled client-side
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
    } else {
      // Default sort when no sort is specified
      sortKey = 'CREATED_AT';
      reverse = true; // newest first
    }

    const variables = {
      ...baseVariables,
      query: buildProductsQuery(query, filters) || undefined,
      sortKey: sortKey || undefined,
      reverse: reverse || undefined,
    };

    const response = await admin.graphql(GET_PRODUCTS_QUERY, {
      variables
    });
    const json = await response.json();
    
    // Check for GraphQL errors (like invalid cursor)
    if (json.errors && json.errors.length > 0) {
      const cursorError = json.errors.find(error => 
        error.message.includes('Invalid cursor') || 
        error.message.includes('cursor for current pagination')
      );
      
      if (cursorError) {
        // Retry without cursors if there's a cursor error
        const retryVariables = {
          ...variables,
          after: undefined,
          before: undefined
        };
        
        const retryResponse = await admin.graphql(GET_PRODUCTS_QUERY, {
          variables: retryVariables
        });
        const retryJson = await retryResponse.json();
        
        if (!retryJson.errors) {
          const products = retryJson.data.products;
          return {
            nodes: products.edges.map(edge => edge.node),
            pageInfo: products.pageInfo,
            edges: products.edges
          };
        }
      }
      throw new Error(json.errors[0].message);
    }
    
    const products = json.data.products;
    return {
      nodes: products.edges.map(edge => edge.node),
      pageInfo: products.pageInfo,
      edges: products.edges
    };
  } catch (error) {
    console.error("error fetching products", error);
    throw error;
  }
}

export async function getProductsCount(admin, options = {}) {
  const { query = null, filters = {} } = options;
  try {
    const response = await admin.graphql(GET_PRODUCTS_COUNT_QUERY, {
      variables: {
        query: buildProductsQuery(query, filters) || undefined,
      },
    });
    const json = await response.json();
    return json.data.productsCount.count;
  } catch (error) {
    console.error("error getting products count", error);
    return 0;
  }
}

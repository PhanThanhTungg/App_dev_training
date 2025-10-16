import { GET_PRODUCTS_QUERY, GET_PRODUCTS_COUNT_QUERY } from "../graphqlActions/product.grapql";

export async function getProducts(admin, options = {}) {
  const { 
    limit = 10, 
    after = null, 
    before = null,
    direction = 'forward' 
  } = options;

  try {
    const variables = direction === 'forward' 
      ? { first: limit, after }
      : { last: limit, before };

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

export async function getProductsCount(admin) {
  try {
    const response = await admin.graphql(GET_PRODUCTS_COUNT_QUERY);
    const json = await response.json();
    return json.data.productsCount.count;
  } catch (error) {
    console.error("error getting products count", error);
    return 0;
  }
}

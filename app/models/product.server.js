import { GET_PRODUCTS_QUERY } from "../graphqlActions/product.grapql";
export async function getProducts(admin, limit = 50) {
  try {
    const response = await admin.graphql(GET_PRODUCTS_QUERY, {
      variables: { first: limit }
    });
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
}

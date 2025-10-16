import { useLoaderData } from "react-router";
import { Page } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { getProducts } from "../../models/product.server";
import ProductTable from "../../components/ProductTable";
import EmptyState from "../../components/EmptyState";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  return await getProducts(admin, 50);
}

export default function Products() {
  const { products } = useLoaderData();
  
  return (
    <Page title="Product Management">
      {products && products.nodes.length === 0 ? (
        <EmptyState />
      ) : (
        <ProductTable products={products.nodes} />
      )}
    </Page>
  );
}
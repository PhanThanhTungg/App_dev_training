import { useLoaderData, useSearchParams } from "react-router";
import { Page } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { getProducts, getProductsCount } from "../../models/product.server";
import ProductTable from "../../components/ProductTable";
import EmptyState from "../../components/EmptyState";
import { useCallback } from "react";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const after = url.searchParams.get("after") || null;
  const before = url.searchParams.get("before") || null;
  const direction = before ? "backward" : "forward";
  
  const result = await getProducts(admin, { limit, after, before, direction });
  const totalCount = await getProductsCount(admin);
  
  return { 
    pageInfo: result.pageInfo,
    edges: result.edges,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit)
  }; 
}

export default function Products() {
  const { pageInfo, edges, limit, totalCount, totalPages } = useLoaderData();
  const products = edges.map(edge => edge.node);
  const [, setSearchParams] = useSearchParams();
  
  const handlePrevious = useCallback(() => {
    if (edges.length > 0) {
      setSearchParams({ limit: limit.toString(), before: edges[0].cursor });
    }
  }, [edges, limit, setSearchParams]);
  
  const handleNext = useCallback(() => {
    if (edges.length > 0) {
      setSearchParams({ limit: limit.toString(), after: edges[edges.length - 1].cursor });
    }
  }, [edges, limit, setSearchParams]);
  
  const handleLimitChange = useCallback((value) => {
    setSearchParams({ limit: value });
  }, [setSearchParams]);
  
  return (
    <Page title="Product Management">
      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <ProductTable 
          products={products}
          pageInfo={pageInfo}
          totalPages={totalPages}
          totalCount={totalCount}
          limit={limit.toString()}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onLimitChange={handleLimitChange}
        />
      )}
    </Page>
  );
}
import { useLoaderData, useNavigation, useSearchParams } from "react-router";
import { Page } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { getProducts, getProductsCount } from "../../models/product.server";
import ProductTable from "./ProductTable";
import { useCallback } from "react";
import { UPDATE_PRODUCT_TAGS_MUTATION } from "../../graphqlActions/product.grapql";
import { buildProductsQuery } from "../../utils/network.util";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);

  const limit = parseInt(url.searchParams.get("limit") || "10");
  const after = url.searchParams.get("after") || null;
  const before = url.searchParams.get("before") || null;
  const query = url.searchParams.get("query")?.trim() || null;
  const direction = before ? "backward" : "forward";

  const [result, totalCount] = await Promise.all([
    getProducts(admin, {
      limit,
      after,
      before,
      direction,
      query,
    }),
    getProductsCount(admin, { query }),
  ]);

  return {
    pageInfo: result.pageInfo,
    edges: result.edges,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    query: query || "",
  };
}

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const productId = formData.get("productId");
  const tags = JSON.parse(formData.get("tags"));
  try {
    const response = await admin.graphql(UPDATE_PRODUCT_TAGS_MUTATION, {
      variables: {
        id: productId,
        tags: tags,
      },
    });

    const data = await response.json();

    if (data.data.productUpdate.userErrors.length > 0) {
      return {
        success: false,
        errors: data.data.productUpdate.userErrors,
      };
    }

    return {
      success: true,
      product: data.data.productUpdate.product,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export default function Products() {
  const { pageInfo, edges, limit, totalCount, totalPages, query } =
    useLoaderData();
  const products = edges.map((edge) => edge.node);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const queryFilter = searchParams.get("query") || "";
  const currentQueryParam = buildProductsQuery(queryFilter) ? queryFilter : "";
  const isLoading = navigation.state !== "idle";

  const handlePrevious = useCallback(() => {
    if (edges.length > 0) {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      params.set("before", edges[0].cursor);
      if (currentQueryParam) {
        params.set("query", currentQueryParam);
      }
      setSearchParams(params);
    }
  }, [edges, limit, queryFilter, setSearchParams]);

  const handleNext = useCallback(() => {
    if (edges.length > 0) {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      params.set("after", edges[edges.length - 1].cursor);
      if (currentQueryParam) {
        params.set("query", currentQueryParam);
      }
      setSearchParams(params);
    }
  }, [edges, limit, queryFilter, setSearchParams]);

  const handleLimitChange = useCallback(
    (value) => {
      const params = new URLSearchParams();
      params.set("limit", value);
      if (currentQueryParam) {
        params.set("query", currentQueryParam);
      }
      setSearchParams(params);
    },
    [queryFilter, setSearchParams],
  );

  const handleSearchChange = useCallback(
    (value) => {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      const trimmedValue = value.trim();
      if (trimmedValue && buildProductsQuery(trimmedValue)) {
        params.set("query", trimmedValue);
      }
      setSearchParams(params);
    },
    [limit, setSearchParams],
  );

  return (
    <>
      <Page title="Product Management">
        <ProductTable
          products={products}
          pageInfo={pageInfo}
          totalPages={totalPages}
          totalCount={totalCount}
          limit={limit.toString()}
          initialQuery={query}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onLimitChange={handleLimitChange}
          onSearchChange={handleSearchChange}
          isLoading={isLoading}
        />
      </Page>
    </>
  );
}

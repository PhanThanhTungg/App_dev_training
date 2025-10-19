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
  const sort = url.searchParams.get("sort") || null;
  const direction = before ? "backward" : "forward";

  const [result, totalCount] = await Promise.all([
    getProducts(admin, {
      limit,
      after,
      before,
      direction,
      query,
      sort: sort ? [sort] : null,
    }),
    getProductsCount(admin, { query }),
  ]);

  let edges = result.edges;
  const currentSort = sort || "created desc";

  if (currentSort.includes("price")) {
    const [, direction] = currentSort.split(' ');
    const isDesc = direction === 'desc';

    edges = [...result.edges].sort((a, b) => {
      const priceA = parseFloat(a.node.priceRangeV2?.minVariantPrice?.amount || 0);
      const priceB = parseFloat(b.node.priceRangeV2?.minVariantPrice?.amount || 0);

      return isDesc ? priceB - priceA : priceA - priceB;
    });
  }

  return {
    pageInfo: result.pageInfo,
    edges,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    query: query || "",
    sort: currentSort,
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
  const { pageInfo, edges, limit, totalCount, totalPages, query, sort } =
    useLoaderData();
  const products = edges.map((edge) => edge.node);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const queryFilter = searchParams.get("query") || "";
  const currentQueryParam = buildProductsQuery(queryFilter) ? queryFilter : "";
  const currentSort = searchParams.get("sort") || sort;
  const isLoading = navigation.state !== "idle";

  const handlePrevious = useCallback(() => {
    if (edges.length > 0) {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      params.set("before", edges[0].cursor);
      if (currentQueryParam) {
        params.set("query", currentQueryParam);
      }
      const currentSort = searchParams.get("sort") || "created desc";
      params.set("sort", currentSort);
      setSearchParams(params);
    }
  }, [edges, limit, queryFilter, setSearchParams, searchParams]);

  const handleNext = useCallback(() => {
    if (edges.length > 0) {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      params.set("after", edges[edges.length - 1].cursor);
      if (currentQueryParam) {
        params.set("query", currentQueryParam);
      }
      const currentSort = searchParams.get("sort") || "created desc";
      params.set("sort", currentSort);
      setSearchParams(params);
    }
  }, [edges, limit, queryFilter, setSearchParams, searchParams]);

  const handleLimitChange = useCallback(
    (value) => {
      const params = new URLSearchParams();
      params.set("limit", value);
      if (currentQueryParam) {
        params.set("query", currentQueryParam);
      }
      const currentSort = searchParams.get("sort") || "created desc";
      params.set("sort", currentSort);
      setSearchParams(params);
    },
    [queryFilter, setSearchParams, searchParams],
  );

  const handleSearchChange = useCallback(
    (value) => {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      const trimmedValue = value.trim();
      if (trimmedValue && buildProductsQuery(trimmedValue)) {
        params.set("query", trimmedValue);
      }
      const currentSort = searchParams.get("sort") || "created desc";
      params.set("sort", currentSort);
      setSearchParams(params);
    },
    [limit, setSearchParams, searchParams],
  );

  const handleSortChange = useCallback(
    (value) => {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      if (currentQueryParam) {
        params.set("query", currentQueryParam);
      }
      params.set("sort", value[0]);
      setSearchParams(params);
    },
    [limit, currentQueryParam, setSearchParams],
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
          initialSort={currentSort}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onLimitChange={handleLimitChange}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          isLoading={isLoading}
        />
      </Page>
    </>
  );
}

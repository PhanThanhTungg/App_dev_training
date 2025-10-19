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
  let after = url.searchParams.get("after") || null;
  let before = url.searchParams.get("before") || null;
  const query = url.searchParams.get("query")?.trim() || null;
  const status = url.searchParams.get("status") || null;
  const taggedWith = url.searchParams.get("taggedWith")?.trim() || null;
  const priceMin = url.searchParams.get("priceMin");
  const priceMax = url.searchParams.get("priceMax");
  const tab = parseInt(url.searchParams.get("tab") || "0");
  const sort = url.searchParams.get("sort") || "created desc";
  const direction = before ? "backward" : "forward";


  const originalSort = url.searchParams.get("sort");
  if ((after || before) && !originalSort) {
    after = null;
    before = null;
  }

  // Parse filters from URL
  const statusFilter = status ? status.split(',') : null;
  const priceRange = (priceMin && priceMax) ? [parseInt(priceMin), parseInt(priceMax)] : null;
  
  const filters = {
    statusFilter,
    taggedWith,
    priceRange
  };

  const [result, totalCount] = await Promise.all([
    getProducts(admin, {
      limit,
      after,
      before,
      direction,
      query,
      filters,
      sort: [sort], 
    }),
    getProductsCount(admin, { query, filters }),
  ]);

  let edges = result.edges;
  const currentSort = sort; 

  // Apply client-side price range filtering
  if (priceRange && priceRange.length === 2) {
    const [minPrice, maxPrice] = priceRange;
    edges = edges.filter(edge => {
      const price = parseFloat(edge.node.priceRangeV2?.minVariantPrice?.amount || 0);
      return price >= minPrice && price <= maxPrice;
    });
  }

  // Apply client-side price sorting
  if (currentSort.includes("price")) {
    const [, direction] = currentSort.split(' ');
    const isDesc = direction === 'desc';

    edges = [...edges].sort((a, b) => {
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
    status: status || "",
    taggedWith: taggedWith || "",
    priceRange,
    tab,
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
  const { pageInfo, edges, limit, totalCount, totalPages, query, status, taggedWith, priceRange, tab, sort } =
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
      const currentStatus = searchParams.get("status");
      if (currentStatus) {
        params.set("status", currentStatus);
      }
      const currentTab = searchParams.get("tab") || "0";
      params.set("tab", currentTab);
      setSearchParams(params);
    }
  }, [edges, limit, currentQueryParam, setSearchParams, searchParams]);

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
      const currentStatus = searchParams.get("status");
      if (currentStatus) {
        params.set("status", currentStatus);
      }
      const currentTab = searchParams.get("tab") || "0";
      params.set("tab", currentTab);
      setSearchParams(params);
    }
  }, [edges, limit, currentQueryParam, setSearchParams, searchParams]);

  const handleLimitChange = useCallback(
    (value) => {
      const params = new URLSearchParams();
      params.set("limit", value);
      if (currentQueryParam) {
        params.set("query", currentQueryParam);
      }
      const currentSort = searchParams.get("sort") || "created desc";
      params.set("sort", currentSort);
      const currentStatus = searchParams.get("status");
      if (currentStatus) {
        params.set("status", currentStatus);
      }
      const currentTab = searchParams.get("tab") || "0";
      params.set("tab", currentTab);
      setSearchParams(params);
    },
    [currentQueryParam, setSearchParams, searchParams],
  );

  const handleSearchChange = useCallback(
    (value) => {
      const trimmedValue = value.trim();
      const newQuery = trimmedValue || "";
      
      // Only update if search query actually changed
      if (newQuery !== currentQueryParam) {
        const params = new URLSearchParams();
        params.set("limit", limit.toString());
        if (newQuery) {
          params.set("query", newQuery);
        }
        const currentSort = searchParams.get("sort") || "created desc";
        params.set("sort", currentSort);
        const currentStatus = searchParams.get("status");
        if (currentStatus) {
          params.set("status", currentStatus);
        }
        const currentTab = searchParams.get("tab") || "0";
        params.set("tab", currentTab);
        setSearchParams(params);
      }
    },
    [limit, currentQueryParam, setSearchParams, searchParams],
  );

  const handleSortChange = useCallback(
    (value) => {
      const newSort = value[0];
      const currentSort = searchParams.get("sort") || "created desc";
      
      // Only update if sort actually changed
      if (newSort !== currentSort) {
        const params = new URLSearchParams();
        params.set("limit", limit.toString());
        if (currentQueryParam) {
          params.set("query", currentQueryParam);
        }
        const currentStatus = searchParams.get("status");
        if (currentStatus) {
          params.set("status", currentStatus);
        }
        const currentTab = searchParams.get("tab") || "0";
        params.set("tab", currentTab);
        params.set("sort", newSort);
        setSearchParams(params);
      }
    },
    [limit, currentQueryParam, setSearchParams, searchParams],
  );

  const handleTabChange = useCallback(
    (tabIndex, statusFilter) => {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      if (currentQueryParam) {
        params.set("query", currentQueryParam);
      }
      const currentSort = searchParams.get("sort") || "created desc";
      params.set("sort", currentSort);
      params.set("tab", tabIndex.toString());
      
      if (statusFilter && statusFilter.length > 0) {
        params.set("status", statusFilter.join(','));
      }
      
      setSearchParams(params);
    },
    [limit, currentQueryParam, setSearchParams, searchParams],
  );

  const handleFiltersChange = useCallback(
    (filters) => {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      
      // Preserve current query
      if (currentQueryParam) {
        params.set("query", currentQueryParam);
      }
      
      // Preserve current sort
      const currentSort = searchParams.get("sort") || "created desc";
      params.set("sort", currentSort);
      
      // Preserve current tab
      const currentTab = searchParams.get("tab") || "0";
      params.set("tab", currentTab);
      
      // Set filters
      if (filters.productStatus && filters.productStatus.length > 0) {
        params.set("status", filters.productStatus.join(','));
      }
      
      if (filters.taggedWith && filters.taggedWith.trim()) {
        params.set("taggedWith", filters.taggedWith.trim());
      }
      
      if (filters.priceRange && filters.priceRange.length === 2) {
        params.set("priceMin", filters.priceRange[0].toString());
        params.set("priceMax", filters.priceRange[1].toString());
      }
      
      setSearchParams(params);
    },
    [limit, currentQueryParam, setSearchParams, searchParams],
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
          initialTab={tab}
          initialTaggedWith={taggedWith}
          initialPriceRange={priceRange}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onLimitChange={handleLimitChange}
          onSearchChange={handleSearchChange}
          onFiltersChange={handleFiltersChange}
          onSortChange={handleSortChange}
          onTabChange={handleTabChange}
          isLoading={isLoading}
        />
      </Page>
    </>
  );
}

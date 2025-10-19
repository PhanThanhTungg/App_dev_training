import { useLoaderData, useNavigation, useSearchParams, useSubmit, useActionData } from "react-router";
import { Page, Toast, Frame } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { getProducts, getProductsCount } from "../../models/product.server";
import ProductTable from "./ProductTable";
import { useCallback, useState, useEffect } from "react";
import { 
  UPDATE_PRODUCT_TAGS_MUTATION, 
  DELETE_PRODUCT_MUTATION,
  UPDATE_PRODUCT_STATUS_MUTATION,
  UPDATE_PRODUCT_MUTATION
} from "../../graphqlActions/product.grapql";
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
  
  const actionType = formData.get("actionType");

  // Bulk Delete
  if (actionType === "bulkDelete") {
    const productIds = JSON.parse(formData.get("productIds"));
    
    try {
      const results = [];
      const errors = [];
      
      for (const productId of productIds) {
        const response = await admin.graphql(DELETE_PRODUCT_MUTATION, {
          variables: {
            input: {
              id: productId,
            },
          },
        });

        const data = await response.json();
        
        if (data.data.productDelete.userErrors.length > 0) {
          errors.push(...data.data.productDelete.userErrors);
        } else {
          results.push(data.data.productDelete.deletedProductId);
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          errors: errors,
          partialSuccess: results.length > 0,
          deletedCount: results.length,
        };
      }

      return {
        success: true,
        deletedCount: results.length,
        deletedProductIds: results,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Bulk Add Tags
  if (actionType === "bulkAddTags") {
    const productIds = JSON.parse(formData.get("productIds"));
    const newTags = JSON.parse(formData.get("newTags"));
    
    try {
      const results = [];
      for (const productId of productIds) {
        // Get current product to merge tags
        const currentProduct = await admin.graphql(`
          query GetProduct($id: ID!) {
            product(id: $id) {
              id
              tags
            }
          }
        `, { variables: { id: productId } });
        
        const currentData = await currentProduct.json();
        const existingTags = currentData.data.product.tags || [];
        const mergedTags = [...new Set([...existingTags, ...newTags])];
        
        const response = await admin.graphql(UPDATE_PRODUCT_TAGS_MUTATION, {
          variables: {
            id: productId,
            tags: mergedTags,
          },
        });
        
        const data = await response.json();
        results.push(data);
      }

      return {
        success: true,
        results,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Bulk Update Status
  if (actionType === "bulkUpdateStatus") {
    const productIds = JSON.parse(formData.get("productIds"));
    const newStatus = formData.get("newStatus");
    
    try {
      const results = [];
      for (const productId of productIds) {
        const response = await admin.graphql(UPDATE_PRODUCT_STATUS_MUTATION, {
          variables: {
            id: productId,
            status: newStatus,
          },
        });
        
        const data = await response.json();
        results.push(data);
      }

      return {
        success: true,
        results,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Single Delete
  if (actionType === "delete") {
    const productId = formData.get("productId");
    
    try {
      const response = await admin.graphql(DELETE_PRODUCT_MUTATION, {
        variables: {
          input: {
            id: productId,
          },
        },
      });

      const data = await response.json();

      if (data.data.productDelete.userErrors.length > 0) {
        return {
          success: false,
          errors: data.data.productDelete.userErrors,
        };
      }

      return {
        success: true,
        deletedProductId: data.data.productDelete.deletedProductId,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Default to update product action
  const productId = formData.get("productId");
  const tags = JSON.parse(formData.get("tags"));
  const title = formData.get("title");
  const status = formData.get("status");
  const description = formData.get("description");
  const category = formData.get("category");
  
  try {
    if (title || status || description || category) {
      const updateInput = {
        id: productId,
      };
      
      if (title) updateInput.title = title;
      if (status) updateInput.status = status;
      if (description) updateInput.descriptionHtml = description;
      if (tags) updateInput.tags = tags;

      if (category) {
        const allTags = tags || [];
        const categoryTag = `category:${category}`;
        if (!allTags.includes(categoryTag)) {
          allTags.push(categoryTag);
        }
        updateInput.tags = allTags;
      }

      const response = await admin.graphql(UPDATE_PRODUCT_MUTATION, {
        variables: {
          input: updateInput,
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
    } else {
      // Fallback to just updating tags
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
    }
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
  const submit = useSubmit();
  const actionData = useActionData();
  const queryFilter = searchParams.get("query") || "";
  const currentQueryParam = buildProductsQuery(queryFilter) ? queryFilter : "";
  const currentSort = searchParams.get("sort") || sort;
  const isLoading = navigation.state !== "idle";

  // Toast state
  const [toastContent, setToastContent] = useState(null);
  const [toastError, setToastError] = useState(false);

  // Handle action results
  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        if (actionData.deletedCount !== undefined) {
          setToastContent(`Successfully deleted ${actionData.deletedCount} product${actionData.deletedCount > 1 ? 's' : ''}`);
          setToastError(false);
        } else if (actionData.results) {
          setToastContent(`Bulk operation completed successfully`);
          setToastError(false);
        } else {
          setToastContent(`Operation completed successfully`);
          setToastError(false);
        }
      } else {
        let errorMessage = "Operation failed";
        if (actionData.partialSuccess) {
          errorMessage = `Partial success: ${actionData.deletedCount} products deleted, but some failed`;
        } else if (actionData.error) {
          errorMessage = actionData.error;
        } else if (actionData.errors && actionData.errors.length > 0) {
          errorMessage = actionData.errors[0].message;
        }
        setToastContent(errorMessage);
        setToastError(true);
      }
    }
  }, [actionData]);

  // Handle action response
  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        if (actionData.deletedProductId) {
          setToastContent("Product deleted successfully");
          setToastError(false);
        } else if (actionData.product) {
          setToastContent("Product updated successfully");
          setToastError(false);
        }
      } else {
        setToastContent(actionData.error || "An error occurred");
        setToastError(true);
      }
    }
  }, [actionData]);

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

  const handleDelete = useCallback(
    async (productId) => {
      const formData = new FormData();
      formData.append("actionType", "delete");
      formData.append("productId", productId);
      
      submit(formData, { 
        method: "POST",
      });
    },
    [submit],
  );

  const handleBulkDelete = useCallback(
    async (productIds) => {
      const formData = new FormData();
      formData.append("actionType", "bulkDelete");
      formData.append("productIds", JSON.stringify(productIds));
      
      submit(formData, { 
        method: "POST",
      });
    },
    [submit],
  );

  const handleBulkAddTags = useCallback(
    async (selectedProducts, newTags) => {
      const formData = new FormData();
      formData.append("actionType", "bulkAddTags");
      formData.append("productIds", JSON.stringify(selectedProducts.map(p => p.id)));
      formData.append("newTags", JSON.stringify(newTags));
      
      submit(formData, { 
        method: "POST",
      });
    },
    [submit],
  );

  const handleBulkUpdateStatus = useCallback(
    async (productIds, newStatus) => {
      const formData = new FormData();
      formData.append("actionType", "bulkUpdateStatus");
      formData.append("productIds", JSON.stringify(productIds));
      formData.append("newStatus", newStatus);
      
      submit(formData, { 
        method: "POST",
      });
    },
    [submit],
  );

  return (
    <>
      <Frame>
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
            onDelete={handleDelete}
            onBulkDelete={handleBulkDelete}
            onBulkAddTags={handleBulkAddTags}
            onBulkUpdateStatus={handleBulkUpdateStatus}
            isLoading={isLoading}
          />
        </Page>
        
        {toastContent && (
          <Toast
            content={toastContent}
            error={toastError}
            onDismiss={() => setToastContent(null)}
          />
        )}
      </Frame>
    </>
  );
}

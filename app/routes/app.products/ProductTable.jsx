import {
  Card,
  IndexTable,
  useIndexResourceState,
  useBreakpoints,
  Spinner,
} from "@shopify/polaris";
import { useState } from "react";
import EditProduct from "./EditProduct";
import {
  ProductFilters,
  ProductTableRow,
  ProductPagination,
  TABLE_HEADINGS,
  RESOURCE_NAME,
  CARD_LOADING_OVERLAY_STYLES,
} from "../../components/products";


const ProductTable = ({
  products,
  pageInfo,
  totalPages,
  totalCount,
  limit,
  initialQuery = "",
  onPrevious,
  onNext,
  onLimitChange,
  onSearchChange,
  onFiltersChange,
  onSortChange,
  isLoading = false,
}) => {
  const [editModalState, setEditModalState] = useState(false);
  const [selectedProductEdit, setSelectedProductEdit] = useState(null);
  
  const handleEdit = (product) => {
    setSelectedProductEdit(product);
    setEditModalState(true);
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(products);

  const rowMarkup = products.map((product, index) => (
    <ProductTableRow
      key={product.id}
      product={product}
      index={index}
      isSelected={selectedResources.includes(product.id)}
      onEdit={handleEdit}
    />
  ));

  return (
    <>
      {editModalState && (
        <EditProduct
          editModalState={editModalState}
          setEditModalState={setEditModalState}
          selectedProductEdit={selectedProductEdit}
        />
      )}
      <div style={{ position: "relative" }}>
        {isLoading && (
          <div style={CARD_LOADING_OVERLAY_STYLES}>
            <Spinner accessibilityLabel="Loading products" size="large" />
          </div>
        )}
        <Card padding="0">
          <ProductFilters
            initialQuery={initialQuery}
            onSearchChange={onSearchChange}
            onFiltersChange={onFiltersChange}
            onSortChange={onSortChange}
            onViewChange={() => {}}
            onCreateNewView={() => {}}
            onSaveView={() => {}}
            onCancelView={() => {}}
          />
          <IndexTable
            condensed={useBreakpoints().smDown}
            resourceName={RESOURCE_NAME}
            itemCount={products.length}
            selectedItemsCount={
              allResourcesSelected ? "All" : selectedResources.length
            }
            onSelectionChange={handleSelectionChange}
            headings={TABLE_HEADINGS}
          >
            {rowMarkup}
          </IndexTable>
          <ProductPagination
            pageInfo={pageInfo}
            totalPages={totalPages}
            totalCount={totalCount}
            limit={limit}
            onPrevious={onPrevious}
            onNext={onNext}
            onLimitChange={onLimitChange}
          />
        </Card>
      </div>
    </>
  );
};

export default ProductTable;

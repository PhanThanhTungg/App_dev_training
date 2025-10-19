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
  DeleteConfirmModal,
  BulkActions,
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
  initialSort = "created desc",
  initialTab = 0,
  initialTaggedWith = "",
  initialPriceRange = null,
  onPrevious,
  onNext,
  onLimitChange,
  onSearchChange,
  onFiltersChange,
  onSortChange,
  onTabChange,
  onDelete,
  onBulkDelete,
  onBulkAddTags,
  onBulkUpdateStatus,
  isLoading = false,
}) => {
  const [editModalState, setEditModalState] = useState(false);
  const [selectedProductEdit, setSelectedProductEdit] = useState(null);
  const [deleteModalState, setDeleteModalState] = useState(false);
  const [selectedProductDelete, setSelectedProductDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleEdit = (product) => {
    setSelectedProductEdit(product);
    setEditModalState(true);
  };

  const handleDelete = (product) => {
    setSelectedProductDelete(product);
    setDeleteModalState(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProductDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(selectedProductDelete.id);
      setDeleteModalState(false);
      setSelectedProductDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModalState(false);
      setSelectedProductDelete(null);
    }
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(products);

  const selectedProducts = products.filter(product => 
    selectedResources.includes(product.id)
  );

  const promotedBulkActions = selectedResources.length > 0 ? [
    {
      content: (
        <BulkActions
          selectedCount={selectedResources.length}
          selectedProducts={selectedProducts}
          onBulkDelete={onBulkDelete}
          onBulkAddTags={onBulkAddTags}
          onBulkUpdateStatus={onBulkUpdateStatus}
          isLoading={isLoading}
        />
      ),
    },
  ] : [];

  const rowMarkup = products.map((product, index) => (
    <ProductTableRow
      key={product.id}
      product={product}
      index={index}
      isSelected={selectedResources.includes(product.id)}
      onEdit={handleEdit}
      onDelete={handleDelete}
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
      
      <DeleteConfirmModal
        isOpen={deleteModalState}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        productTitle={selectedProductDelete?.title || ""}
        isLoading={isDeleting}
      />
      <div style={{ position: "relative" }}>
        {isLoading && (
          <div style={CARD_LOADING_OVERLAY_STYLES}>
            <Spinner accessibilityLabel="Loading products" size="large" />
          </div>
        )}
        <Card padding="0">
          <ProductFilters
            initialQuery={initialQuery}
            initialSort={initialSort}
            initialTab={initialTab}
            initialTaggedWith={initialTaggedWith}
            initialPriceRange={initialPriceRange}
            onSearchChange={onSearchChange}
            onFiltersChange={onFiltersChange}
            onSortChange={onSortChange}
            onTabChange={onTabChange}
            onViewChange={() => {}}
            onCreateNewView={() => {}}
            onSaveView={() => {}}
            onCancelView={() => {}}
          />
          <div style={{ width: '100%' }}>
            <IndexTable
              condensed={false}
              resourceName={RESOURCE_NAME}
              itemCount={products.length}
              selectedItemsCount={
                allResourcesSelected ? "All" : selectedResources.length
              }
              onSelectionChange={handleSelectionChange}
              promotedBulkActions={promotedBulkActions}
              headings={TABLE_HEADINGS}
            >
              {rowMarkup}
            </IndexTable>
          </div>
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

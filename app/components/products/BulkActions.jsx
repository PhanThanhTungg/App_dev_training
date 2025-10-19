import { 
  ActionList, 
  Button, 
  ButtonGroup, 
  Popover, 
  Modal, 
  TextField, 
  Select, 
  Form,
  FormLayout,
  Text,
  Banner
} from "@shopify/polaris";
import { useState, useCallback } from "react";

const BulkActions = ({ 
  selectedCount, 
  selectedProducts, 
  onBulkDelete, 
  onBulkAddTags, 
  onBulkUpdateStatus,
  isLoading = false 
}) => {
  const [popoverActive, setPopoverActive] = useState(false);
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [addTagsModalActive, setAddTagsModalActive] = useState(false);
  const [updateStatusModalActive, setUpdateStatusModalActive] = useState(false);
  
  const [newTags, setNewTags] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ACTIVE");

  const togglePopover = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const handleBulkDelete = useCallback(() => {
    setPopoverActive(false);
    setDeleteModalActive(true);
  }, []);

  const handleAddTags = useCallback(() => {
    setPopoverActive(false);
    setAddTagsModalActive(true);
  }, []);

  const handleUpdateStatus = useCallback(() => {
    setPopoverActive(false);
    setUpdateStatusModalActive(true);
  }, []);

  const confirmBulkDelete = useCallback(async () => {
    await onBulkDelete(selectedProducts.map(p => p.id));
    setDeleteModalActive(false);
  }, [onBulkDelete, selectedProducts]);

  const confirmAddTags = useCallback(async () => {
    if (newTags.trim()) {
      const tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean);
      await onBulkAddTags(selectedProducts, tags);
      setAddTagsModalActive(false);
      setNewTags("");
    }
  }, [onBulkAddTags, selectedProducts, newTags]);

  const confirmUpdateStatus = useCallback(async () => {
    await onBulkUpdateStatus(selectedProducts.map(p => p.id), selectedStatus);
    setUpdateStatusModalActive(false);
  }, [onBulkUpdateStatus, selectedProducts, selectedStatus]);

  const statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Archived', value: 'ARCHIVED' },
  ];

  const actions = [
    {
      content: 'Delete products',
      destructive: true,
      onAction: handleBulkDelete,
    },
    {
      content: 'Add tags',
      onAction: handleAddTags,
    },
    {
      content: 'Update status',
      onAction: handleUpdateStatus,
    },
  ];

  const activator = (
    <Button
      disclosure
      onClick={togglePopover}
      disabled={selectedCount === 0 || isLoading}
    >
      Actions ({selectedCount} selected)
    </Button>
  );

  return (
    <>
      <Popover
        active={popoverActive}
        activator={activator}
        onClose={togglePopover}
        ariaHaspopup={false}
        sectioned
      >
        <ActionList
          actionRole="menuitem"
          items={actions}
        />
      </Popover>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalActive}
        onClose={() => setDeleteModalActive(false)}
        title="Delete Products"
        primaryAction={{
          content: 'Delete',
          destructive: true,
          loading: isLoading,
          onAction: confirmBulkDelete,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setDeleteModalActive(false),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p">
            Are you sure you want to delete {selectedCount} product{selectedCount > 1 ? 's' : ''}? 
            This action cannot be undone.
          </Text>
        </Modal.Section>
      </Modal>

      {/* Add Tags Modal */}
      <Modal
        open={addTagsModalActive}
        onClose={() => setAddTagsModalActive(false)}
        title="Add Tags"
        primaryAction={{
          content: 'Add Tags',
          loading: isLoading,
          onAction: confirmAddTags,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setAddTagsModalActive(false),
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Tags"
              value={newTags}
              onChange={setNewTags}
              placeholder="Enter tags separated by commas"
              helpText="These tags will be added to all selected products"
            />
            <Banner status="info">
              <p>Adding tags to {selectedCount} product{selectedCount > 1 ? 's' : ''}</p>
            </Banner>
          </FormLayout>
        </Modal.Section>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        open={updateStatusModalActive}
        onClose={() => setUpdateStatusModalActive(false)}
        title="Update Status"
        primaryAction={{
          content: 'Update Status',
          loading: isLoading,
          onAction: confirmUpdateStatus,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setUpdateStatusModalActive(false),
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <Select
              label="New Status"
              options={statusOptions}
              onChange={setSelectedStatus}
              value={selectedStatus}
            />
            <Banner status="info">
              <p>Updating status for {selectedCount} product{selectedCount > 1 ? 's' : ''}</p>
            </Banner>
          </FormLayout>
        </Modal.Section>
      </Modal>
    </>
  );
};

export default BulkActions;

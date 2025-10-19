import { Modal, Text, Button, InlineStack } from "@shopify/polaris";

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  productTitle, 
  isLoading = false 
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Delete Product"
      primaryAction={{
        content: "Delete",
        destructive: true,
        loading: isLoading,
        onAction: onConfirm,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <Text as="p">
          Are you sure you want to delete the product "{productTitle}"? 
          This action cannot be undone.
        </Text>
      </Modal.Section>
    </Modal>
  );
};

export default DeleteConfirmModal;

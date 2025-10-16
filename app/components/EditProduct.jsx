import { Button, Frame, Modal, TextContainer, Text, InlineStack, Thumbnail, Icon, Badge, BlockStack, Divider, Box } from "@shopify/polaris";
import { useCallback, useState } from "react";
import { ImageIcon } from "@shopify/polaris-icons";
import { formatPrice, formatDate } from "../utils/format.util";

const EditProduct = ({ editModalState, setEditModalState , selectedProductEdit}) => {
  const handleClose = useCallback(() => setEditModalState(false), [setEditModalState]);
  return (
    <div style={{ height: "0px" }}>
      <Frame>
        <Modal
          open={editModalState}
          onClose={handleClose}
          title="Edit Product"
          primaryAction={{
            content: "Save",
            onAction: handleClose,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: handleClose,
            },
          ]}
        >
          <Modal.Section>
            {selectedProductEdit && (
              <BlockStack gap="400">
                <InlineStack gap="400" blockAlign="start">
                  {selectedProductEdit.featuredImage ? (
                    <Thumbnail
                      source={selectedProductEdit.featuredImage.url}
                      alt={selectedProductEdit.featuredImage.altText || selectedProductEdit.title}
                      size="large"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center">
                      <Icon source={ImageIcon} tone="subdued" />
                    </div>
                  )}
                  <BlockStack gap="100">
                    <Text variant="headingMd" fontWeight="semibold" as="h3">
                      {selectedProductEdit.title}
                    </Text>
                    <Badge tone={selectedProductEdit.status === "ACTIVE" ? "success" : "warning"}>
                      {selectedProductEdit.status === "ACTIVE" ? "Active" : "Inactive"}
                    </Badge>
                  </BlockStack>
                </InlineStack>

                <Divider />

                <Box>
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="bodyMd" fontWeight="medium" as="p" tone="subdued">
                      Price
                    </Text>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      {formatPrice(selectedProductEdit.priceRangeV2)}
                    </Text>
                  </InlineStack>
                </Box>

                <Divider />

                <Box>
                  <InlineStack align="space-between" blockAlign="start">
                    <Text variant="bodyMd" fontWeight="medium" as="p" tone="subdued">
                      Tags
                    </Text>
                    <Box maxWidth="60%">
                      {selectedProductEdit.tags.length > 0 ? (
                        <InlineStack gap="200" wrap={true} align="end">
                          {selectedProductEdit.tags.map((tag, idx) => (
                            <Badge key={idx} tone="info">
                              {tag}
                            </Badge>
                          ))}
                        </InlineStack>
                      ) : (
                        <Text as="span" tone="subdued">
                          No tags
                        </Text>
                      )}
                    </Box>
                  </InlineStack>
                </Box>

                <Divider />

                <Box>
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="bodyMd" fontWeight="medium" as="p" tone="subdued">
                      Created At
                    </Text>
                    <Text variant="bodyMd" as="p">
                      <span className="text-gray-500">{formatDate(selectedProductEdit.createdAt)}</span>
                    </Text>
                  </InlineStack>
                </Box>
              </BlockStack>
            )}
          </Modal.Section>
        </Modal>
      </Frame>
    </div>
  );
};

export default EditProduct;

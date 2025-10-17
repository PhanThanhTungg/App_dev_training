import {
  Button,
  Frame,
  Modal,
  TextContainer,
  Text,
  InlineStack,
  Thumbnail,
  Icon,
  Badge,
  BlockStack,
  Divider,
  Box,
  TextField,
} from "@shopify/polaris";
import { useCallback, useRef, useState } from "react";
import { ImageIcon, PlusCircleIcon, XIcon } from "@shopify/polaris-icons";
import { formatPrice, formatDate } from "../utils/format.util";

const EditProduct = ({
  editModalState,
  setEditModalState,
  selectedProductEdit,
}) => {
  const [tags, setTags] = useState(selectedProductEdit.tags);
  const [addTagModal, setAddTagModal] = useState(false);

  const newTagRef = useRef(null);

  const handleAddTagModal = () => {
    setAddTagModal(!addTagModal);
  };
  const handleClose = useCallback(
    () => setEditModalState(false),
    [setEditModalState],
  );
  const handleAddTag = () => {
    const newTagValue = newTagRef.current?.value?.trim();
    if (newTagValue && !tags.includes(newTagValue)) {
      setTags((oldTags) => [...oldTags, newTagValue]);
      if (newTagRef.current) {
        newTagRef.current.value = "";
      }
      setAddTagModal(false);
    }
  };

  const handleRemoveTag = (tag) => {
    setTags((oldTags) => oldTags.filter((t) => t !== tag));
  };

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
                      alt={
                        selectedProductEdit.featuredImage.altText ||
                        selectedProductEdit.title
                      }
                      size="large"
                    />
                  ) : (
                    <Icon source={ImageIcon} tone="subdued" />
                  )}
                  <BlockStack gap="100">
                    <Text variant="headingMd" fontWeight="semibold" as="h3">
                      {selectedProductEdit.title}
                    </Text>
                    <Badge
                      tone={
                        selectedProductEdit.status === "ACTIVE"
                          ? "success"
                          : "warning"
                      }
                    >
                      {selectedProductEdit.status === "ACTIVE"
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </BlockStack>
                </InlineStack>

                <Divider />

                <Box>
                  <InlineStack align="space-between" blockAlign="center">
                    <Text
                      variant="bodyMd"
                      fontWeight="medium"
                      as="p"
                      tone="subdued"
                    >
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
                    <Text
                      variant="bodyMd"
                      fontWeight="medium"
                      as="p"
                      tone="subdued"
                    >
                      Tags
                    </Text>
                    <Box maxWidth="60%">
                      <InlineStack gap="200" wrap={true} align="end">
                        {tags.length > 0 ? (
                          <InlineStack gap="200" wrap={true} align="end">
                            {tags.map((tag, idx) => (
                              <Badge key={idx} tone="info">
                                <div className="flex items-center gap-1">
                                  <span>{tag}</span>
                                  <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="p-0 hover:opacity-70 transition-opacity cursor-pointer"
                                  >
                                    <XIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </Badge>
                            ))}
                          </InlineStack>
                        ) : (
                          <Text as="span" tone="subdued">
                            No tags
                          </Text>
                        )}
                        <Button
                          icon={PlusCircleIcon}
                          size="slim"
                          variant="plain"
                          onClick={handleAddTagModal}
                        />
                        {addTagModal && (
                          <InlineStack gap="200" wrap={true} align="end">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Add a tag"
                                ref={newTagRef}
                              />
                              <Button onClick={handleAddTag}>Add</Button>
                            </div>
                          </InlineStack>
                        )}
                      </InlineStack>
                    </Box>
                  </InlineStack>
                </Box>

                <Divider />

                <Box>
                  <InlineStack align="space-between" blockAlign="center">
                    <Text
                      variant="bodyMd"
                      fontWeight="medium"
                      as="p"
                      tone="subdued"
                    >
                      Created At
                    </Text>
                    <Text variant="bodyMd" as="p">
                      <span className="text-black">
                        {formatDate(selectedProductEdit.createdAt)}
                      </span>
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

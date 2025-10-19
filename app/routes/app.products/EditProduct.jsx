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
  Select,
} from "@shopify/polaris";
import { useCallback, useRef, useState } from "react";
import { ImageIcon, PlusCircleIcon, XIcon } from "@shopify/polaris-icons";
import { formatPrice, formatDate } from "../../utils/format.util";
import { useFetcher } from "react-router";

const EditProduct = ({
  editModalState,
  setEditModalState,
  selectedProductEdit,
}) => {
  const [tags, setTags] = useState(selectedProductEdit.tags);
  const [title, setTitle] = useState(selectedProductEdit.title);
  const [status, setStatus] = useState(selectedProductEdit.status);
  const [description, setDescription] = useState(selectedProductEdit.description || selectedProductEdit.descriptionHtml || "");

  const getCategoryFromTags = (tags) => {
    const categoryTag = tags.find(tag => tag.startsWith("category:"));
    return categoryTag ? categoryTag.replace("category:", "") : "";
  };
  
  const [category, setCategory] = useState(getCategoryFromTags(selectedProductEdit.tags || []));
  const [addTagModal, setAddTagModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetcher = useFetcher();
  const newTagRef = useRef(null);

  const statusOptions = [
    { label: "Active", value: "ACTIVE" },
    { label: "Draft", value: "DRAFT" },
    { label: "Archived", value: "ARCHIVED" },
  ];

  const categoryOptions = [
    { label: "No Category", value: "" },
    { label: "Electronics", value: "electronics" },
    { label: "Clothing", value: "clothing" },
    { label: "Home & Garden", value: "home-garden" },
    { label: "Sports & Outdoors", value: "sports-outdoors" },
    { label: "Health & Beauty", value: "health-beauty" },
    { label: "Books", value: "books" },
    { label: "Toys & Games", value: "toys-games" },
    { label: "Food & Beverages", value: "food-beverages" },
    { label: "Other", value: "other" },
  ];

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

  const handleUpdateProduct = async () => {
    try {
      setIsUpdating(true);

      const filteredTags = tags.filter(tag => !tag.startsWith("category:"));
      
      const finalTags = category ? [...filteredTags, `category:${category}`] : filteredTags;

      fetcher.submit(
        {
          productId: selectedProductEdit.id,
          title: title,
          status: status,
          description: description,
          category: category,
          tags: JSON.stringify(finalTags),
        },
        { method: "post" },
      );

      shopify.toast.show("Product updated", { duration: 2000 });
      setIsUpdating(false);
      handleClose();
    } catch (error) {
      shopify.toast.show("Failed to update product", { duration: 2000 });
    }
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
            onAction: handleUpdateProduct,
            loading: isUpdating,
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
                      Edit Product Details
                    </Text>
                    <Badge
                      tone={
                        status === "ACTIVE"
                          ? "success"
                          : status === "DRAFT"
                          ? "warning"
                          : "critical"
                      }
                    >
                      {status === "ACTIVE"
                        ? "Active"
                        : status === "DRAFT"
                        ? "Draft"
                        : "Archived"}
                    </Badge>
                  </BlockStack>
                </InlineStack>

                <Divider />

                {/* Title Field */}
                <Box>
                  <TextField
                    label="Product Title"
                    value={title}
                    onChange={(value) => setTitle(value)}
                    placeholder="Enter product title"
                    autoComplete="off"
                  />
                </Box>

                <Divider />

                {/* Status Field */}
                <Box>
                  <Select
                    label="Product Status"
                    options={statusOptions}
                    value={status}
                    onChange={(value) => setStatus(value)}
                  />
                </Box>

                <Divider />

                {/* Description Field */}
                <Box>
                  <TextField
                    label="Product Description"
                    value={description}
                    onChange={(value) => setDescription(value)}
                    placeholder="Enter product description"
                    multiline={4}
                    autoComplete="off"
                  />
                </Box>

                <Divider />

                {/* Category Field */}
                <Box>
                  <Select
                    label="Product Category"
                    options={categoryOptions}
                    value={category}
                    onChange={(value) => setCategory(value)}
                  />
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
                        {/* Filter out category tags from display */}
                        {tags.filter(tag => !tag.startsWith("category:")).length > 0 ? (
                          <InlineStack gap="200" wrap={true} align="end">
                            {tags.filter(tag => !tag.startsWith("category:")).map((tag, idx) => (
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

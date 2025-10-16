import {
  Card,
  IndexTable,
  Thumbnail,
  Text,
  Badge,
  InlineStack,
  Icon,
  Pagination,
  Box,
  Select,
  Button,
} from "@shopify/polaris";
import { EditIcon, ImageIcon } from "@shopify/polaris-icons";
import { formatPrice, formatDate } from "../utils/format.util";
import { truncateText } from "../utils/product.util";
import { useState } from "react";
import EditProduct from "./EditProduct";

const ProductTable = ({
  products,
  pageInfo,
  totalPages,
  totalCount,
  limit,
  onPrevious,
  onNext,
  onLimitChange,
}) => {
  const [editModalState, setEditModalState] = useState(false);
  const [selectedProductEdit, setSelectedProductEdit] = useState(null);
  const handleEdit = (product) => {
    setSelectedProductEdit(product);
    setEditModalState(true);
  };

  const rowMarkup = products.map((product, index) => (
    <IndexTable.Row id={product.id} key={product.id} position={index}>
      <IndexTable.Cell>
        {product.featuredImage ? (
          <Thumbnail
            source={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            size="small"
          />
        ) : (
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#f3f3f3",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon source={ImageIcon} tone="subdued" />
          </div>
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="semibold" as="span">
          {truncateText(product.title, 40)}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span">{formatPrice(product.priceRangeV2)}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        {product.tags.length > 0 ? (
          <InlineStack gap="200" wrap={false}>
            {product.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} tone="info">
                {truncateText(tag, 15)}
              </Badge>
            ))}
            {product.tags.length > 3 && (
              <Text as="span" tone="subdued">
                +{product.tags.length - 3}
              </Text>
            )}
          </InlineStack>
        ) : (
          <Text as="span" tone="subdued">
            none
          </Text>
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={product.status === "ACTIVE" ? "success" : "warning"}>
          {product.status === "ACTIVE" ? "active" : "inactive"}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {formatDate(product.createdAt)}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Button
          variant="primary"
          icon={EditIcon}
          onClick={() => handleEdit(product)}
        >
          Edit
        </Button>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <>
      {editModalState && <EditProduct editModalState={editModalState} setEditModalState={setEditModalState} selectedProductEdit={selectedProductEdit}/>}
      <Card padding="0">
        <IndexTable
          itemCount={products.length}
          selectable={false}
          headings={[
            { title: "Image" },
            { title: "Title" },
            { title: "Price" },
            { title: "Tags" },
            { title: "Status" },
            { title: "Created At" },
            { title: "Actions" },
          ]}
        >
          {rowMarkup}
        </IndexTable>

        <Box padding="400" borderBlockStartWidth="025" borderColor="border">
          <InlineStack align="space-between" blockAlign="center" wrap={false}>
            <InlineStack gap="300" blockAlign="center" wrap={false}>
              <Text as="p" variant="bodySm" tone="subdued">
                Total {totalCount} products
              </Text>
              <div
                style={{
                  width: "1px",
                  height: "20px",
                  backgroundColor: "#e1e3e5",
                }}
              />
              <Select
                labelHidden
                options={[
                  { label: "5 / page", value: "5" },
                  { label: "10 / page", value: "10" },
                  { label: "15 / page", value: "15" },
                  { label: "20 / page", value: "20" },
                  { label: "25 / page", value: "25" },
                  { label: "50 / page", value: "50" },
                ]}
                value={limit}
                onChange={onLimitChange}
              />
            </InlineStack>
            <InlineStack gap="400" blockAlign="center" wrap={false}>
              <Text as="p" variant="bodySm" fontWeight="medium">
                Total {totalPages} pages
              </Text>
              <Pagination
                hasPrevious={pageInfo.hasPreviousPage}
                onPrevious={onPrevious}
                hasNext={pageInfo.hasNextPage}
                onNext={onNext}
              />
            </InlineStack>
          </InlineStack>
        </Box>
      </Card>
    </>
  );
};

export default ProductTable;

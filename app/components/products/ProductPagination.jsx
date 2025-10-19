import { Pagination, Box, Select, InlineStack, Text } from "@shopify/polaris";

const ProductPagination = ({
  pageInfo,
  totalPages,
  totalCount,
  limit,
  onPrevious,
  onNext,
  onLimitChange,
}) => {
  const limitOptions = [
    { label: "5 / page", value: "5" },
    { label: "10 / page", value: "10" },
    { label: "15 / page", value: "15" },
    { label: "20 / page", value: "20" },
    { label: "25 / page", value: "25" },
    { label: "50 / page", value: "50" },
  ];

  return (
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
            options={limitOptions}
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
  );
};

export default ProductPagination;

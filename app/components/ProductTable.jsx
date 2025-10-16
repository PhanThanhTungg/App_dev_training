import { 
  Card, 
  IndexTable, 
  Thumbnail, 
  Text, 
  Badge, 
  InlineStack,
  Icon
} from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";
import { formatPrice, formatDate } from "../utils/format.util";
import { truncateText } from "../utils/product.util";

const ProductTable = ({ products }) => {
  const resourceName = {
    singular: 'product',
    plural: 'products',
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
          <div style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: '#f3f3f3', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
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
        <Badge tone={product.status === 'ACTIVE' ? 'success' : 'warning'}>
          {product.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {formatDate(product.createdAt)}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Card padding="0">
      <IndexTable
        resourceName={resourceName}
        itemCount={products.length}
        selectable={false}
        headings={[
          { title: 'Image' },
          { title: 'Title' },
          { title: 'Price' },
          { title: 'Tags' },
          { title: 'Status' },
          { title: 'Created At' },
        ]}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
};

export default ProductTable;

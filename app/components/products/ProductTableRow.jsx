import {
  IndexTable,
  Thumbnail,
  Text,
  Badge,
  InlineStack,
  Icon,
  Button,
  ButtonGroup,
  useBreakpoints,
} from "@shopify/polaris";
import { EditIcon, ImageIcon, DeleteIcon } from "@shopify/polaris-icons";
import { formatPrice, formatDate } from "../../utils/format.util";
import { truncateText, getProductStatusText, getProductStatusTone } from "../../utils/product.util";

const ProductTableRow = ({ product, index, isSelected, onEdit, onDelete }) => {
  const { smDown } = useBreakpoints();
  
  const handleEdit = (event) => {
    event.stopPropagation();
    onEdit(product);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete(product);
  };

  return (
    <IndexTable.Row
      id={product.id}
      key={product.id}
      selected={isSelected}
      position={index}
    >
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
        <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
          <Text variant="bodyMd" fontWeight="semibold" as="span">
            {truncateText(product.title, 35)}
          </Text>
        </div>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span">{formatPrice(product.priceRangeV2)}</Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        {product.tags.length > 0 ? (
          <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
            <InlineStack gap="100" wrap={false}>
              {product.tags.filter(tag => !tag.startsWith("category:")).slice(0, 2).map((tag, idx) => (
                <Badge key={idx} tone="info">
                  {truncateText(tag, 12)}
                </Badge>
              ))}
              {product.tags.filter(tag => !tag.startsWith("category:")).length > 2 && (
                <Text as="span" tone="subdued" variant="bodySm">
                  +{product.tags.filter(tag => !tag.startsWith("category:")).length - 2}
                </Text>
              )}
            </InlineStack>
          </div>
        ) : (
          <Text as="span" tone="subdued">
            none
          </Text>
        )}
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Badge tone={getProductStatusTone(product.status)}>
          {getProductStatusText(product.status)}
        </Badge>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {formatDate(product.createdAt)}
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          minWidth: '80px',
          justifyContent: 'flex-start',
          alignItems: 'center',
          whiteSpace: 'nowrap'
        }}>
          <Button 
            size="small"
            variant="tertiary" 
            icon={EditIcon} 
            onClick={handleEdit}
            accessibilityLabel="Edit product"
          />
          <Button 
            size="small"
            variant="tertiary" 
            tone="critical" 
            icon={DeleteIcon} 
            onClick={handleDelete}
            accessibilityLabel="Delete product"
          />
        </div>
      </IndexTable.Cell>
    </IndexTable.Row>
  );
};

export default ProductTableRow;

import { EmptyState as PolarisEmptyState, Card } from "@shopify/polaris";

const EmptyState = () => (
  <Card>
    <PolarisEmptyState
      heading="No products found"
    >
      <p>You don't have any products in your store yet.</p>
    </PolarisEmptyState>
  </Card>
);

export default EmptyState;

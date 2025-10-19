export const TABLE_HEADINGS = [
  { title: "Image" },
  { title: "Title" },
  { title: "Price" },
  { title: "Tags" },
  { title: "Status" },
  { title: "Created At" },
  { title: "Actions" },
];

export const RESOURCE_NAME = {
  singular: "product",
  plural: "products",
};

export const CARD_LOADING_OVERLAY_STYLES = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: "rgba(255, 255, 255, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1,
};

export const DEFAULT_VIEW_TABS = [
  "All",
  "Active",
  "Draft", 
  "Archived",
];

export const SORT_OPTIONS = [
  { label: "Title", value: "title asc", directionLabel: "A-Z" },
  { label: "Title", value: "title desc", directionLabel: "Z-A" },
  { label: "Price", value: "price asc", directionLabel: "Low to High" },
  { label: "Price", value: "price desc", directionLabel: "High to Low" },
  { label: "Created", value: "created asc", directionLabel: "Oldest first" },
  { label: "Created", value: "created desc", directionLabel: "Newest first" },
];

export const LIMIT_OPTIONS = [
  { label: "5 / page", value: "5" },
  { label: "10 / page", value: "10" },
  { label: "15 / page", value: "15" },
  { label: "20 / page", value: "20" },
  { label: "25 / page", value: "25" },
  { label: "50 / page", value: "50" },
];

export const PRODUCT_STATUS_CHOICES = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
];

export const PRICE_RANGE_CONFIG = {
  min: 0,
  max: 5000,
  step: 10,
  defaultRange: [0, 1000],
};

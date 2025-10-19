import {
  IndexFilters,
  useSetIndexFiltersMode,
  ChoiceList,
  TextField,
  RangeSlider,
} from "@shopify/polaris";
import { useState, useCallback, useEffect, useRef } from "react";

const ProductFilters = ({
  initialQuery = "",
  initialSort = "created desc",
  onSearchChange,
  onFiltersChange,
  onSortChange,
  onViewChange,
  onCreateNewView,
  onSaveView,
  onCancelView,
}) => {
  const { mode, setMode } = useSetIndexFiltersMode();
  const [queryValue, setQueryValue] = useState(initialQuery);
  const skipSearchCallbackRef = useRef(true);

  // Tabs/Views state
  const [itemStrings, setItemStrings] = useState([
    "All",
    "Active",
    "Draft",
    "Archived",
  ]);
  const [selected, setSelected] = useState(0);

  // Filter states
  const [productStatus, setProductStatus] = useState(undefined);
  const [taggedWith, setTaggedWith] = useState("");
  const [priceRange, setPriceRange] = useState(undefined);
  const [sortSelected, setSortSelected] = useState([initialSort]);

  // Sort options
  const sortOptions = [
    { label: "Title", value: "title asc", directionLabel: "A-Z" },
    { label: "Title", value: "title desc", directionLabel: "Z-A" },
    { label: "Price", value: "price asc", directionLabel: "Low to High" },
    { label: "Price", value: "price desc", directionLabel: "High to Low" },
    { label: "Created", value: "created asc", directionLabel: "Oldest first" },
    { label: "Created", value: "created desc", directionLabel: "Newest first" },
  ];

  // Search effect
  useEffect(() => {
    skipSearchCallbackRef.current = true;
    setQueryValue(initialQuery);
  }, [initialQuery]);

  // Sort effect
  useEffect(() => {
    setSortSelected([initialSort]);
  }, [initialSort]);

  useEffect(() => {
    if (typeof onSearchChange !== "function") {
      return;
    }

    if (skipSearchCallbackRef.current) {
      skipSearchCallbackRef.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      onSearchChange(queryValue);
    }, 600);

    return () => clearTimeout(timeout);
  }, [queryValue, onSearchChange]);

  // Filter handlers
  const handleProductStatusChange = useCallback(
    (value) => {
      setProductStatus(value);
      onFiltersChange?.({ productStatus: value, taggedWith, priceRange });
    },
    [taggedWith, priceRange, onFiltersChange],
  );

  const handleTaggedWithChange = useCallback(
    (value) => {
      setTaggedWith(value);
      onFiltersChange?.({ productStatus, taggedWith: value, priceRange });
    },
    [productStatus, priceRange, onFiltersChange],
  );

  const handlePriceRangeChange = useCallback(
    (value) => {
      setPriceRange(value);
      onFiltersChange?.({ productStatus, taggedWith, priceRange: value });
    },
    [productStatus, taggedWith, onFiltersChange],
  );

  const handleFiltersQueryChange = useCallback(
    (value) => setQueryValue(value),
    [],
  );

  const handleSortChange = useCallback(
    (value) => {
      setSortSelected(value);
      onSortChange?.(value);
    },
    [onSortChange],
  );

  // Remove handlers
  const handleProductStatusRemove = useCallback(() => {
    setProductStatus(undefined);
    onFiltersChange?.({ productStatus: undefined, taggedWith, priceRange });
  }, [taggedWith, priceRange, onFiltersChange]);

  const handleTaggedWithRemove = useCallback(() => {
    setTaggedWith("");
    onFiltersChange?.({ productStatus, taggedWith: "", priceRange });
  }, [productStatus, priceRange, onFiltersChange]);

  const handlePriceRangeRemove = useCallback(() => {
    setPriceRange(undefined);
    onFiltersChange?.({ productStatus, taggedWith, priceRange: undefined });
  }, [productStatus, taggedWith, onFiltersChange]);

  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);

  const handleFiltersClearAll = useCallback(() => {
    handleProductStatusRemove();
    handleTaggedWithRemove();
    handlePriceRangeRemove();
    handleQueryValueRemove();
  }, [
    handleProductStatusRemove,
    handleTaggedWithRemove,
    handlePriceRangeRemove,
    handleQueryValueRemove,
  ]);

  // Tab management
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const deleteView = (index) => {
    const newItemStrings = [...itemStrings];
    newItemStrings.splice(index, 1);
    setItemStrings(newItemStrings);
    setSelected(0);
  };

  const duplicateView = async (name) => {
    setItemStrings([...itemStrings, name]);
    setSelected(itemStrings.length);
    await sleep(1);
    return true;
  };

  const tabs = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    isLocked: index === 0,
    actions:
      index === 0
        ? []
        : [
            {
              type: "rename",
              onAction: () => {},
              onPrimaryAction: async (value) => {
                const newItemsStrings = tabs.map((item, idx) => {
                  if (idx === index) {
                    return value;
                  }
                  return item.content;
                });
                await sleep(1);
                setItemStrings(newItemsStrings);
                return true;
              },
            },
            {
              type: "duplicate",
              onPrimaryAction: async (value) => {
                await sleep(1);
                duplicateView(value);
                return true;
              },
            },
            {
              type: "edit",
            },
            {
              type: "delete",
              onPrimaryAction: async () => {
                await sleep(1);
                deleteView(index);
                return true;
              },
            },
          ],
  }));

  const handleCreateNewView = async (value) => {
    await sleep(500);
    setItemStrings([...itemStrings, value]);
    setSelected(itemStrings.length);
    onCreateNewView?.(value);
    return true;
  };

  const onHandleCancel = () => {
    onCancelView?.();
  };

  const onHandleSave = async () => {
    await sleep(1);
    onSaveView?.();
    return true;
  };

  const primaryAction =
    selected === 0
      ? {
          type: "save-as",
          onAction: handleCreateNewView,
          disabled: false,
          loading: false,
        }
      : {
          type: "save",
          onAction: onHandleSave,
          disabled: false,
          loading: false,
        };

  // Filter definitions
  const filters = [
    {
      key: "productStatus",
      label: "Product status",
      filter: (
        <ChoiceList
          title="Product status"
          titleHidden
          choices={[
            { label: "Active", value: "active" },
            { label: "Draft", value: "draft" },
            { label: "Archived", value: "archived" },
          ]}
          selected={productStatus || []}
          onChange={handleProductStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: "taggedWith",
      label: "Tagged with",
      filter: (
        <TextField
          label="Tagged with"
          value={taggedWith}
          onChange={handleTaggedWithChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
    {
      key: "priceRange",
      label: "Price range",
      filter: (
        <RangeSlider
          label="Price is between"
          labelHidden
          value={priceRange || [0, 1000]}
          prefix="$"
          output
          min={0}
          max={5000}
          step={10}
          onChange={handlePriceRangeChange}
        />
      ),
    },
  ];

  // Applied filters
  const appliedFilters = [];
  if (productStatus && !isEmpty(productStatus)) {
    const key = "productStatus";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, productStatus),
      onRemove: handleProductStatusRemove,
    });
  }
  if (priceRange) {
    const key = "priceRange";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, priceRange),
      onRemove: handlePriceRangeRemove,
    });
  }
  if (!isEmpty(taggedWith)) {
    const key = "taggedWith";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, taggedWith),
      onRemove: handleTaggedWithRemove,
    });
  }

  return (
    <IndexFilters
      sortOptions={sortOptions}
      sortSelected={sortSelected}
      queryValue={queryValue}
      queryPlaceholder="Searching in all products"
      onQueryChange={handleFiltersQueryChange}
      onQueryClear={() => setQueryValue("")}
      onSort={handleSortChange}
      primaryAction={primaryAction}
      cancelAction={{
        onAction: onHandleCancel,
        disabled: false,
        loading: false,
      }}
      tabs={tabs}
      selected={selected}
      onSelect={setSelected}
      canCreateNewView
      onCreateNewView={handleCreateNewView}
      filters={filters}
      appliedFilters={appliedFilters}
      onClearAll={handleFiltersClearAll}
      mode={mode}
      setMode={setMode}
    />
  );
};

// Helper functions
function disambiguateLabel(key, value) {
  switch (key) {
    case "priceRange":
      return `Price is between $${value[0]} and $${value[1]}`;
    case "taggedWith":
      return `Tagged with ${value}`;
    case "productStatus":
      return value.map((val) => `Status: ${val}`).join(", ");
    default:
      return value;
  }
}

function isEmpty(value) {
  if (Array.isArray(value)) {
    return value.length === 0;
  } else {
    return value === "" || value == null;
  }
}

export default ProductFilters;

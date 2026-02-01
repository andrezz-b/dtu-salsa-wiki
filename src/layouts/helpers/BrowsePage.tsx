import React, { useState, useMemo, useCallback } from "react";
import MultiSelect from "@/components/ui/MultiSelect";
import StarRatingFilter from "@/components/ui/StarRatingFilter";
import Pagination from "@/components/ui/Pagination";
import { IoSearch, IoFilter, IoClose, IoSwapVertical } from "react-icons/io5";
import { useSearch } from "@/hooks/useSearch";

// ============================================================================
// Type Definitions
// ============================================================================

// Filter Definition Types - Generic to work with any item type
interface BaseFilterDef<T> {
  id: string;
  label: string;
}

interface MultiSelectFilterDef<T> extends BaseFilterDef<T> {
  type: "multiselect";
  getOptions: (items: T[]) => string[];
  getValue: (item: T) => string | undefined;
}

interface RatingFilterDef<T> extends BaseFilterDef<T> {
  type: "rating";
  getValue: (item: T) => number | undefined;
}

export type FilterDefinition<T> = MultiSelectFilterDef<T> | RatingFilterDef<T>;

// Sort Option Types - Generic
export interface SortOption<T> {
  id: string;
  label: string;
  sortFn: (a: T, b: T) => number;
}

// Component Props - Generic
interface BrowsePageProps<T> {
  // Data & Search
  items: T[];
  idField: keyof T;
  searchFields: string[];
  storeFields: string[];
  boostFields: Record<string, number>;

  // Display
  title: string;
  itemLabel: string;
  searchPlaceholder: string;

  // Extensible Filters & Sorting
  filters: FilterDefinition<T>[];
  sortOptions?: SortOption<T>[];
  defaultSort?: string;

  // Card rendering
  renderCard: (item: T) => React.ReactNode;
}

// ============================================================================
// Filter State Management
// ============================================================================

type FilterState = Record<string, string[] | number>;

const getInitialFilterState = <T,>(
  filters: FilterDefinition<T>[],
): FilterState => {
  const state: FilterState = {};
  filters.forEach((filter) => {
    if (filter.type === "multiselect") {
      state[filter.id] = [];
    } else if (filter.type === "rating") {
      state[filter.id] = 0;
    }
  });
  return state;
};

// ============================================================================
// BrowsePage Component
// ============================================================================

// Noop sort to use the Minisearch relevance
export const relevanceSort: SortOption<any> = {
  id: "relevance",
  label: "Relevance",
  sortFn: (a, b) => 0,
};

function BrowsePage<T>({
  items,
  idField,
  searchFields,
  storeFields,
  boostFields,
  title,
  itemLabel,
  searchPlaceholder,
  filters,
  sortOptions = [],
  defaultSort,
  renderCard,
}: BrowsePageProps<T>) {
  // Filter state
  const [filterState, setFilterState] = useState<FilterState>(() =>
    getInitialFilterState(filters),
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sort state
  const [currentSort, setCurrentSort] = useState<string>(
    defaultSort || sortOptions[0]?.id || "",
  );
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Search hook
  const { search } = useSearch({
    items,
    fields: searchFields,
    storeFields,
    idField,
    boostFields,
  });

  // Extract options for multiselect filters
  const filterOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    filters.forEach((filter) => {
      if (filter.type === "multiselect") {
        options[filter.id] = filter.getOptions(items);
      }
    });
    return options;
  }, [filters, items]);

  // Filter update helper
  const updateFilter = useCallback(
    (filterId: string, value: string[] | number) => {
      setFilterState((prev) => ({ ...prev, [filterId]: value }));
    },
    [],
  );

  // Sync from URL on mount and popstate
  React.useEffect(() => {
    const readFromURL = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);

      // Search
      const q = params.get("q");
      if (q) setSearchQuery(q);

      // Pagination
      const page = params.get("page");
      if (page) setCurrentPage(parseInt(page));

      // Sort
      const sort = params.get("sort");
      if (sort) setCurrentSort(sort);

      // Filters
      const newState = getInitialFilterState(filters);
      let hasFilterChanges = false;

      filters.forEach((filter) => {
        if (filter.type === "multiselect") {
          const values = params.getAll(filter.id);
          if (values.length > 0) {
            newState[filter.id] = values;
            hasFilterChanges = true;
          }
        } else if (filter.type === "rating") {
          const value = params.get(filter.id);
          if (value) {
            newState[filter.id] = parseInt(value);
            hasFilterChanges = true;
          }
        }
      });

      if (hasFilterChanges) {
        setFilterState(newState);
      }
    };

    readFromURL();
  }, [filters]);

  // Sync to URL on state change
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams();

    // Search
    if (searchQuery) params.set("q", searchQuery);

    // Pagination
    if (currentPage > 1) params.set("page", currentPage.toString());

    // Sort
    if (currentSort && currentSort !== (defaultSort || sortOptions[0]?.id)) {
      params.set("sort", currentSort);
    }

    // Filters
    filters.forEach((filter) => {
      const value = filterState[filter.id];
      if (filter.type === "multiselect") {
        const selected = value as string[];
        if (selected.length > 0) {
          selected.forEach((v) => params.append(filter.id, v));
        }
      } else if (filter.type === "rating") {
        const rating = value as number;
        if (rating > 0) {
          params.set(filter.id, rating.toString());
        }
      }
    });

    const newSearch = params.toString();
    const newUrl = newSearch
      ? `${window.location.pathname}?${newSearch}`
      : window.location.pathname;

    if (window.location.search !== (newSearch ? `?${newSearch}` : "")) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [
    filterState,
    searchQuery,
    currentPage,
    currentSort,
    filters,
    defaultSort,
    sortOptions,
  ]);
  const filteredData = useMemo(() => {
    // First apply search
    let results = search(searchQuery);

    // Then apply filters
    results = results.filter((item: T) => {
      return filters.every((filter: FilterDefinition<T>) => {
        const stateValue = filterState[filter.id];

        if (filter.type === "multiselect") {
          const selected = stateValue as string[];
          if (selected.length === 0) return true;
          const itemValue = filter.getValue(item);
          return itemValue !== undefined && selected.includes(itemValue);
        }

        if (filter.type === "rating") {
          const minValue = stateValue as number;
          if (minValue === 0) return true;
          const itemValue = filter.getValue(item);
          return itemValue !== undefined && itemValue >= minValue;
        }

        return true;
      });
    });

    // Apply sorting
    if (currentSort && sortOptions.length > 0) {
      const sortOption = sortOptions.find(
        (opt: SortOption<T>) => opt.id === currentSort,
      );
      if (sortOption) {
        results.sort(sortOption.sortFn);
      }
    }

    return results;
  }, [filterState, searchQuery, search, filters, currentSort, sortOptions]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterState, searchQuery, currentSort]);

  // Close filter drawer on escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFilterOpen(false);
        setIsSortOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when filter is open on mobile
  React.useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Active filter count
  const activeFilterCount = filters.filter((filter: FilterDefinition<T>) => {
    const value = filterState[filter.id];
    if (filter.type === "multiselect") return (value as string[]).length > 0;
    if (filter.type === "rating") return (value as number) > 0;
    return false;
  }).length;

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilterState(getInitialFilterState(filters));
    setSearchQuery("");
    setCurrentPage(1);
  }, [filters]);

  // Render filter based on type
  const renderFilter = (filter: FilterDefinition<T>) => {
    if (filter.type === "multiselect") {
      return (
        <MultiSelect
          key={filter.id}
          label={filter.label}
          options={filterOptions[filter.id] || []}
          selected={filterState[filter.id] as string[]}
          onChange={(value) => updateFilter(filter.id, value)}
        />
      );
    }

    if (filter.type === "rating") {
      return (
        <StarRatingFilter
          key={filter.id}
          label={filter.label}
          rating={filterState[filter.id] as number}
          onChange={(value) => updateFilter(filter.id, value)}
        />
      );
    }

    return null;
  };

  // Filter content for both mobile drawer and desktop sidebar
  const FilterContent = () => <>{filters.map(renderFilter)}</>;

  // Current sort option label
  const currentSortLabel =
    sortOptions.find((opt: SortOption<T>) => opt.id === currentSort)?.label ||
    "Sort";

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-h2 md:text-h1 font-bold mb-2">
          Browse{" "}
          <span className="text-accent dark:text-darkmode-accent">{title}</span>
        </h1>
        <p className="text-text-light dark:text-darkmode-text-light">
          Explore our collection of {items.length} salsa {itemLabel}
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search Input */}
        <div className="relative flex-1">
          <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-darkmode-body rounded-xl border border-border dark:border-darkmode-border focus:border-accent dark:focus:border-darkmode-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:focus:ring-darkmode-accent/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Sort Dropdown (if sort options exist) */}
        {sortOptions.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-darkmode-body rounded-xl border border-border dark:border-darkmode-border hover:border-accent/50 dark:hover:border-darkmode-accent/50 transition-colors"
            >
              <IoSwapVertical className="w-5 h-5" />
              <span className="font-medium">{currentSortLabel}</span>
            </button>

            {isSortOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsSortOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-darkmode-body rounded-xl border border-border dark:border-darkmode-border shadow-lg z-50">
                  {sortOptions.map((option: SortOption<T>) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setCurrentSort(option.id);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-light dark:hover:bg-darkmode-light transition-colors first:rounded-t-xl last:rounded-b-xl ${
                        currentSort === option.id
                          ? "text-accent dark:text-darkmode-accent font-medium"
                          : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Filter Button (Mobile) */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-darkmode-body rounded-xl border border-border dark:border-darkmode-border hover:border-accent/50 dark:hover:border-darkmode-accent/50 transition-colors"
        >
          <IoFilter className="w-5 h-5" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-accent text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      {/* Mobile Filter Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-sm bg-body dark:bg-darkmode-body z-50 transform transition-transform duration-300 lg:hidden ${
          isFilterOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-border dark:border-darkmode-border">
            <h2 className="text-lg font-bold">Filters</h2>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="p-2 hover:bg-light dark:hover:bg-darkmode-light rounded-lg transition-colors"
            >
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <FilterContent />
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-border dark:border-darkmode-border space-y-3">
            <button
              onClick={() => {
                resetFilters();
                setIsFilterOpen(false);
              }}
              className="w-full py-3 text-center text-text-light dark:text-darkmode-text-light hover:text-text-dark dark:hover:text-darkmode-text-dark transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="w-full py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
            >
              Show {filteredData.length} Results
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="bg-white dark:bg-darkmode-body p-6 rounded-2xl border border-border dark:border-darkmode-border sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-accent dark:text-darkmode-accent hover:underline focus:outline-none"
                >
                  Reset All
                </button>
              )}
            </div>

            <FilterContent />
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-9">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-text-light dark:text-darkmode-text-light">
              Showing{" "}
              <span className="font-medium text-text-dark dark:text-darkmode-text-dark">
                {currentItems.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-text-dark dark:text-darkmode-text-dark">
                {filteredData.length}
              </span>{" "}
              {itemLabel}
            </p>

            {/* Active Filters Pills (Desktop) */}
            {activeFilterCount > 0 && (
              <div className="hidden sm:flex items-center gap-2 flex-wrap">
                {filters.map((filter: FilterDefinition<T>) => {
                  if (filter.type === "multiselect") {
                    const selected = filterState[filter.id] as string[];
                    return selected.map((value) => (
                      <button
                        key={`${filter.id}-${value}`}
                        onClick={() =>
                          updateFilter(
                            filter.id,
                            selected.filter((v) => v !== value),
                          )
                        }
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-accent/10 text-accent dark:bg-darkmode-accent/10 dark:text-darkmode-accent rounded-full hover:bg-accent/20 dark:hover:bg-darkmode-accent/20 transition-colors"
                      >
                        {value}
                        <IoClose className="w-3 h-3" />
                      </button>
                    ));
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          {/* Cards Grid */}
          {currentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentItems.map(renderCard)}
            </div>
          ) : (
            <div className="text-center py-16 bg-light/50 dark:bg-darkmode-light/50 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 dark:bg-darkmode-accent/10 flex items-center justify-center">
                <IoSearch className="w-8 h-8 text-accent dark:text-darkmode-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">No {itemLabel} found</h3>
              <p className="text-text-light dark:text-darkmode-text-light mb-6">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

export default BrowsePage;

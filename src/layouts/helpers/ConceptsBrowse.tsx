import conceptsData from ".json/concepts.json";
import BrowsePage, { relevanceSort } from "./BrowsePage";
import Card from "@/components/ui/Card";

// ============================================================================
// Search Configuration
// ============================================================================

const searchFields = [
  "frontmatter.title",
  "frontmatter.type",
  "frontmatter.level",
  "content",
];

const storeFields = ["slug", "frontmatter"];

const boostFields = {
  "frontmatter.title": 3,
  content: 1,
};

// ============================================================================
// Filter Definitions
// ============================================================================

const filters = [
  {
    id: "level",
    label: "Level",
    type: "multiselect" as const,
    getOptions: (items: typeof conceptsData) => {
      const uniqueLevels = new Set(
        items.map((item) => item.frontmatter.level).filter(Boolean),
      );
      return Array.from(uniqueLevels) as string[];
    },
    getValue: (item: (typeof conceptsData)[0]) => item.frontmatter.level,
  },
  {
    id: "type",
    label: "Type",
    type: "multiselect" as const,
    getOptions: (items: typeof conceptsData) => {
      const uniqueTypes = new Set(
        items.map((item) => item.frontmatter.type).filter(Boolean),
      );
      return Array.from(uniqueTypes) as string[];
    },
    getValue: (item: (typeof conceptsData)[0]) => item.frontmatter.type,
  },
];

// ============================================================================
// Sort Options
// ============================================================================

const sortOptions = [
  relevanceSort,
  {
    id: "title-asc",
    label: "A-Z",
    sortFn: (a: (typeof conceptsData)[0], b: (typeof conceptsData)[0]) =>
      a.frontmatter.title.localeCompare(b.frontmatter.title),
  },
  {
    id: "title-desc",
    label: "Z-A",
    sortFn: (a: (typeof conceptsData)[0], b: (typeof conceptsData)[0]) =>
      b.frontmatter.title.localeCompare(a.frontmatter.title),
  },
];

// ============================================================================
// Component
// ============================================================================

const ConceptsBrowse = () => (
  <BrowsePage
    items={conceptsData}
    idField="slug"
    searchFields={searchFields}
    storeFields={storeFields}
    boostFields={boostFields}
    title="Concepts"
    itemLabel="concepts"
    searchPlaceholder="Search concepts..."
    filters={filters}
    sortOptions={sortOptions}
    defaultSort={relevanceSort.id}
    renderCard={(item) => (
      <Card
        key={item.slug}
        title={item.frontmatter.title}
        href={`/${item.slug}`}
        level={item.frontmatter.level}
        type={item.frontmatter.type}
      />
    )}
  />
);

export default ConceptsBrowse;

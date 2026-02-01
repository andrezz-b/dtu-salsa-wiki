import movesData from ".json/moves.json";
import BrowsePage, {
  relevanceSort,
  type FilterDefinition,
  type SortOption,
} from "./BrowsePage";
import Card from "@/components/ui/Card";
import type { MoveItem } from "@/types/content";

const moves = movesData as MoveItem[];

// ============================================================================
// Search Configuration
// ============================================================================

const searchFields = [
  "frontmatter.title",
  "frontmatter.aliases",
  "frontmatter.type",
  "frontmatter.level",
  "content",
];

const storeFields = ["slug", "frontmatter"];

const boostFields = {
  "frontmatter.title": 3,
  "frontmatter.aliases": 2,
  content: 1,
};

// ============================================================================
// Filter Definitions
// ============================================================================

const filters: FilterDefinition<MoveItem>[] = [
  {
    id: "level",
    label: "Level",
    type: "multiselect" as const,
    getOptions: (items: MoveItem[]) => {
      const uniqueLevels = new Set(
        items.map((item) => item.frontmatter.level).filter(Boolean),
      );
      return Array.from(uniqueLevels) as string[];
    },
    getValue: (item: MoveItem) => item.frontmatter.level,
  },
  {
    id: "type",
    label: "Type",
    type: "multiselect" as const,
    getOptions: (items: MoveItem[]) => {
      const uniqueTypes = new Set(
        items.map((item) => item.frontmatter.type).filter(Boolean),
      );
      return Array.from(uniqueTypes) as string[];
    },
    getValue: (item: MoveItem) => item.frontmatter.type,
  },
  {
    id: "difficulty",
    label: "Difficulty",
    type: "rating",
    getValue: (item: MoveItem) => item.frontmatter.difficulty,
  },
];

// ============================================================================
// Sort Options (Ready for future use)
// ============================================================================

const sortOptions: SortOption<MoveItem>[] = [
  relevanceSort,
  {
    id: "title-asc",
    label: "A-Z",
    sortFn: (a: MoveItem, b: MoveItem) =>
      a.frontmatter.title.localeCompare(b.frontmatter.title),
  },
  {
    id: "title-desc",
    label: "Z-A",
    sortFn: (a: MoveItem, b: MoveItem) =>
      b.frontmatter.title.localeCompare(a.frontmatter.title),
  },
  {
    id: "difficulty-asc",
    label: "Easiest First",
    sortFn: (a: MoveItem, b: MoveItem) =>
      (a.frontmatter.difficulty || 0) - (b.frontmatter.difficulty || 0),
  },
  {
    id: "difficulty-desc",
    label: "Hardest First",
    sortFn: (a: MoveItem, b: MoveItem) =>
      (b.frontmatter.difficulty || 0) - (a.frontmatter.difficulty || 0),
  },
];

// ============================================================================
// Component
// ============================================================================

const MovesBrowse = () => (
  <BrowsePage<MoveItem>
    items={moves}
    idField="slug"
    searchFields={searchFields}
    storeFields={storeFields}
    boostFields={boostFields}
    title="Moves"
    itemLabel="moves"
    searchPlaceholder="Search moves..."
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
        difficulty={item.frontmatter.difficulty}
      />
    )}
  />
);

export default MovesBrowse;

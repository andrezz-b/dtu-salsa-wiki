import movesData from ".json/moves.json";
import React, { useState, useMemo } from "react";
import MultiSelect from "./MultiSelect";
import StarRatingFilter from "./StarRatingFilter";
import Card from "./Card";
import Pagination from "./Pagination";
import { IoSearch, IoFilter, IoClose } from "react-icons/io5";

interface IMoveItem {
  slug: string;
  frontmatter: {
    title: string;
    aliases?: string[];
    type: string;
    level: string;
    difficulty: number;
    description?: string;
  };
}

const MovesBrowse = () => {
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minDifficulty, setMinDifficulty] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  const allData = movesData as IMoveItem[];

  // Extract unique options
  const levels = useMemo(() => {
    const uniqueLevels = new Set(
      allData.map((item) => item.frontmatter.level).filter(Boolean),
    );
    return Array.from(uniqueLevels);
  }, [allData]);

  const types = useMemo(() => {
    const uniqueTypes = new Set(
      allData.map((item) => item.frontmatter.type).filter(Boolean),
    );
    return Array.from(uniqueTypes);
  }, [allData]);

  const filteredData = useMemo(() => {
    return allData.filter((item) => {
      if (
        selectedLevels.length > 0 &&
        !selectedLevels.includes(item.frontmatter.level)
      )
        return false;

      if (
        selectedTypes.length > 0 &&
        !selectedTypes.includes(item.frontmatter.type)
      )
        return false;

      if (minDifficulty > 0 && item.frontmatter.difficulty < minDifficulty)
        return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const title = item.frontmatter.title.toLowerCase();
        const aliases = item.frontmatter.aliases?.join(" ").toLowerCase() || "";
        return title.includes(q) || aliases.includes(q);
      }

      return true;
    });
  }, [selectedLevels, selectedTypes, minDifficulty, searchQuery, allData]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedLevels, selectedTypes, minDifficulty, searchQuery]);

  // Close filter drawer on escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFilterOpen(false);
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

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeFilterCount = [
    selectedLevels.length > 0,
    selectedTypes.length > 0,
    minDifficulty > 0,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSelectedLevels([]);
    setSelectedTypes([]);
    setMinDifficulty(0);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const FilterContent = () => (
    <>
      {/* Level Filter */}
      <MultiSelect
        label="Level"
        options={levels}
        selected={selectedLevels}
        onChange={setSelectedLevels}
      />

      {/* Type Filter */}
      <MultiSelect
        label="Type"
        options={types}
        selected={selectedTypes}
        onChange={setSelectedTypes}
      />

      {/* Difficulty Filter */}
      <StarRatingFilter
        label="Min Difficulty"
        rating={minDifficulty}
        onChange={setMinDifficulty}
      />
    </>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-h2 md:text-h1 font-bold mb-2">
          Browse <span className="text-accent dark:text-darkmode-accent">Moves</span>
        </h1>
        <p className="text-text-light dark:text-darkmode-text-light">
          Explore our collection of {allData.length} salsa moves
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search Input */}
        <div className="relative flex-1">
          <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search moves..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-darkmode-body rounded-xl border border-border dark:border-darkmode-border focus:border-accent dark:focus:border-darkmode-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:focus:ring-darkmode-accent/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

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
              Showing <span className="font-medium text-text-dark dark:text-darkmode-text-dark">{currentItems.length}</span> of{" "}
              <span className="font-medium text-text-dark dark:text-darkmode-text-dark">{filteredData.length}</span> moves
            </p>

            {/* Active Filters Pills (Desktop) */}
            {activeFilterCount > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                {selectedLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevels(selectedLevels.filter((l) => l !== level))}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-accent/10 text-accent dark:bg-darkmode-accent/10 dark:text-darkmode-accent rounded-full hover:bg-accent/20 dark:hover:bg-darkmode-accent/20 transition-colors"
                  >
                    {level}
                    <IoClose className="w-3 h-3" />
                  </button>
                ))}
                {selectedTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTypes(selectedTypes.filter((t) => t !== type))}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-accent/10 text-accent dark:bg-darkmode-accent/10 dark:text-darkmode-accent rounded-full hover:bg-accent/20 dark:hover:bg-darkmode-accent/20 transition-colors"
                  >
                    {type}
                    <IoClose className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cards Grid */}
          {currentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentItems.map((item) => (
                <Card
                  key={item.slug}
                  title={item.frontmatter.title}
                  href={`/${item.slug}`}
                  level={item.frontmatter.level}
                  type={item.frontmatter.type}
                  difficulty={item.frontmatter.difficulty}
                  description={item.frontmatter.description}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-light/50 dark:bg-darkmode-light/50 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 dark:bg-darkmode-accent/10 flex items-center justify-center">
                <IoSearch className="w-8 h-8 text-accent dark:text-darkmode-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">No moves found</h3>
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
};

export default MovesBrowse;

import movesData from ".json/moves.json";
import React, { useState, useMemo } from "react";
import { titleify } from "@/lib/utils/textConverter";
import MultiSelect from "./MultiSelect";
import StarRatingFilter from "./StarRatingFilter";
import Badge from "./Badge";
import StarRatingDisplay from "./StarRatingDisplay";
import Card from "./Card";
import Breadcrumbs from "./Breadcrumbs";
import Pagination from "./Pagination";

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

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

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
      // Filter by Level
      if (
        selectedLevels.length > 0 &&
        !selectedLevels.includes(item.frontmatter.level)
      )
        return false;

      // Filter by Type
      if (
        selectedTypes.length > 0 &&
        !selectedTypes.includes(item.frontmatter.type)
      )
        return false;

      // Filter by Difficulty (Min)
      if (minDifficulty > 0 && item.frontmatter.difficulty < minDifficulty)
        return false;

      // Filter by Search Query (Title & Aliases)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const title = item.frontmatter.title.toLowerCase();
        const aliases = item.frontmatter.aliases?.join(" ").toLowerCase() || "";
        return title.includes(q) || aliases.includes(q);
      }

      return true;
    });
  }, [selectedLevels, selectedTypes, minDifficulty, searchQuery, allData]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedLevels, selectedTypes, minDifficulty, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSelectedLevels([]);
    setSelectedTypes([]);
    setMinDifficulty(0);
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Mobile Title & Breadcrumbs */}
      <div className="mb-8 border-b border-border dark:border-darkmode-border pb-8 lg:hidden">
        <Breadcrumbs
          className="mb-4"
          parts={[{ label: "Home", href: "/" }, { label: "Moves" }]}
        />
        <h1 className="h1">Browse Moves</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-3 mb-8 lg:mb-0">
          <div className="bg-light dark:bg-darkmode-light p-6 rounded-lg sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h3 className="h5">Filters</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-accent dark:text-darkmode-accent hover:underline focus:outline-none"
              >
                Reset All
              </button>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search moves..."
                className="form-input w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

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
              label="Difficulty"
              rating={minDifficulty}
              onChange={setMinDifficulty}
            />
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-9">
          {/* Desktop Title & Breadcrumbs */}
          <div className="mb-8 border-b border-border dark:border-darkmode-border pb-8 hidden lg:block">
            <Breadcrumbs
              className="mb-4"
              parts={[{ label: "Home", href: "/" }, { label: "Moves" }]}
            />
            <h1 className="h1">Browse Moves</h1>
          </div>

          <div className="row">
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <div key={item.slug} className="md:col-6 mb-6">
                  <Card
                    title={item.frontmatter.title}
                    href={`/${item.slug}`}
                    level={item.frontmatter.level}
                    type={item.frontmatter.type}
                    difficulty={item.frontmatter.difficulty}
                    description={item.frontmatter.description}
                  />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-12">
                <p className="text-lg text-gray-500">
                  No moves found matching your filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 btn btn-outline-primary btn-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

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

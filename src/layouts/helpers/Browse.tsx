import searchData from ".json/search.json";
import React, { useState, useMemo } from "react";
import { titleify } from "@/lib/utils/textConverter";

// Re-using interface from SearchResult or defining here if simpler
interface IBrowseItem {
  group: string;
  slug: string;
  frontmatter: {
    title: string;
    image?: string;
    description?: string;
    categories?: string[];
    tags?: string[];
    level?: string;
    difficulty?: number;
    type?: string;
  };
  content: string;
}

const Browse = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const allData = searchData as IBrowseItem[];

  // Extract unique options
  const types = useMemo(() => {
    const uniqueTypes = new Set(
      allData.map((item) => item.frontmatter.type).filter(Boolean),
    );
    return Array.from(uniqueTypes);
  }, [allData]);

  const filteredData = useMemo(() => {
    return allData.filter((item) => {
      // Filter by Group (Moves/Concepts)
      if (selectedGroup !== "all" && item.group !== selectedGroup) return false;

      // Filter by Level
      if (selectedLevel !== "all" && item.frontmatter.level !== selectedLevel)
        return false;

      // Filter by Type
      if (selectedType !== "all" && item.frontmatter.type !== selectedType)
        return false;

      // Filter by Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const title = item.frontmatter.title.toLowerCase();
        const tags = item.frontmatter.tags?.join(" ").toLowerCase() || "";
        return title.includes(q) || tags.includes(q);
      }

      return true;
    });
  }, [selectedGroup, selectedLevel, selectedType, searchQuery, allData]);

  return (
    <div className="row">
      {/* Sidebar Filters */}
      <div className="lg:col-3 mb-8 lg:mb-0">
        <div className="bg-theme-light dark:bg-darkmode-theme-light p-6 rounded-lg sticky top-24">
          <h3 className="h5 mb-4">Filters</h3>

          {/* Search Input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search..."
              className="form-input w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Group Filter */}
          <div className="mb-6">
            <h4 className="h6 mb-2">Category</h4>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio text-primary"
                  name="group"
                  value="all"
                  checked={selectedGroup === "all"}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                />
                <span className="ml-2">All</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio text-primary"
                  name="group"
                  value="moves"
                  checked={selectedGroup === "moves"}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                />
                <span className="ml-2">Moves</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio text-primary"
                  name="group"
                  value="concepts"
                  checked={selectedGroup === "concepts"}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                />
                <span className="ml-2">Concepts</span>
              </label>
            </div>
          </div>

          {/* Level Filter */}
          <div className="mb-6">
            <h4 className="h6 mb-2">Level</h4>
            <select
              className="form-select w-full"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="mb-6">
            <h4 className="h6 mb-2">Type</h4>
            <select
              className="form-select w-full"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              {types.map((type) => (
                <option key={type as string} value={type as string}>
                  {titleify(type as string)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="lg:col-9">
        <div className="row">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <div key={item.slug} className="md:col-6 mb-6">
                <div
                  className={`bg-white dark:bg-darkmode-theme-light rounded-lg shadow p-6 h-full border-l-4 transition-transform hover:-translate-y-1 ${
                    item.frontmatter.level === "beginner"
                      ? "border-green-500"
                      : item.frontmatter.level === "intermediate"
                        ? "border-yellow-500"
                        : item.frontmatter.level === "advanced"
                          ? "border-red-500"
                          : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      {item.group}
                    </span>
                    {item.frontmatter.difficulty && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Diff: {item.frontmatter.difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="h5 mb-2">
                    <a
                      href={`/${item.group}/${item.slug}`}
                      className="hover:text-primary stretched-link"
                    >
                      {item.frontmatter.title}
                    </a>
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {item.frontmatter.level && (
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          item.frontmatter.level === "beginner"
                            ? "bg-green-100 text-green-800"
                            : item.frontmatter.level === "intermediate"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {titleify(item.frontmatter.level)}
                      </span>
                    )}
                    {item.frontmatter.type && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {titleify(item.frontmatter.type)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-12">
              <p className="text-lg text-gray-500">
                No results found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;

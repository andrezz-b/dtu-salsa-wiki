import searchData from ".json/search.json";
import MiniSearch from "minisearch";
import React, { useEffect, useMemo, useState } from "react";
import { IoSearch, IoClose } from "react-icons/io5";
import SearchResult, { type ISearchItem } from "./SearchResult";

const SearchModal = () => {
  const [searchString, setSearchString] = useState("");

  // handle input change
  const handleSearch = (e: React.FormEvent<HTMLInputElement>) => {
    setSearchString(e.currentTarget.value.replace("\\", "").toLowerCase());
  };

  // Initialize MiniSearch once with optimized configuration
  const miniSearch = useMemo(() => {
    const ms = new MiniSearch({
      fields: [
        "frontmatter.title",
        "frontmatter.type",
        "frontmatter.level",
        "frontmatter.description",
        "content",
        "frontmatter.tags",
        "frontmatter.aliases",
      ],
      storeFields: ["slug", "group", "frontmatter", "content"],
      // Extract nested fields and handle arrays
      extractField: (document, fieldName) => {
        const value = fieldName
          .split(".")
          .reduce((doc: any, key: string) => doc && doc[key], document);
        // Handle arrays (aliases, tags)
        if (Array.isArray(value)) {
          return value.join(" ");
        }
        return value;
      },
      // Custom tokenizer for better matching
      tokenize: (text: string) => {
        return text
          .toLowerCase()
          .split(/[\s\-_/]+/)
          .filter((token) => token.length > 0);
      },
      searchOptions: {
        // Enable prefix matching for partial words
        prefix: true,
        // Dynamic fuzzy matching based on term length
        fuzzy: (term: string) => {
          if (term.length <= 2) return 0;
          if (term.length <= 4) return 0.1;
          return 0.2;
        },
        // Use OR combiner for broader results
        combineWith: "OR",
        // Field boosting - title and aliases are most important
        boost: {
          "frontmatter.title": 4,
          "frontmatter.aliases": 3,
          "frontmatter.description": 1.5,
          "content": 1,
        },
        // Weight prefix and fuzzy matches
        weights: {
          fuzzy: 0.3,
          prefix: 0.6,
        },
      },
    });

    // Index all documents
    ms.addAll(searchData.map((item) => ({ id: item.slug, ...item })));
    return ms;
  }, []);

  // Generate search result
  const { searchResult, totalTime } = useMemo(() => {
    const startTime = performance.now();
    if (searchString === "") {
      return { searchResult: [], totalTime: "0.000" };
    }

    const results = miniSearch.search(searchString);
    const endTime = performance.now();

    const mappedResults = results.map((result: any) => ({
      slug: result.slug,
      group: result.group,
      frontmatter: result.frontmatter,
      content: result.content,
    })) as ISearchItem[];

    return {
      searchResult: mappedResults,
      totalTime: ((endTime - startTime) / 1000).toFixed(3),
    };
  }, [searchString, miniSearch]);

  // search dom manipulation
  useEffect(() => {
    const searchModal = document.getElementById("searchModal");
    const searchInput = document.getElementById("searchInput");
    const searchModalOverlay = document.getElementById("searchModalOverlay");
    const searchResultItems = document.querySelectorAll("[data-search-item]");
    const searchModalTriggers = document.querySelectorAll(
      "[data-search-trigger]",
    );

    // search modal open
    searchModalTriggers.forEach((button) => {
      button.addEventListener("click", function () {
        const searchModal = document.getElementById("searchModal");
        searchModal!.classList.add("show");
        searchInput!.focus();
      });
    });

    // search modal close
    searchModalOverlay!.addEventListener("click", function () {
      searchModal!.classList.remove("show");
    });

    // keyboard navigation
    let selectedIndex = -1;

    const updateSelection = () => {
      searchResultItems.forEach((item, index) => {
        if (index === selectedIndex) {
          item.classList.add("search-result-item-active");
        } else {
          item.classList.remove("search-result-item-active");
        }
      });

      searchResultItems[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    };

    document.addEventListener("keydown", function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        searchModal!.classList.add("show");
        searchInput!.focus();
        updateSelection();
      }

      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
      }

      if (event.key === "Escape") {
        searchModal!.classList.remove("show");
      }

      if (event.key === "ArrowUp" && selectedIndex > 0) {
        selectedIndex--;
      } else if (
        event.key === "ArrowDown" &&
        selectedIndex < searchResultItems.length - 1
      ) {
        selectedIndex++;
      } else if (event.key === "Enter") {
        const activeLink = document.querySelector(
          ".search-result-item-active a",
        ) as HTMLAnchorElement;
        if (activeLink) {
          activeLink?.click();
        }
      }

      updateSelection();
    });
  }, [searchString]);

  return (
    <div id="searchModal" className="search-modal">
      <div id="searchModalOverlay" className="search-modal-overlay" />
      <div className="search-wrapper">
        <div className="search-wrapper-header">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <IoSearch className="w-5 h-5" />
            </span>
            <input
              id="searchInput"
              placeholder="Search moves, concepts, and more..."
              className="search-wrapper-header-input"
              type="text"
              name="search"
              value={searchString}
              onChange={handleSearch}
              autoComplete="off"
            />
            {searchString && (
              <button
                onClick={() => setSearchString("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent dark:hover:text-darkmode-accent transition-colors p-1 rounded-lg hover:bg-light dark:hover:bg-darkmode-light"
                aria-label="Clear search"
              >
                <IoClose className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        <SearchResult searchResult={searchResult} searchString={searchString} />
        <div className="search-wrapper-footer">
          <span className="flex items-center gap-1">
            <kbd>
              <svg
                width="12"
                height="12"
                fill="currentcolor"
                viewBox="0 0 16 16"
              >
                <path d="M3.204 11h9.592L8 5.519 3.204 11zm-.753-.659 4.796-5.48a1 1 0 011.506.0l4.796 5.48c.566.647.106 1.659-.753 1.659H3.204a1 1 0 01-.753-1.659z"></path>
              </svg>
            </kbd>
            <kbd>
              <svg
                width="12"
                height="12"
                fill="currentcolor"
                viewBox="0 0 16 16"
              >
                <path d="M3.204 5h9.592L8 10.481 3.204 5zm-.753.659 4.796 5.48a1 1 0 001.506.0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 00-.753 1.659z"></path>
              </svg>
            </kbd>
            <span className="ml-1">Navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd>
              <svg
                width="10"
                height="10"
                fill="currentcolor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M14.5 1.5a.5.5.0 01.5.5v4.8a2.5 2.5.0 01-2.5 2.5H2.707l3.347 3.346a.5.5.0 01-.708.708l-4.2-4.2a.5.5.0 010-.708l4-4a.5.5.0 11.708.708L2.707 8.3H12.5A1.5 1.5.0 0014 6.8V2a.5.5.0 01.5-.5z"
                ></path>
              </svg>
            </kbd>
            <span className="ml-1">Select</span>
          </span>
          {searchString && (
            <span className="text-text-light dark:text-darkmode-text-light">
              <strong className="text-text-dark dark:text-darkmode-text-dark">{searchResult.length}</strong> results
            </span>
          )}
          <span className="flex items-center gap-1">
            <kbd>ESC</kbd>
            <span className="ml-1">Close</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

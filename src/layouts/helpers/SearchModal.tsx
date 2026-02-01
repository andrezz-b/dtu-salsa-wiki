import searchData from ".json/search.json";
import { useSearch } from "@/hooks/useSearch";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { IoSearch, IoClose } from "react-icons/io5";
import SearchResult from "./SearchResult";

const fields = [
  "frontmatter.title",
  "frontmatter.type",
  "frontmatter.level",
  "content",
  "frontmatter.tags",
  "frontmatter.aliases",
];

const storeFields = ["slug", "group", "frontmatter", "content"];

const boostFields = {
  "frontmatter.title": 4,
  "frontmatter.aliases": 3,
  content: 1,
};

const SearchModal = () => {
  const [searchString, setSearchString] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // handle input change
  const handleSearch = (e: React.FormEvent<HTMLInputElement>) => {
    setSearchString(e.currentTarget.value.replace("\\", "").toLowerCase());
    setSelectedIndex(-1); // Reset selection on search change
  };

  const { search } = useSearch({
    items: searchData,
    fields,
    storeFields,
    idField: "slug",
    boostFields,
  });

  // Generate search result
  const searchResult = useMemo(
    () => search(searchString),
    [searchString, search],
  );

  // Handle external triggers
  useEffect(() => {
    const handleTriggerClick = () => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    };

    const triggers = document.querySelectorAll("[data-search-trigger]");
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", handleTriggerClick);
    });

    return () => {
      triggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleTriggerClick);
      });
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }

      if (!isOpen) return;

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResult.length - 1 ? prev + 1 : prev,
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResult.length) {
          const selectedItem = searchResult[selectedIndex];
          window.location.href = `/${selectedItem.slug}`;
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, searchResult, selectedIndex]);

  // Reset selected index when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Close modal when clicking outside (overlay)
  const handleOverlayClick = () => {
    setIsOpen(false);
  };

  return (
    <div id="searchModal" className={`search-modal ${isOpen ? "show" : ""}`}>
      <div
        id="searchModalOverlay"
        className="search-modal-overlay"
        onClick={handleOverlayClick}
      />
      <div className="search-wrapper">
        <div className="search-wrapper-header">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <IoSearch className="w-5 h-5" />
            </span>
            <input
              ref={inputRef}
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
                onClick={() => {
                  setSearchString("");
                  inputRef.current?.focus();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent dark:hover:text-darkmode-accent transition-colors p-1 rounded-lg hover:bg-light dark:hover:bg-darkmode-light"
                aria-label="Clear search"
              >
                <IoClose className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        <SearchResult
          searchResult={searchResult}
          searchString={searchString}
          selectedIndex={selectedIndex}
        />
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
              <strong className="text-text-dark dark:text-darkmode-text-dark">
                {searchResult.length}
              </strong>{" "}
              results
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

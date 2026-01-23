import { plainify } from "@/lib/utils/textConverter";
import React from "react";
import { FaRunning, FaLightbulb } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import StarRatingDisplay from "./StarRatingDisplay";

export interface ISearchItem {
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
    aliases?: string[];
  };
  content: string;
}

const getLevelColor = (level: string) => {
  switch (level) {
    case "beginner":
      return "bg-level-beginner dark:bg-darkmode-level-beginner";
    case "intermediate":
      return "bg-level-intermediate dark:bg-darkmode-level-intermediate";
    case "advanced":
      return "bg-level-advanced dark:bg-darkmode-level-advanced";
    default:
      return "bg-gray-400";
  }
};

// search result component
const SearchResult = ({
  searchResult,
  searchString,
}: {
  searchResult: ISearchItem[];
  searchString: string;
}) => {
  // match marker
  const matchMarker = (text: string, substring: string) => {
    const parts = text.split(new RegExp(`(${substring})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === substring.toLowerCase() ? (
        <mark key={index}>{part}</mark>
      ) : (
        part
      ),
    );
  };

  // match underline
  const matchUnderline = (text: string, substring: string) => {
    const parts = text?.split(new RegExp(`(${substring})`, "gi"));
    return parts?.map((part, index) =>
      part.toLowerCase() === substring.toLowerCase() ? (
        <mark key={index}>{part}</mark>
      ) : (
        part
      ),
    );
  };

  // match content
  const matchContent = (content: string, substring: string) => {
    const plainContent = plainify(content);
    const position = plainContent
      .toLowerCase()
      .indexOf(substring.toLowerCase());

    if (position === -1) return null;

    // Find the start of the word containing the substring
    let wordStart = position;
    while (wordStart > 0 && plainContent[wordStart - 1] !== " ") {
      wordStart--;
    }

    const matches = plainContent.substring(
      wordStart,
      substring.length + position,
    );
    const matchesAfter = plainContent.substring(
      substring.length + position,
      substring.length + position + 80,
    );
    return (
      <>
        {matchMarker(matches, substring)}
        {matchesAfter}...
      </>
    );
  };

  const getItemIcon = (group: string) => {
    if (group === "moves") {
      return <FaRunning className="w-4 h-4" />;
    }
    return <FaLightbulb className="w-4 h-4" />;
  };

  return (
    <div className="search-wrapper-body">
      {searchString ? (
        <div className="search-result">
          {searchResult.length > 0 ? (
            <div className="flex flex-col gap-3">
              {searchResult.map((item) => (
                <div
                  key={item.slug}
                  data-search-item
                  className="search-result-item group"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-light dark:bg-darkmode-light flex items-center justify-center text-gray-400 group-hover:text-accent dark:group-hover:text-darkmode-accent transition-colors">
                      {getItemIcon(item.group)}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          {item.frontmatter.type || item.group}
                        </span>
                        {item.frontmatter.level && (
                          <span
                            className={`w-2 h-2 rounded-full ${getLevelColor(item.frontmatter.level)}`}
                            title={item.frontmatter.level}
                          />
                        )}
                        {item.frontmatter.difficulty !== undefined && (
                          <StarRatingDisplay rating={item.frontmatter.difficulty} />
                        )}
                      </div>

                      <h3 className="mb-1">
                        <a
                          href={`/${item.slug}`}
                          className="search-result-item-title search-result-item-link"
                        >
                          {matchUnderline(item.frontmatter.title, searchString)}
                        </a>
                      </h3>

                      {item.frontmatter.aliases &&
                        item.frontmatter.aliases.length > 0 && (
                          <div className="text-xs text-text-light dark:text-darkmode-text-light mb-1">
                            <span className="text-gray-400">Also known as: </span>
                            {item.frontmatter.aliases.map((alias, index) => (
                              <span key={index}>
                                {matchUnderline(alias, searchString)}
                                {index < item.frontmatter.aliases!.length - 1 &&
                                  ", "}
                              </span>
                            ))}
                          </div>
                        )}

                      {item.content && matchContent(item.content, searchString) && (
                        <p className="search-result-item-content">
                          {matchContent(item.content, searchString)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="search-result-empty">
              <div className="w-16 h-16 rounded-full bg-light dark:bg-darkmode-light flex items-center justify-center mx-auto mb-4">
                <IoSearch className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-lg font-medium text-text-dark dark:text-darkmode-text-dark mb-1">
                No results found
              </p>
              <p className="text-sm">
                No results for &quot;<strong className="text-accent dark:text-darkmode-accent">{searchString}</strong>&quot;
              </p>
              <p className="text-xs mt-2">Try different keywords or check for typos</p>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-light dark:bg-darkmode-light flex items-center justify-center mx-auto mb-4">
            <IoSearch className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-lg font-medium text-text-dark dark:text-darkmode-text-dark mb-1">
            Search the wiki
          </p>
          <p className="text-sm text-text-light dark:text-darkmode-text-light">
            Find moves, concepts, and more...
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResult;

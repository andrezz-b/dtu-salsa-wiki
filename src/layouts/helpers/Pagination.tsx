import React from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const hasPrevPage = currentPage > 1;
  const hasNextPage = totalPages > currentPage;

  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    let l;
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const pageList = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-12"
      aria-label="Pagination"
    >
      {/* Previous */}
      <button
        onClick={() => hasPrevPage && onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
          hasPrevPage
            ? "text-text-dark dark:text-darkmode-text-dark hover:bg-light dark:hover:bg-darkmode-light"
            : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
        }`}
        aria-label="Previous page"
      >
        <IoChevronBack className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageList.map((pagination, i) =>
          pagination === "..." ? (
            <span
              key={`dots-${i}`}
              className="w-10 h-10 flex items-center justify-center text-gray-400"
            >
              ...
            </span>
          ) : pagination === currentPage ? (
            <span
              key={i}
              aria-current="page"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent text-white font-medium"
            >
              {pagination}
            </span>
          ) : (
            <button
              key={i}
              onClick={() => onPageChange(pagination as number)}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-text-dark dark:text-darkmode-text-dark hover:bg-light dark:hover:bg-darkmode-light font-medium transition-colors"
            >
              {pagination}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => hasNextPage && onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
          hasNextPage
            ? "text-text-dark dark:text-darkmode-text-dark hover:bg-light dark:hover:bg-darkmode-light"
            : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
        }`}
        aria-label="Next page"
      >
        <IoChevronForward className="w-5 h-5" />
      </button>
    </nav>
  );
};

export default Pagination;

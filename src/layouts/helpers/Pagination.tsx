import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  section?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  section,
}) => {
  const hasPrevPage = currentPage > 1;
  const hasNextPage = totalPages > currentPage;

  const getPageNumbers = () => {
    const delta = 1; // Number of pages to show on each side of current page
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
      className="flex items-center justify-center space-x-2 mt-8"
      aria-label="Pagination"
    >
      {/* First Page */}
      {currentPage > 2 && (
        <button
          onClick={() => onPageChange(1)}
          className="rounded px-2 py-1.5 text-text-dark hover:bg-light dark:text-darkmode-text-dark dark:hover:bg-darkmode-light"
          aria-label="First Page"
        >
          <span className="sr-only">First</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            height="20"
            width="20"
          >
            <path
              fillRule="evenodd"
              d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      {/* Previous */}
      {hasPrevPage ? (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded px-2 py-1.5 text-text-dark hover:bg-light dark:text-darkmode-text-dark dark:hover:bg-darkmode-light"
        >
          <span className="sr-only">Previous</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            height="30"
            width="30"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ) : (
        <span className="rounded px-2 py-1.5 text-text-light cursor-not-allowed">
          <span className="sr-only">Previous</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            height="30"
            width="30"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}

      {/* Page Numbers */}
      {pageList.map((pagination, i) =>
        pagination === "..." ? (
          <span key={`dots-${i}`} className="px-2 py-2 text-text-light">
            ...
          </span>
        ) : pagination === currentPage ? (
          <span
            key={i}
            aria-current="page"
            className="rounded bg-primary px-4 py-2 text-white dark:bg-darkmode-primary dark:text-text-dark"
          >
            {pagination}
          </span>
        ) : (
          <button
            key={i}
            onClick={() => onPageChange(pagination as number)}
            aria-current="page"
            className="rounded px-4 py-2 text-text-dark hover:bg-light dark:text-darkmode-text-dark dark:hover:bg-darkmode-light"
          >
            {pagination}
          </button>
        )
      )}

      {/* Next */}
      {hasNextPage ? (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded px-2 py-1.5 text-text-dark hover:bg-light dark:text-darkmode-text-dark dark:hover:bg-darkmode-light"
        >
          <span className="sr-only">Next</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            height="30"
            width="30"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ) : (
        <span className="rounded px-2 py-1.5 text-text-light cursor-not-allowed">
          <span className="sr-only">Next</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            height="30"
            width="30"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}

      {/* Last Page */}
      {currentPage < totalPages - 1 && (
        <button
          onClick={() => onPageChange(totalPages)}
          className="rounded px-2 py-1.5 text-text-dark hover:bg-light dark:text-darkmode-text-dark dark:hover:bg-darkmode-light"
          aria-label="Last Page"
        >
          <span className="sr-only">Last</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            height="20"
            width="20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </nav>
  );
};

export default Pagination;

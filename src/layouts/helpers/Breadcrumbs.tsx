import React from "react";
import { FaChevronRight } from "react-icons/fa";

interface BreadcrumbPart {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  parts: BreadcrumbPart[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ parts, className = "" }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-sm text-gray-500 dark:text-gray-400 ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-2">
        {parts.map((part, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <FaChevronRight className="w-3 h-3 text-gray-400" />}
            {part.href ? (
              <a
                href={part.href}
                className="hover:text-accent dark:hover:text-darkmode-accent transition-colors"
              >
                {part.label}
              </a>
            ) : (
              <span
                className="font-medium text-text dark:text-darkmode-text"
                aria-current="page"
              >
                {part.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

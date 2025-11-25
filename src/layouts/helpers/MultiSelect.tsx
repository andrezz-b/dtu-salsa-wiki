import React, { useState, useRef, useEffect } from "react";
import { titleify } from "@/lib/utils/textConverter";

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative mb-6" ref={containerRef}>
      <h4 className="h6 mb-2">{label}</h4>
      <div
        className="form-input w-full cursor-pointer flex justify-between items-center dark:bg-darkmode-light dark:text-darkmode-text dark:border-darkmode-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selected.length > 0
            ? `${selected.length} selected`
            : `Select ${label}`}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-darkmode-light border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto dark:text-darkmode-text">
          {options.map((option) => (
            <div
              key={option}
              className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-darkmode-border cursor-pointer"
              onClick={() => toggleOption(option)}
            >
              <input
                type="checkbox"
                className="form-checkbox text-accent rounded mr-2"
                checked={selected.includes(option)}
                readOnly
              />
              <span className="text-sm">{titleify(option)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;

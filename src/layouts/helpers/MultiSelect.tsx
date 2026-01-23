import React, { useState, useRef, useEffect } from "react";
import { titleify } from "@/lib/utils/textConverter";
import { IoChevronDown, IoCheckmark } from "react-icons/io5";

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
      <label className="block text-sm font-medium text-text-dark dark:text-darkmode-text-dark mb-2">
        {label}
      </label>
      <button
        type="button"
        className={`w-full px-4 py-3 bg-white dark:bg-darkmode-body rounded-xl border ${
          isOpen
            ? "border-accent dark:border-darkmode-accent ring-2 ring-accent/20 dark:ring-darkmode-accent/20"
            : "border-border dark:border-darkmode-border"
        } text-left flex justify-between items-center transition-all hover:border-accent/50 dark:hover:border-darkmode-accent/50`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate ${selected.length === 0 ? "text-gray-400" : "text-text-dark dark:text-darkmode-text-dark"}`}>
          {selected.length > 0
            ? `${selected.length} selected`
            : `All ${label.toLowerCase()}s`}
        </span>
        <IoChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-darkmode-body border border-border dark:border-darkmode-border rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-auto py-2">
            {options.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    isSelected
                      ? "bg-accent/5 dark:bg-darkmode-accent/5"
                      : "hover:bg-light dark:hover:bg-darkmode-light"
                  }`}
                  onClick={() => toggleOption(option)}
                >
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                      isSelected
                        ? "bg-accent border-accent dark:bg-darkmode-accent dark:border-darkmode-accent"
                        : "border-border dark:border-darkmode-border"
                    }`}
                  >
                    {isSelected && <IoCheckmark className="w-3 h-3 text-white dark:text-darkmode-body" />}
                  </span>
                  <span className={`text-sm font-medium ${isSelected ? "text-accent dark:text-darkmode-accent" : "text-text-dark dark:text-darkmode-text-dark"}`}>
                    {titleify(option)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;

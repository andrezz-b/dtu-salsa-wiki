import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

interface StarRatingFilterProps {
  label: string;
  rating: number; // 0 means no filter or "All"
  onChange: (rating: number) => void;
}

const StarRatingFilter: React.FC<StarRatingFilterProps> = ({
  label,
  rating,
  onChange,
}) => {
  return (
    <div className="mb-6">
      <h4 className="h6 mb-2">{label}</h4>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-xl focus:outline-none transition-colors ${
              star <= rating ? "text-yellow-400" : "text-gray-400 dark:text-gray-600"
            }`}
            onClick={() => onChange(star === rating ? 0 : star)} // Click again to deselect
            title={`Filter by ${star} stars`}
          >
            <FaStar />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {rating > 0 ? `& up` : "All"}
        </span>
      </div>
    </div>
  );
};

export default StarRatingFilter;

import React from "react";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

interface StarRatingDisplayProps {
  rating: number;
  max?: number;
  size?: number;
  color?: string;
}

const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({
  rating,
  max = 5,
  size = 16,
  color = "text-yellow-400",
}) => {
  return (
    <div className="flex items-center gap-0.5" title={`Difficulty: ${rating}/${max}`}>
      {[...Array(max)].map((_, i) => {
        const fullStar = i + 1 <= rating;
        const halfStar = i + 0.5 === rating;

        return (
          <span key={i} className={color} style={{ fontSize: size }}>
            {fullStar ? (
              <FaStar />
            ) : halfStar ? (
              <FaStarHalfAlt />
            ) : (
              <FaRegStar className="text-gray-400 dark:text-gray-600" />
            )}
          </span>
        );
      })}
    </div>
  );
};

export default StarRatingDisplay;

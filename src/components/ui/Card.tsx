import React from "react";
import LevelBadge from "./LevelBadge";
import StarRatingDisplay from "./StarRatingDisplay";

interface Props {
  title: string;
  href: string;
  level?: string;
  type?: string;
  difficulty?: number;
  description?: string;
  tags?: string[];
}

const Card: React.FC<Props> = ({
  title,
  href,
  level,
  type,
  difficulty,
  description,
  tags,
}) => {
  return (
    <a
      href={href}
      className="block bg-white dark:bg-darkmode-light rounded-2xl p-6 h-full border border-border dark:border-darkmode-border transition-all duration-300 group relative hover:border-accent/50 dark:hover:border-darkmode-accent/50 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {type || "Item"}
        </span>
        {difficulty !== undefined && <StarRatingDisplay rating={difficulty} />}
      </div>
      <h3 className="text-lg font-bold mb-2 text-text-dark dark:text-white group-hover:text-accent dark:group-hover:text-darkmode-accent transition-colors">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-text-light dark:text-darkmode-text-light line-clamp-2 mb-4">
          {description}
        </p>
      )}
      <div className="flex flex-wrap gap-2 mt-auto">
        {level && <LevelBadge level={level} size="sm" />}
        {tags?.map((tag, index) => (
          <span key={index} className="badge badge-sm">
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
};

export default Card;

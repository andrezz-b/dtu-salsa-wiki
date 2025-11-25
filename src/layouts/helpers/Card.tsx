import React from 'react';
import Badge from "./Badge";
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

const Card: React.FC<Props> = ({ title, href, level, type, difficulty, description, tags }) => {
  return (
    <div
      className="bg-white dark:bg-darkmode-light rounded-lg shadow p-6 h-full border border-border dark:border-darkmode-border transition-colors group relative"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {type || "Item"}
        </span>
        {difficulty !== undefined && <StarRatingDisplay rating={difficulty} />}
      </div>
      <h3 className="h5 mb-2">
        <a href={href} className="group-hover:text-accent stretched-link dark:text-white transition-colors">
          {title}
        </a>
      </h3>
      {description && <p className="text-sm opacity-80 line-clamp-2 mb-4">{description}</p>}
      <div className="flex flex-wrap gap-2 mt-auto">
        {
          level && (
            <Badge
              label={level}
              type={level === "beginner" ? "success" : level === "intermediate" ? "warning" : "danger"}
            />
          )
        }
        {tags?.map((tag, index) => <span key={index} className="badge badge-sm">{tag}</span>)}
      </div>
    </div>
  );
};

export default Card;

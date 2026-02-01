import React from "react";
import { titleify } from "@/lib/utils/textConverter";
import clsx from "clsx";

interface LevelBadgeProps {
  level: string;
  variant?: "pill" | "dot";
  size?: "sm" | "md";
  className?: string;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  variant = "pill",
  size = "sm",
  className = "",
}) => {
  const normalizedLevel = level?.toLowerCase();

  const getColors = () => {
    switch (normalizedLevel) {
      case "beginner":
        return variant === "pill"
          ? "bg-level-beginner/10 text-level-beginner dark:bg-darkmode-level-beginner/10 dark:text-darkmode-level-beginner"
          : "bg-level-beginner dark:bg-darkmode-level-beginner";
      case "intermediate":
        return variant === "pill"
          ? "bg-level-intermediate/10 text-level-intermediate dark:bg-darkmode-level-intermediate/10 dark:text-darkmode-level-intermediate"
          : "bg-level-intermediate dark:bg-darkmode-level-intermediate";
      case "advanced":
        return variant === "pill"
          ? "bg-level-advanced/10 text-level-advanced dark:bg-darkmode-level-advanced/10 dark:text-darkmode-level-advanced"
          : "bg-level-advanced dark:bg-darkmode-level-advanced";
      default:
        return variant === "pill"
          ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          : "bg-gray-400";
    }
  };

  const sizeStyles = {
    sm: "text-xs px-2.5 py-0.5 font-medium",
    md: "text-sm px-3 py-1 uppercase font-bold",
  };

  return (
    <span
      className={clsx(
        "inline-block rounded-full tracking-wider",
        variant === "pill" ? sizeStyles[size] : "w-2 h-2",
        getColors(),
        className,
      )}
      title={titleify(level)}
    >
      {variant === "pill" && titleify(level)}
    </span>
  );
};

export default LevelBadge;

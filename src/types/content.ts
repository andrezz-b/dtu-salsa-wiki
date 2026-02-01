/**
 * Shared Content Type Definitions
 *
 * These types represent the structure of content items (moves, concepts)
 * as they are stored in JSON and used throughout the application.
 */

// =============================================================================
// Frontmatter Types
// =============================================================================

/**
 * Base frontmatter shared by all content types
 */
export interface BaseFrontmatter {
  title: string;
  draft?: boolean;
  type?: string;
  level?: string;
  tags?: string[];
  created_date?: string;
  updated_date?: string;
  related_moves?: string[];
  related_concepts?: string[];
}

/**
 * Move-specific frontmatter
 */
export interface MoveFrontmatter extends BaseFrontmatter {
  difficulty?: number;
  leader_difficulty?: number;
  follower_difficulty?: number;
  setup_moves?: string[];
  exit_moves?: string[];
  aliases?: string[];
  video_urls?: string[];
}

/**
 * Concept-specific frontmatter
 */
export interface ConceptFrontmatter extends BaseFrontmatter {
  // Concepts currently have no additional fields
}

// =============================================================================
// Content Item Types
// =============================================================================

/**
 * Generic content item structure (from JSON generator)
 */
export interface ContentItem<T extends BaseFrontmatter = BaseFrontmatter> {
  group: string;
  slug: string;
  frontmatter: T;
  content: string;
}

/**
 * Convenience type aliases for specific content types
 */
export type MoveItem = ContentItem<MoveFrontmatter>;
export type ConceptItem = ContentItem<ConceptFrontmatter>;

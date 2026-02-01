import { useMemo } from "react";
import MiniSearch, { type SearchResult } from "minisearch";

interface UseSearchOptions<T> {
  items: T[];
  fields: string[];
  storeFields?: string[];
  idField?: keyof T;
  boostFields?: Record<string, number>;
}

interface UseSearchResult<T> {
  search: (query: string) => T[];
  miniSearch: MiniSearch<T>;
}

/**
 * Custom hook for MiniSearch with optimized configuration
 *
 * Features:
 * - Prefix matching (finds "cro" when searching "cr")
 * - Fuzzy matching with edit distance (finds "cross" when typing "corss")
 * - Field boosting (title matches rank higher)
 * - Nested field extraction (supports "frontmatter.title")
 * - Combiner set to OR for broader matches
 */
export function useSearch<T>({
  items,
  fields,
  storeFields,
  idField = "id" as keyof T,
  boostFields = {},
}: UseSearchOptions<T>): UseSearchResult<T> {
  const miniSearch = useMemo(() => {
    const ms = new MiniSearch<T>({
      fields,
      storeFields: storeFields || fields,
      idField: idField as string,
      // Extract nested fields (e.g., "frontmatter.title")
      extractField: (document: T, fieldName: string) => {
        const value = fieldName
          .split(".")
          .reduce((doc: any, key: string) => doc && doc[key], document);

        // Handle arrays (e.g., aliases, tags)
        if (Array.isArray(value)) {
          return value.join(" ");
        }
        return value;
      },
      // Tokenizer that handles special characters
      tokenize: (text: string) => {
        // Split on whitespace and common separators, keep alphanumeric
        return text
          .toLowerCase()
          .split(/[\s\-_/]+/)
          .filter((token) => token.length > 0);
      },
      searchOptions: {
        // Enable prefix matching - finds partial matches
        prefix: true,
        // Fuzzy matching with auto-scaling based on term length
        // Shorter terms get less fuzziness to avoid false positives
        fuzzy: (term: string) => {
          if (term.length <= 2) return 0;
          if (term.length <= 4) return 0.1;
          return 0.2;
        },
        // Use OR combiner for broader results when searching multiple terms
        combineWith: "OR",
        // Apply field boosts
        boost: boostFields,
        // Weight prefix matches slightly lower than exact matches
        weights: {
          fuzzy: 0.3,
          prefix: 0.5,
        },
      },
    });

    // Index all items
    ms.addAll(items);
    return ms;
  }, [items, fields, storeFields, idField, boostFields]);

  const search = useMemo(() => {
    return (query: string): T[] => {
      if (!query || query.trim() === "") {
        return items;
      }

      const results = miniSearch.search(query.trim());

      // Map results back to original items, preserving search order
      const resultMap = new Map(
        results.map((result: SearchResult, index: number) => [
          result.id,
          index,
        ]),
      );

      return items
        .filter((item) => resultMap.has(item[idField] as string))
        .sort((a, b) => {
          const aIndex = resultMap.get(a[idField] as string) ?? Infinity;
          const bIndex = resultMap.get(b[idField] as string) ?? Infinity;
          return aIndex - bIndex;
        });
    };
  }, [miniSearch, items, idField]);

  return { search, miniSearch };
}

export default useSearch;

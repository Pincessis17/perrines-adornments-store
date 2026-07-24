export const DEFAULT_CATEGORIES = ["Bags", "Belts", "Accessories", "Custom Orders"];

/**
 * Builds the "All" + category filter list for the Shop page from whatever
 * products actually exist. New categories introduced via CSV import show up
 * automatically with no code changes required.
 */
export function deriveCategories(products: { category?: string }[]): string[] {
  const fromProducts = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c)))
  ).sort();
  const merged = fromProducts.length > 0 ? fromProducts : DEFAULT_CATEGORIES;
  return ["All", ...merged];
}

/**
 * Matches a category name from a URL query param against the known category
 * list, case-insensitively. Falls back to null if there's no match.
 */
export function matchCategory(urlCategory: string | null, categories: string[]): string | null {
  if (!urlCategory) return null;
  return categories.find((c) => c.toLowerCase() === urlCategory.toLowerCase()) || null;
}

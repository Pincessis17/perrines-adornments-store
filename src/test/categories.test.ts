import { describe, it, expect } from "vitest";
import { deriveCategories, matchCategory } from "@/lib/categories";

describe("deriveCategories", () => {
  it("always includes 'All' first", () => {
    expect(deriveCategories([])[0]).toBe("All");
  });

  it("falls back to the default categories when there are no products yet", () => {
    expect(deriveCategories([])).toEqual(["All", "Bags", "Belts", "Accessories", "Custom Orders"]);
  });

  it("derives categories from the actual products, alphabetically", () => {
    const products = [{ category: "Belts" }, { category: "Bags" }, { category: "Belts" }];
    expect(deriveCategories(products)).toEqual(["All", "Bags", "Belts"]);
  });

  it("picks up a brand-new category introduced via CSV import with no code changes", () => {
    const products = [{ category: "Bags" }, { category: "Evening Wear" }];
    expect(deriveCategories(products)).toEqual(["All", "Bags", "Evening Wear"]);
  });

  it("de-duplicates repeated categories", () => {
    const products = [{ category: "Bags" }, { category: "Bags" }, { category: "Bags" }];
    expect(deriveCategories(products)).toEqual(["All", "Bags"]);
  });

  it("ignores products with a missing/empty category", () => {
    const products = [{ category: "Bags" }, { category: "" }, { category: undefined }];
    expect(deriveCategories(products)).toEqual(["All", "Bags"]);
  });
});

describe("matchCategory", () => {
  const categories = ["All", "Bags", "Belts"];

  it("matches case-insensitively", () => {
    expect(matchCategory("bags", categories)).toBe("Bags");
    expect(matchCategory("BELTS", categories)).toBe("Belts");
  });

  it("returns null for an unknown category", () => {
    expect(matchCategory("Shoes", categories)).toBeNull();
  });

  it("returns null when no URL category is given", () => {
    expect(matchCategory(null, categories)).toBeNull();
  });
});

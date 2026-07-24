import { describe, it, expect } from "vitest";
import { parseAndValidate, missingColumns } from "@/lib/csvImport";

describe("parseAndValidate", () => {
  it("accepts a well-formed row", () => {
    const [row] = parseAndValidate([{ name: "Sapphire Clutch", category: "Bags", price: "275", image: "" }]);
    expect(row._valid).toBe(true);
    expect(row.name).toBe("Sapphire Clutch");
    expect(row.category).toBe("Bags");
    expect(row.price).toBe(275);
  });

  it("trims whitespace from all fields", () => {
    const [row] = parseAndValidate([{ name: "  Clutch  ", category: " Bags ", price: " 100 ", image: "" }]);
    expect(row.name).toBe("Clutch");
    expect(row.category).toBe("Bags");
    expect(row.price).toBe(100);
  });

  it("rejects a row missing a name", () => {
    const [row] = parseAndValidate([{ name: "", category: "Bags", price: "100", image: "" }]);
    expect(row._valid).toBe(false);
    expect(row._error).toBe("Missing name");
  });

  it("rejects a row missing a category", () => {
    const [row] = parseAndValidate([{ name: "Clutch", category: "", price: "100", image: "" }]);
    expect(row._valid).toBe(false);
    expect(row._error).toBe("Missing category");
  });

  it("rejects a row with a non-numeric price", () => {
    const [row] = parseAndValidate([{ name: "Clutch", category: "Bags", price: "free", image: "" }]);
    expect(row._valid).toBe(false);
    expect(row._error).toBe("Invalid price");
  });

  it("rejects a row with a negative price", () => {
    const [row] = parseAndValidate([{ name: "Clutch", category: "Bags", price: "-5", image: "" }]);
    expect(row._valid).toBe(false);
    expect(row._error).toBe("Invalid price");
  });

  it("accepts a price of exactly 0", () => {
    const [row] = parseAndValidate([{ name: "Free Sample", category: "Bags", price: "0", image: "" }]);
    expect(row._valid).toBe(true);
  });

  it("processes a mixed batch independently, row by row", () => {
    const rows = parseAndValidate([
      { name: "Clutch", category: "Bags", price: "100", image: "" },
      { name: "", category: "Bags", price: "100", image: "" },
      { name: "Belt", category: "Belts", price: "50", image: "" },
    ]);
    expect(rows.map((r) => r._valid)).toEqual([true, false, true]);
  });
});

describe("missingColumns", () => {
  it("returns an empty list when all required columns are present", () => {
    expect(missingColumns(["name", "category", "price", "image"])).toEqual([]);
  });

  it("is case-insensitive and trims header whitespace", () => {
    expect(missingColumns([" Name ", "CATEGORY", "Price"])).toEqual([]);
  });

  it("reports every missing required column", () => {
    expect(missingColumns(["name"])).toEqual(["category", "price"]);
  });

  it("treats an undefined header list as all columns missing", () => {
    expect(missingColumns(undefined)).toEqual(["name", "category", "price"]);
  });
});

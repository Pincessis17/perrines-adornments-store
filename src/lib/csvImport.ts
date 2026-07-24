export type ParsedRow = {
  name: string;
  category: string;
  price: number;
  image: string;
  _valid: boolean;
  _error?: string;
};

export const REQUIRED_COLUMNS = ["name", "category", "price"];

export function parseAndValidate(rows: Record<string, string>[]): ParsedRow[] {
  return rows.map((row) => {
    const name = (row.name || "").trim();
    const category = (row.category || "").trim();
    const priceRaw = (row.price || "").trim();
    const image = (row.image || "").trim();
    const price = Number(priceRaw);

    if (!name) return { name, category, price, image, _valid: false, _error: "Missing name" };
    if (!category) return { name, category, price, image, _valid: false, _error: "Missing category" };
    if (!priceRaw || Number.isNaN(price) || price < 0) {
      return { name, category, price, image, _valid: false, _error: "Invalid price" };
    }

    return { name, category, price, image, _valid: true };
  });
}

export function missingColumns(fields: string[] | undefined): string[] {
  const columns = (fields || []).map((f) => f.toLowerCase().trim());
  return REQUIRED_COLUMNS.filter((col) => !columns.includes(col));
}

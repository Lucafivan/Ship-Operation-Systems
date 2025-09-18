// utils/sort.ts
export type SortKey =
  | "vessel_name"
  | "voyage_year"
  | "voyage_number"
  | "voyage_berth_loc"
  | "voyage_date_berth"
  | "created_at"
  | "updated_at";

export const parseValue = (key: SortKey, value: any) => {
  switch (key) {
    case "voyage_year":
      return Number(value ?? 0);
    case "voyage_number":
      return Number(value) || String(value).toLowerCase();
    case "voyage_date_berth":
    case "created_at":
    case "updated_at":
      return Date.parse(String(value)) || -Infinity;
    default:
      return value?.toString().toLowerCase() ?? "";
  }
};

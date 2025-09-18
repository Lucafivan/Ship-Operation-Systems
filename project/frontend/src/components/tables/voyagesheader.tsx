import React from "react";
import type { SortKey } from "../../utils/sort"

interface Props {
  sortKey: SortKey;
  sortOrder: "asc" | "desc";
  onSort: (key: SortKey) => void;
}

const VoyagesTableHeader: React.FC<Props> = ({ sortKey, sortOrder, onSort }) => {
  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return "⇅";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  return (
    <thead className="bg-slate-200 text-xs text-slate-600 uppercase">
      <tr>
        <th rowSpan={2} className="px-4 py-2 text-left">No</th>
        <th
          rowSpan={2}
          onClick={() => onSort("vessel_name")}
          className="px-4 py-2 text-left cursor-pointer"
        >
          Vessel {renderSortIcon("vessel_name")}
        </th>
        <th colSpan={3} className="px-4 py-2 text-center">Voyage</th>
        <th colSpan={3} className="px-4 py-2 text-center">Container</th>
        <th colSpan={2} className="px-4 py-2 text-center">Info</th>
      </tr>
      <tr>
        <th onClick={() => onSort("voyage_year")} className="cursor-pointer px-4 py-2">
          Year {renderSortIcon("voyage_year")}
        </th>
        <th onClick={() => onSort("voyage_number")} className="cursor-pointer px-4 py-2">
          Number {renderSortIcon("voyage_number")}
        </th>
        <th onClick={() => onSort("voyage_date_berth")} className="cursor-pointer px-4 py-2">
          Date Berth {renderSortIcon("voyage_date_berth")}
        </th>
        <th className="px-4 py-2">Count</th>
        <th className="px-4 py-2">TEUS</th>
        <th className="px-4 py-2">Berth Loc</th>
        <th onClick={() => onSort("created_at")} className="cursor-pointer px-4 py-2">
          Created {renderSortIcon("created_at")}
        </th>
        <th onClick={() => onSort("updated_at")} className="cursor-pointer px-4 py-2">
          Updated {renderSortIcon("updated_at")}
        </th>
      </tr>
    </thead>
  );
};

export default VoyagesTableHeader;

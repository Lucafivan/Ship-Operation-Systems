import React from 'react';
import type { SortConfig, SortKey } from '../../pages/monitoring.types';

interface Props {
  sortConfig: SortConfig | null;
  requestSort: (key: SortKey) => void;
}

const CMHeader: React.FC<Props> = ({ sortConfig, requestSort }) => {
  return (
    <thead className="sticky top-0 bg-gray-100 z-10 text-slate-700">
      <tr className="text-white">
        <th className="p-2 font-medium border border-white bg-emerald-600 text-white" rowSpan={4}>Action</th>
        <th className="p-2 font-medium border border-white bg-emerald-600 text-white" rowSpan={4} aria-sort={sortConfig?.key === 'vessel_name' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
          Vessel
        </th>
        <th className="p-2 font-medium border border-white bg-emerald-600 text-white" rowSpan={4} aria-sort={sortConfig?.key === 'voyage_number' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
          Voyage Number
        </th>
        <th className="p-2 font-medium border border-white bg-emerald-600 text-white" rowSpan={4} aria-sort={sortConfig?.key === 'voyage_year' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
          Voyage Year
        </th>
        <th className="p-2 font-medium border border-white bg-emerald-600 text-white" rowSpan={4} aria-sort={sortConfig?.key === 'port_name' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
          Berth Location
        </th>
        <th className="p-2 font-medium border border-white bg-emerald-600 text-white w-[120px]" rowSpan={4} aria-sort={sortConfig?.key === 'voyage_date_berth' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
          <button onClick={() => requestSort('voyage_date_berth')} className="flex items-center gap-1 hover:opacity-90">
            Date Berth
          </button>
        </th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={4}>Bongkaran</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={4}>Pengajuan</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={4}>ACC Pengajuan</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={3}>Total Pengajuan</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={4}>Realisasi All Depo</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={8}>Shipside</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={3}>Total Realisasi</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={3}>Turun CY</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={4}>% Vessel</th>
        <th className="p-2 border border-white bg-emerald-600 w-[200px]" rowSpan={4}>Obstacles</th>
        <th className="p-2 border border-white bg-emerald-600 w-[120px]" rowSpan={4} aria-sort={sortConfig?.key === 'created_at' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
          Created
        </th>
        <th className="p-2 border border-white bg-emerald-600 w-[120px]" rowSpan={4} aria-sort={sortConfig?.key === 'updated_at' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
          Updated
        </th>
      </tr>
      <tr className="text-white">
        <th className="p-2 border border-white bg-emerald-600" colSpan={2}>Empty</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={2}>Full</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={2}>Empty</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={2}>Full</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={2}>Empty</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={2}>Full</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={2}>Box</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={3}>Teus Pengajuan</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={2}>MXD</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={2}>FXD</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={4}>YES</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={4}>NO</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={2}>Box</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={3}>Teus Realisasi</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={2}>Box</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={3}>Teus Turun CY</th>
      </tr>
      <tr className="text-white">
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>20DC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>40HC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>20DC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>40HC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>20DC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>40HC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>20DC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>40HC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>20DC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>40HC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>20DC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>40HC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>20DC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>40HC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>20DC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>40HC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>20DC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>40HC</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={2}>MXD</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={2}>FXD</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={2}>MXD</th>
        <th className="p-2 border border-white bg-emerald-600" colSpan={2}>FXD</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>20DC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>40HC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>20DC</th>
        <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>40HC</th>
      </tr>
      <tr className="text-white">
        <th className="p-2 border border-white bg-emerald-600">20DC</th>
        <th className="p-2 border border-white bg-emerald-600">40HC</th>
        <th className="p-2 border border-white bg-emerald-600">20DC</th>
        <th className="p-2 border border-white bg-emerald-600">40HC</th>
        <th className="p-2 border border-white bg-emerald-600">20DC</th>
        <th className="p-2 border border-white bg-emerald-600">40HC</th>
        <th className="p-2 border border-white bg-emerald-600">20DC</th>
        <th className="p-2 border border-white bg-emerald-600">40HC</th>
      </tr>
    </thead>
  );
};

export default CMHeader;

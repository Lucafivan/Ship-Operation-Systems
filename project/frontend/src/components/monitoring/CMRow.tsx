import React from 'react';
import type { ContainerMovement } from '../../pages/monitoring.types';

interface Props {
  row: ContainerMovement;
  onEdit: (row: ContainerMovement) => void;
}

const CMRow: React.FC<Props> = ({ row, onEdit }) => (
  <tr key={row.id ?? row.voyage_id} className="hover:bg-gray-50 border-b last:border-b-0">
    <td className="p-2 align-middle text-center">
      <button
        onClick={() => onEdit(row)}
        className="text-emerald-700 hover:text-emerald-800 hover:underline text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-sm px-1 py-0.5"
      >
        Edit
      </button>
    </td>
    <td className="p-2 align-middle">{row.vessel_name}</td>
    <td className="p-2 align-middle">{row.voyage_number}</td>
    <td className="p-2 align-middle">{row.voyage_year}</td>
    <td className="p-2 align-middle">{row.port_name}</td>
    <td className="p-2 align-middle whitespace-nowrap">{row.voyage_date_berth?.slice(0, 10)}</td>
    <td className="p-2 align-middle">{row.bongkaran_empty_20dc}</td>
    <td className="p-2 align-middle">{row.bongkaran_empty_40hc}</td>
    <td className="p-2 align-middle">{row.bongkaran_full_20dc}</td>
    <td className="p-2 align-middle">{row.bongkaran_full_40hc}</td>
    <td className={`p-2 align-middle ${row.pengajuan_empty_20dc > row.bongkaran_empty_20dc ? 'bg-amber-100 text-amber-700 font-medium' : ''}`}>{row.pengajuan_empty_20dc}</td>
    <td className={`p-2 align-middle ${row.pengajuan_empty_40hc > row.bongkaran_empty_40hc ? 'bg-amber-100 text-amber-700 font-medium' : ''}`}>{row.pengajuan_empty_40hc}</td>
    <td className={`p-2 align-middle ${row.pengajuan_full_20dc > row.bongkaran_full_20dc ? 'bg-amber-100 text-amber-700 font-medium' : ''}`}>{row.pengajuan_full_20dc}</td>
    <td className={`p-2 align-middle ${row.pengajuan_full_40hc > row.bongkaran_full_40hc ? 'bg-amber-100 text-amber-700 font-medium' : ''}`}>{row.pengajuan_full_40hc}</td>
    <td className={`p-2 align-middle ${row.acc_pengajuan_empty_20dc > row.pengajuan_empty_20dc ? 'bg-rose-100 text-rose-700 font-medium' : ''}`}>{row.acc_pengajuan_empty_20dc}</td>
    <td className={`p-2 align-middle ${row.acc_pengajuan_empty_40hc > row.pengajuan_empty_40hc ? 'bg-rose-100 text-rose-700 font-medium' : ''}`}>{row.acc_pengajuan_empty_40hc}</td>
    <td className={`p-2 align-middle ${row.acc_pengajuan_full_20dc > row.pengajuan_full_20dc ? 'bg-rose-100 text-rose-700 font-medium' : ''}`}>{row.acc_pengajuan_full_20dc}</td>
    <td className={`p-2 align-middle ${row.acc_pengajuan_full_40hc > row.pengajuan_full_40hc ? 'bg-rose-100 text-rose-700 font-medium' : ''}`}>{row.acc_pengajuan_full_40hc}</td>
    <td className="p-2 align-middle">{row.total_pengajuan_20dc}</td>
    <td className="p-2 align-middle">{row.total_pengajuan_40hc}</td>
    <td className="p-2 align-middle">{row.teus_pengajuan}</td>
    <td className="p-2 align-middle">{row.realisasi_mxd_20dc}</td>
    <td className="p-2 align-middle">{row.realisasi_mxd_40hc}</td>
    <td className="p-2 align-middle">{row.realisasi_fxd_20dc}</td>
    <td className="p-2 align-middle">{row.realisasi_fxd_40hc}</td>
    <td className="p-2 align-middle">{row.shipside_yes_mxd_20dc}</td>
    <td className="p-2 align-middle">{row.shipside_yes_mxd_40hc}</td>
    <td className="p-2 align-middle">{row.shipside_yes_fxd_20dc}</td>
    <td className="p-2 align-middle">{row.shipside_yes_fxd_40hc}</td>
    <td className="p-2 align-middle">{row.shipside_no_mxd_20dc}</td>
    <td className="p-2 align-middle">{row.shipside_no_mxd_40hc}</td>
    <td className="p-2 align-middle">{row.shipside_no_fxd_20dc}</td>
    <td className="p-2 align-middle">{row.shipside_no_fxd_40hc}</td>
    <td className={`p-2 align-middle ${row.total_realisasi_20dc > row.total_pengajuan_20dc ? 'bg-indigo-100 text-indigo-700 font-medium' : ''}`}>{row.total_realisasi_20dc}</td>
    <td className={`p-2 align-middle ${row.total_realisasi_40hc > row.total_pengajuan_40hc ? 'bg-indigo-100 text-indigo-700 font-medium' : ''}`}>{row.total_realisasi_40hc}</td>
    <td className="p-2 align-middle">{row.teus_realisasi}</td>
    <td className="p-2 align-middle">{row.turun_cy_20dc}</td>
    <td className="p-2 align-middle">{row.turun_cy_40hc}</td>
    <td className="p-2 align-middle">{row.teus_turun_cy}</td>
    <td className="p-2 align-middle">{row.percentage_vessel ? (row.percentage_vessel * 100).toFixed(1) + '%' : '0.0%'}</td>
    <td className="p-2 align-middle">{row.obstacles}</td>
    <td className="p-2 align-middle whitespace-nowrap">{row.created_at?.slice(0, 10)}</td>
    <td className="p-2 align-middle whitespace-nowrap">{row.updated_at?.slice(0, 10)}</td>
  </tr>
);

export default CMRow;

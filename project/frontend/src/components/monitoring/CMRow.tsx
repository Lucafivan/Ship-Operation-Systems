import React from 'react';
import type { ContainerMovement } from '../../pages/monitoring.types';

interface Props {
  row: ContainerMovement;
  predicted?: Partial<ContainerMovement>;
  onEdit: (row: ContainerMovement) => void;
}

const CMRow: React.FC<Props> = ({ row, predicted, onEdit }) => (
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
    <td className={`p-2 align-middle ${predicted?.pengajuan_empty_20dc != null ? 'bg-green-100 text-green-700 font-medium' : ((row.pengajuan_empty_20dc ?? 0) > (row.bongkaran_empty_20dc ?? 0) ? 'bg-amber-100 text-amber-700 font-medium' : '')}`} title={predicted?.pengajuan_empty_20dc != null ? 'Predicted' : undefined}>{predicted?.pengajuan_empty_20dc ?? row.pengajuan_empty_20dc}</td>
    <td className={`p-2 align-middle ${predicted?.pengajuan_empty_40hc != null ? 'bg-green-100 text-green-700 font-medium' : ((row.pengajuan_empty_40hc ?? 0) > (row.bongkaran_empty_40hc ?? 0) ? 'bg-amber-100 text-amber-700 font-medium' : '')}`} title={predicted?.pengajuan_empty_40hc != null ? 'Predicted' : undefined}>{predicted?.pengajuan_empty_40hc ?? row.pengajuan_empty_40hc}</td>
    <td className={`p-2 align-middle ${predicted?.pengajuan_full_20dc != null ? 'bg-green-100 text-green-700 font-medium' : ((row.pengajuan_full_20dc ?? 0) > (row.bongkaran_full_20dc ?? 0) ? 'bg-amber-100 text-amber-700 font-medium' : '')}`} title={predicted?.pengajuan_full_20dc != null ? 'Predicted' : undefined}>{predicted?.pengajuan_full_20dc ?? row.pengajuan_full_20dc}</td>
    <td className={`p-2 align-middle ${predicted?.pengajuan_full_40hc != null ? 'bg-green-100 text-green-700 font-medium' : ((row.pengajuan_full_40hc ?? 0) > (row.bongkaran_full_40hc ?? 0) ? 'bg-amber-100 text-amber-700 font-medium' : '')}`} title={predicted?.pengajuan_full_40hc != null ? 'Predicted' : undefined}>{predicted?.pengajuan_full_40hc ?? row.pengajuan_full_40hc}</td>
    <td className={`p-2 align-middle ${predicted?.acc_pengajuan_empty_20dc != null ? 'bg-green-100 text-green-700 font-medium' : (((row.acc_pengajuan_empty_20dc ?? 0) > (predicted?.pengajuan_empty_20dc ?? row.pengajuan_empty_20dc ?? 0)) ? 'bg-rose-100 text-rose-700 font-medium' : '')}`} title={predicted?.acc_pengajuan_empty_20dc != null ? 'Predicted' : undefined}>{predicted?.acc_pengajuan_empty_20dc ?? row.acc_pengajuan_empty_20dc}</td>
    <td className={`p-2 align-middle ${predicted?.acc_pengajuan_empty_40hc != null ? 'bg-green-100 text-green-700 font-medium' : (((row.acc_pengajuan_empty_40hc ?? 0) > (predicted?.pengajuan_empty_40hc ?? row.pengajuan_empty_40hc ?? 0)) ? 'bg-rose-100 text-rose-700 font-medium' : '')}`} title={predicted?.acc_pengajuan_empty_40hc != null ? 'Predicted' : undefined}>{predicted?.acc_pengajuan_empty_40hc ?? row.acc_pengajuan_empty_40hc}</td>
    <td className={`p-2 align-middle ${predicted?.acc_pengajuan_full_20dc != null ? 'bg-green-100 text-green-700 font-medium' : (((row.acc_pengajuan_full_20dc ?? 0) > (predicted?.pengajuan_full_20dc ?? row.pengajuan_full_20dc ?? 0)) ? 'bg-rose-100 text-rose-700 font-medium' : '')}`} title={predicted?.acc_pengajuan_full_20dc != null ? 'Predicted' : undefined}>{predicted?.acc_pengajuan_full_20dc ?? row.acc_pengajuan_full_20dc}</td>
    <td className={`p-2 align-middle ${predicted?.acc_pengajuan_full_40hc != null ? 'bg-green-100 text-green-700 font-medium' : (((row.acc_pengajuan_full_40hc ?? 0) > (predicted?.pengajuan_full_40hc ?? row.pengajuan_full_40hc ?? 0)) ? 'bg-rose-100 text-rose-700 font-medium' : '')}`} title={predicted?.acc_pengajuan_full_40hc != null ? 'Predicted' : undefined}>{predicted?.acc_pengajuan_full_40hc ?? row.acc_pengajuan_full_40hc}</td>
    <td className="p-2 align-middle">{row.total_pengajuan_20dc}</td>
    <td className="p-2 align-middle">{row.total_pengajuan_40hc}</td>
    <td className="p-2 align-middle">{row.teus_pengajuan}</td>
    <td className={`p-2 align-middle ${predicted?.realisasi_mxd_20dc != null ? 'bg-green-100 text-green-700 font-medium' : ''}`} title={predicted?.realisasi_mxd_20dc != null ? 'Predicted' : undefined}>{predicted?.realisasi_mxd_20dc ?? row.realisasi_mxd_20dc}</td>
    <td className={`p-2 align-middle ${predicted?.realisasi_mxd_40hc != null ? 'bg-green-100 text-green-700 font-medium' : ''}`} title={predicted?.realisasi_mxd_40hc != null ? 'Predicted' : undefined}>{predicted?.realisasi_mxd_40hc ?? row.realisasi_mxd_40hc}</td>
    <td className={`p-2 align-middle ${predicted?.realisasi_fxd_20dc != null ? 'bg-green-100 text-green-700 font-medium' : ''}`} title={predicted?.realisasi_fxd_20dc != null ? 'Predicted' : undefined}>{predicted?.realisasi_fxd_20dc ?? row.realisasi_fxd_20dc}</td>
    <td className={`p-2 align-middle ${predicted?.realisasi_fxd_40hc != null ? 'bg-green-100 text-green-700 font-medium' : ''}`} title={predicted?.realisasi_fxd_40hc != null ? 'Predicted' : undefined}>{predicted?.realisasi_fxd_40hc ?? row.realisasi_fxd_40hc}</td>
    <td className={`p-2 align-middle ${predicted?.shipside_yes_mxd_20dc != null ? 'bg-green-100 text-green-700 font-medium' : ''}`} title={predicted?.shipside_yes_mxd_20dc != null ? 'Predicted' : undefined}>{predicted?.shipside_yes_mxd_20dc ?? row.shipside_yes_mxd_20dc}</td>
    <td className={`p-2 align-middle ${predicted?.shipside_yes_mxd_40hc != null ? 'bg-green-100 text-green-700 font-medium' : ''}`} title={predicted?.shipside_yes_mxd_40hc != null ? 'Predicted' : undefined}>{predicted?.shipside_yes_mxd_40hc ?? row.shipside_yes_mxd_40hc}</td>
    <td className={`p-2 align-middle ${predicted?.shipside_yes_fxd_20dc != null ? 'bg-green-100 text-green-700 font-medium' : ''}`} title={predicted?.shipside_yes_fxd_20dc != null ? 'Predicted' : undefined}>{predicted?.shipside_yes_fxd_20dc ?? row.shipside_yes_fxd_20dc}</td>
    <td className={`p-2 align-middle ${predicted?.shipside_yes_fxd_40hc != null ? 'bg-green-100 text-green-700 font-medium' : ''}`} title={predicted?.shipside_yes_fxd_40hc != null ? 'Predicted' : undefined}>{predicted?.shipside_yes_fxd_40hc ?? row.shipside_yes_fxd_40hc}</td>
    <td className={`p-2 align-middle ${predicted?.shipside_no_mxd_20dc != null ? 'bg-green-100 text-green-700 font-medium' : ''}`} title={predicted?.shipside_no_mxd_20dc != null ? 'Predicted' : undefined}>{predicted?.shipside_no_mxd_20dc ?? row.shipside_no_mxd_20dc}</td>
    <td className={`p-2 align-middle ${predicted?.shipside_no_mxd_40hc != null ? 'bg-green-100 text-green-700 font-medium' : ''}`} title={predicted?.shipside_no_mxd_40hc != null ? 'Predicted' : undefined}>{predicted?.shipside_no_mxd_40hc ?? row.shipside_no_mxd_40hc}</td>
    <td className={`p-2 align-middle ${predicted?.shipside_no_fxd_20dc != null ? 'bg-green-100 text-green-700 font-medium' : ''}`} title={predicted?.shipside_no_fxd_20dc != null ? 'Predicted' : undefined}>{predicted?.shipside_no_fxd_20dc ?? row.shipside_no_fxd_20dc}</td>
    <td className={`p-2 align-middle ${predicted?.shipside_no_fxd_40hc != null ? 'bg-green-100 text-green-700 font-medium' : ''}`} title={predicted?.shipside_no_fxd_40hc != null ? 'Predicted' : undefined}>{predicted?.shipside_no_fxd_40hc ?? row.shipside_no_fxd_40hc}</td>
    {(() => {
      const acc20 = (row.total_pengajuan_20dc ?? 0);
      const acc40 = (row.total_pengajuan_40hc ?? 0);
      const indigo20 = (row.total_realisasi_20dc ?? 0) > acc20;
      const indigo40 = (row.total_realisasi_40hc ?? 0) > acc40;
      return (
        <>
          <td className={`p-2 align-middle ${indigo20 ? 'bg-indigo-100 text-indigo-700 font-medium' : ''}`}>{row.total_realisasi_20dc}</td>
          <td className={`p-2 align-middle ${indigo40 ? 'bg-indigo-100 text-indigo-700 font-medium' : ''}`}>{row.total_realisasi_40hc}</td>
        </>
      );
    })()}
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

import React, { useEffect, useState } from "react";
import apiClient from "../api/axios";

interface ContainerMovement {
  id: number;
  voyage_id: number;
  vessel_name: string;
  voyage_number: string;
  voyage_year: number;
  voyage_berth_loc: string;
  voyage_date_berth: string;
  bongkaran_empty_20dc: number;
  bongkaran_empty_40hc: number;
  bongkaran_full_20dc: number;
  bongkaran_full_40hc: number;
  pengajuan_empty_20dc: number;
  pengajuan_empty_40hc: number;
  pengajuan_full_20dc: number;
  pengajuan_full_40hc: number;
  acc_pengajuan_empty_20dc: number;
  acc_pengajuan_empty_40hc: number;
  acc_pengajuan_full_20dc: number;
  acc_pengajuan_full_40hc: number;
  total_pengajuan_20dc: number;
  total_pengajuan_40hc: number;
  teus_pengajuan: number;
  realisasi_mxd_20dc: number;
  realisasi_mxd_40hc: number;
  realisasi_fxd_20dc: number;
  realisasi_fxd_40hc: number;
  shipside_yes_mxd_20dc: number;
  shipside_yes_mxd_40hc: number;
  shipside_yes_fxd_20dc: number;
  shipside_yes_fxd_40hc: number;
  shipside_no_mxd_20dc: number;
  shipside_no_mxd_40hc: number;
  shipside_no_fxd_20dc: number;
  shipside_no_fxd_40hc: number;
  total_realisasi_20dc: number;
  total_realisasi_40hc: number;
  teus_realisasi: number;
  turun_cy_20dc: number;
  turun_cy_40hc: number;
  teus_turun_cy: number;
  percentage_vessel: number;
  obstacles: string;
  created_at: string;
  updated_at: string;
}

const MonitoringVoyages: React.FC = () => {
  const [data, setData] = useState<ContainerMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get("/container_movements/");
        setData(res.data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="overflow-x-auto p-4">
      </div>
      <h1 className="text-2xl font-bold mb-4">Monitoring Container Movements</h1>
      <div className="overflow-x-auto py-4">
        <table className="min-w-[1200px] w-full border border-black text-xs md:text-sm bg-white shadow rounded-lg">
          <thead className="bg-green-700">
        <tr className="text-white">
          <th className="p-2 border border-black" rowSpan={4}>Vessel</th>
          <th className="p-2 border border-black" rowSpan={4}>Voyage Number</th>
          <th className="p-2 border border-black" rowSpan={4}>Voyage Year</th>
          <th className="p-2 border border-black" rowSpan={4}>Berth Location</th>
          <th className="p-2 border border-black" rowSpan={4}>Date Berth</th>
          <th className="p-2 border border-black" colSpan={4}>Bongkaran</th>
          <th className="p-2 border border-black" colSpan={4}>Pengajuan</th>
          <th className="p-2 border border-black" colSpan={4}>Acc Pengajuan</th>
          <th className="p-2 border border-black" colSpan={3}>Total Pengajuan</th>
          <th className="p-2 border border-black" colSpan={4}>Realisasi All Depo</th>
          <th className="p-2 border border-black" colSpan={8}>Shipside</th>
          <th className="p-2 border border-black" colSpan={3}>Total Realisasi</th>
          <th className="p-2 border border-black" colSpan={3}>Turun CY</th>
          <th className="p-2 border border-black" rowSpan={4}>% Vessel</th>
          <th className="p-2 border border-black" rowSpan={4}>Obstacles</th>
          <th className="p-2 border border-black" rowSpan={4}>Created</th>
          <th className="p-2 border border-black" rowSpan={4}>Updated</th>
        </tr>
        <tr className="text-white">
          <th className="p-2 border border-black" colSpan={2}>Empty</th>
          <th className="p-2 border border-black" colSpan={2}>Full</th>
          <th className="p-2 border border-black" colSpan={2}>Empty</th>
          <th className="p-2 border border-black" colSpan={2}>Full</th>
          <th className="p-2 border border-black" colSpan={2}>Empty</th>
          <th className="p-2 border border-black" colSpan={2}>Full</th>
          <th className="p-2 border border-black" colSpan={2}>Box</th>
          <th className="p-2 border border-black" rowSpan={3}>Teus Pengajuan</th>
          <th className="p-2 border border-black" colSpan={2}>MXD</th>
          <th className="p-2 border border-black" colSpan={2}>FXD</th>
          <th className="p-2 border border-black" colSpan={4}>YES</th>
          <th className="p-2 border border-black" colSpan={4}>NO</th>
          <th className="p-2 border border-black" colSpan={2}>Box</th>
          <th className="p-2 border border-black" rowSpan={3}>Teus Realisasi</th>
          <th className="p-2 border border-black" colSpan={2}>Box</th>
          <th className="p-2 border border-black" rowSpan={3}>Teus Turun CY</th>
        </tr>
        <tr className="text-white">
          <th className="p-2 border border-black" rowSpan={2}>20DC</th>
          <th className="p-2 border border-black" rowSpan={2}>40HC</th>
          <th className="p-2 border border-black" rowSpan={2}>20DC</th>
          <th className="p-2 border border-black" rowSpan={2}>40HC</th>
          <th className="p-2 border border-black" rowSpan={2}>20DC</th>
          <th className="p-2 border border-black" rowSpan={2}>40HC</th>
          <th className="p-2 border border-black" rowSpan={2}>20DC</th>
          <th className="p-2 border border-black" rowSpan={2}>40HC</th>
          <th className="p-2 border border-black" rowSpan={2}>20DC</th>
          <th className="p-2 border border-black" rowSpan={2}>40HC</th>
          <th className="p-2 border border-black" rowSpan={2}>20DC</th>
          <th className="p-2 border border-black" rowSpan={2}>40HC</th>
          <th className="p-2 border border-black" rowSpan={2}>20DC</th>
          <th className="p-2 border border-black" rowSpan={2}>40HC</th>
          <th className="p-2 border border-black" rowSpan={2}>20DC</th>
          <th className="p-2 border border-black" rowSpan={2}>40HC</th>
          <th className="p-2 border border-black" rowSpan={2}>20DC</th>
          <th className="p-2 border border-black" rowSpan={2}>40HC</th>
          <th className="p-2 border border-black" colSpan={2}>MXD</th>
          <th className="p-2 border border-black" colSpan={2}>FXD</th>
          <th className="p-2 border border-black" colSpan={2}>MXD</th>
          <th className="p-2 border border-black" colSpan={2}>FXD</th>
          <th className="p-2 border border-black" rowSpan={2}>20DC</th>
          <th className="p-2 border border-black" rowSpan={2}>40HC</th>
          <th className="p-2 border border-black" rowSpan={2}>20DC</th>
          <th className="p-2 border border-black" rowSpan={2}>40HC</th>
        </tr>
        <tr className="text-white">
          <th className="p-2 border border-black">20DC</th>
          <th className="p-2 border border-black">40HC</th>
          <th className="p-2 border border-black">20DC</th>
          <th className="p-2 border border-black">40HC</th>
          <th className="p-2 border border-black">20DC</th>
          <th className="p-2 border border-black">40HC</th>
          <th className="p-2 border border-black">20DC</th>
          <th className="p-2 border border-black">40HC</th>
        </tr>
          </thead>
          <tbody>
        {data.map((row) => (
          <tr key={row.id} className="even:bg-green-50">
            <td className="p-2 border border-black">{row.vessel_name}</td>
            <td className="p-2 border border-black">{row.voyage_number}</td>
            <td className="p-2 border border-black">{row.voyage_year}</td>
            <td className="p-2 border border-black">{row.voyage_berth_loc}</td>
            <td className="p-2 border border-black">{row.voyage_date_berth?.slice(0, 10)}</td>
            {/* Bongkaran */}
            <td className="p-2 border border-black">{row.bongkaran_empty_20dc}</td>
            <td className="p-2 border border-black">{row.bongkaran_empty_40hc}</td>
            <td className="p-2 border border-black">{row.bongkaran_full_20dc}</td>
            <td className="p-2 border border-black">{row.bongkaran_full_40hc}</td>
            {/* Pengajuan */}
            <td className="p-2 border border-black">{row.pengajuan_empty_20dc}</td>
            <td className="p-2 border border-black">{row.pengajuan_empty_40hc}</td>
            <td className="p-2 border border-black">{row.pengajuan_full_20dc}</td>
            <td className="p-2 border border-black">{row.pengajuan_full_40hc}</td>
            {/* Acc Pengajuan */}
            <td className="p-2 border border-black">{row.acc_pengajuan_empty_20dc}</td>
            <td className="p-2 border border-black">{row.acc_pengajuan_empty_40hc}</td>
            <td className="p-2 border border-black">{row.acc_pengajuan_full_20dc}</td>
            <td className="p-2 border border-black">{row.acc_pengajuan_full_40hc}</td>
            {/* Total Pengajuan */}
            <td className="p-2 border border-black">{row.total_pengajuan_20dc}</td>
            <td className="p-2 border border-black">{row.total_pengajuan_40hc}</td>
            <td className="p-2 border border-black">{row.teus_pengajuan}</td>
            {/* Realisasi All Depo */}
            <td className="p-2 border border-black">{row.realisasi_mxd_20dc}</td>
            <td className="p-2 border border-black">{row.realisasi_mxd_40hc}</td>
            <td className="p-2 border border-black">{row.realisasi_fxd_20dc}</td>
            <td className="p-2 border border-black">{row.realisasi_fxd_40hc}</td>
            {/* Shipside YES MXD */}
            <td className="p-2 border border-black">{row.shipside_yes_mxd_20dc}</td>
            <td className="p-2 border border-black">{row.shipside_yes_mxd_40hc}</td>
            {/* Shipside YES FXD */}
            <td className="p-2 border border-black">{row.shipside_yes_fxd_20dc}</td>
            <td className="p-2 border border-black">{row.shipside_yes_fxd_40hc}</td>
            {/* Shipside NO MXD */}
            <td className="p-2 border border-black">{row.shipside_no_mxd_20dc}</td>
            <td className="p-2 border border-black">{row.shipside_no_mxd_40hc}</td>
            {/* Shipside NO FXD */}
            <td className="p-2 border border-black">{row.shipside_no_fxd_20dc}</td>
            <td className="p-2 border border-black">{row.shipside_no_fxd_40hc}</td>
            {/* Total Realisasi */}
            <td className="p-2 border border-black">{row.total_realisasi_20dc}</td>
            <td className="p-2 border border-black">{row.total_realisasi_40hc}</td>
            <td className="p-2 border border-black">{row.teus_realisasi}</td>
            {/* Turun CY */}
            <td className="p-2 border border-black">{row.turun_cy_20dc}</td>
            <td className="p-2 border border-black">{row.turun_cy_40hc}</td>
            <td className="p-2 border border-black">{row.teus_turun_cy}</td>
            {/* Sisa kolom */}
            <td className="p-2 border border-black">{(row.percentage_vessel * 100).toFixed(1)}%</td>
            <td className="p-2 border border-black">{row.obstacles}</td>
            <td className="p-2 border border-black">{row.created_at?.slice(0, 10)}</td>
            <td className="p-2 border border-black">{row.updated_at?.slice(0, 10)}</td>
          </tr>
        ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MonitoringVoyages;

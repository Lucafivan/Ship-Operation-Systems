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
        <table className="min-w-[1200px] w-full border text-xs md:text-sm bg-white shadow rounded-lg">
          <thead className="bg-green-200">
        <tr>
          <th className="p-2 border">Vessel</th>
          <th className="p-2 border">Voyage Number</th>
          <th className="p-2 border">Voyage Year</th>
          <th className="p-2 border">Berth Location</th>
          <th className="p-2 border">Date Berth</th>
          <th className="p-2 border">Bongkaran 20DC</th>
          <th className="p-2 border">Bongkaran 40HC</th>
          <th className="p-2 border">Bongkaran Full 20DC</th>
          <th className="p-2 border">Bongkaran Full 40HC</th>
          <th className="p-2 border">Pengajuan 20DC</th>
          <th className="p-2 border">Pengajuan 40HC</th>
          <th className="p-2 border">Teus Pengajuan</th>
          <th className="p-2 border">Realisasi 20DC</th>
          <th className="p-2 border">Realisasi 40HC</th>
          <th className="p-2 border">Teus Realisasi</th>
          <th className="p-2 border">Turun CY 20DC</th>
          <th className="p-2 border">Turun CY 40HC</th>
          <th className="p-2 border">Teus Turun CY</th>
          <th className="p-2 border">% Vessel</th>
          <th className="p-2 border">Obstacles</th>
          <th className="p-2 border">Created</th>
          <th className="p-2 border">Updated</th>
        </tr>
          </thead>
          <tbody>
        {data.map((row) => (
          <tr key={row.id} className="even:bg-green-50">
            <td className="p-2 border">{row.vessel_name}</td>
            <td className="p-2 border">{row.voyage_number}</td>
            <td className="p-2 border">{row.voyage_year}</td>
            <td className="p-2 border">{row.voyage_berth_loc}</td>
            <td className="p-2 border">{row.voyage_date_berth?.slice(0, 10)}</td>
            <td className="p-2 border">{row.bongkaran_empty_20dc}</td>
            <td className="p-2 border">{row.bongkaran_empty_40hc}</td>
            <td className="p-2 border">{row.bongkaran_full_20dc}</td>
            <td className="p-2 border">{row.bongkaran_full_40hc}</td>
            <td className="p-2 border">{row.total_pengajuan_20dc}</td>
            <td className="p-2 border">{row.total_pengajuan_40hc}</td>
            <td className="p-2 border">{row.teus_pengajuan}</td>
            <td className="p-2 border">{row.total_realisasi_20dc}</td>
            <td className="p-2 border">{row.total_realisasi_40hc}</td>
            <td className="p-2 border">{row.teus_realisasi}</td>
            <td className="p-2 border">{row.turun_cy_20dc}</td>
            <td className="p-2 border">{row.turun_cy_40hc}</td>
            <td className="p-2 border">{row.teus_turun_cy}</td>
            <td className="p-2 border">{(row.percentage_vessel * 100).toFixed(1)}%</td>
            <td className="p-2 border">{row.obstacles}</td>
            <td className="p-2 border">{row.created_at?.slice(0, 10)}</td>
            <td className="p-2 border">{row.updated_at?.slice(0, 10)}</td>
          </tr>
        ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MonitoringVoyages;

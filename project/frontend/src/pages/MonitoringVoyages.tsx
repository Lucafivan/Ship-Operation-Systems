import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../api/axios";
import { Button } from "../components/ui/Button";
import Modal from "../components/modals";
import VoyageForm from "../components/form/voyagesform";
import toast from "react-hot-toast";

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [data, setData] = useState<ContainerMovement[]>([]);
  const [loading, setLoading] = useState(true);
  // Date filter state
  type DatePreset = 'all' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStart, setCustomStart] = useState<string>(''); // YYYY-MM-DD
  const [customEnd, setCustomEnd] = useState<string>('');     // YYYY-MM-DD
  type SortKey =
    | "vessel_name"
    | "voyage_number"
    | "voyage_year"
    | "voyage_berth_loc"
    | "voyage_date_berth"
    | "created_at"
    | "updated_at";
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  } | null>(null);

  const requestSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const filteredData = useMemo(() => {
    // Compute [start, end] dates depending on preset
    if (datePreset === 'all') return data;
  const now = new Date();

    const startOfWeek = (d: Date) => {
      const dt = new Date(d);
      const day = dt.getDay(); // 0=Sun,1=Mon,...
      const diffToMon = (day + 6) % 7; // days since Monday
      dt.setHours(0, 0, 0, 0);
      dt.setDate(dt.getDate() - diffToMon);
      return dt;
    };
    const endOfWeek = (d: Date) => {
      const s = startOfWeek(d);
      const e = new Date(s);
      e.setDate(s.getDate() + 6);
      e.setHours(23, 59, 59, 999);
      return e;
    };
    const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

    let range: { s?: Date; e?: Date } = {};
    switch (datePreset) {
      case 'this_week':
        range = { s: startOfWeek(now), e: endOfWeek(now) };
        break;
      case 'last_week': {
        const lastW = new Date(now);
        lastW.setDate(now.getDate() - 7);
        range = { s: startOfWeek(lastW), e: endOfWeek(lastW) };
        break; }
      case 'this_month':
        range = { s: startOfMonth(now), e: endOfMonth(now) };
        break;
      case 'last_month': {
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 15);
        range = { s: startOfMonth(lm), e: endOfMonth(lm) };
        break; }
      case 'custom': {
        const s = customStart ? new Date(customStart + 'T00:00:00') : undefined;
        const e = customEnd ? new Date(customEnd + 'T23:59:59.999') : undefined;
        range = { s, e };
        break; }
      default:
        return data;
    }

    return data.filter((row) => {
      if (!row.voyage_date_berth) return false;
      const t = Date.parse(row.voyage_date_berth);
      if (Number.isNaN(t)) return false;
      const d = new Date(t);
      if (range.s && d < range.s) return false;
      if (range.e && d > range.e) return false;
      return true;
    });
  }, [data, datePreset, customStart, customEnd]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const { key, direction } = sortConfig;
    const dir = direction === "asc" ? 1 : -1;
    const getVal = (row: ContainerMovement) => {
      const v = row[key as keyof ContainerMovement] as unknown as string | number | null | undefined;
      if (key === "voyage_year") return typeof v === "number" ? v : Number(v ?? 0);
      if (key === "voyage_number") {
        const s = v == null ? "" : String(v);
        const n = Number(s);
        return Number.isFinite(n) ? n : s.toLowerCase();
      }
      if (key === "voyage_date_berth" || key === "created_at" || key === "updated_at") {
        const ts = v ? Date.parse(String(v)) : NaN;
        return isNaN(ts) ? -Infinity : ts;
      }
      // string-ish compare, case-insensitive
      return v == null ? "" : String(v).toLowerCase();
    };
    return [...filteredData].sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const fetchData = async () => {
    // Set loading ke true setiap kali data baru diambil
    setLoading(true);
    try {
      const res = await apiClient.get<ContainerMovement[]>("/container_movements/");
      setData(res.data);
    } catch (err) {
      toast.error("Gagal memuat data monitoring.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSuccess = () => {
    setIsModalOpen(false); // Tutup modal
    fetchData(); // Ambil ulang data terbaru
  };

  if (loading)
    return (
      <div className="p-6 text-center text-slate-600">Loading Monitoring Voyages…</div>
    );

  return (
    <>
            <div className="overflow-x-auto py-4">
              <h1 className="text-2xl font-semibold mb-4 text-slate-800">
                Monitoring Voyages
              </h1>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          {/* Bagian kiri: filter */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col px-1">
              <label className="text-xs text-slate-600">Date Filter</label>
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value as DatePreset)}
                className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All</option>
                <option value="this_week">This Week</option>
                <option value="last_week">Last Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {datePreset === "custom" && (
              <>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-600">Start</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow hover:bg-slate-200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-600">End</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow hover:bg-slate-200"
                  />
                </div>
              </>
            )}

            <button
              onClick={() => {
                setDatePreset("all");
                setCustomStart("");
                setCustomEnd("");
              }}
              className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow hover:bg-slate-200"
            >
              Reset
            </button>

          
          </div>

           {/* Filter di sini */}
            <div className="flex justify-start">
              <Button

                onClick={() => setIsModalOpen(true)}
                type="button"
                variant="primary"
              >
                Tambah Data
              </Button>
            </div>

             {/* Modal Form */}
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Tambah Voyage Baru"
            >
              {/* 3. Gunakan handleSuccess pada prop onSuccess */}
              <VoyageForm onSuccess={handleSuccess} />
          </Modal>
              </div>
      </div>

      <div className="overflow-x-auto py-4">
        <table className="min-w-[1200px] w-full text-xs md:text-sm bg-white shadow-lg rounded-xl ring-1 ring-slate-200">
          <thead className="bg-gradient-to-r from-green-700 to-emerald-600">
        <tr className="text-white">
          <th className="p-2 border border-slate-200/30" rowSpan={4} aria-sort={sortConfig?.key === "vessel_name" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
            <button onClick={() => requestSort("vessel_name")} className="flex items-center gap-1 hover:opacity-90">
              Vessel
              <span className="text-[10px] opacity-80">{sortConfig?.key === "vessel_name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}</span>
            </button>
          </th>
          <th className="p-2 border border-slate-200/30" rowSpan={4} aria-sort={sortConfig?.key === "voyage_number" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
            <button onClick={() => requestSort("voyage_number")} className="flex items-center gap-1 hover:opacity-90">
              Voyage Number
              <span className="text-[10px] opacity-80">{sortConfig?.key === "voyage_number" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}</span>
            </button>
          </th>
          <th className="p-2 border border-slate-200/30" rowSpan={4} aria-sort={sortConfig?.key === "voyage_year" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
            <button onClick={() => requestSort("voyage_year")} className="flex items-center gap-1 hover:opacity-90">
              Voyage Year
              <span className="text-[10px] opacity-80">{sortConfig?.key === "voyage_year" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}</span>
            </button>
          </th>
          <th className="p-2 border border-slate-200/30" rowSpan={4} aria-sort={sortConfig?.key === "voyage_berth_loc" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
            <button onClick={() => requestSort("voyage_berth_loc")} className="flex items-center gap-1 hover:opacity-90">
              Berth Location
              <span className="text-[10px] opacity-80">{sortConfig?.key === "voyage_berth_loc" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}</span>
            </button>
          </th>
          <th className="p-2 border border-slate-200/30" rowSpan={4} aria-sort={sortConfig?.key === "voyage_date_berth" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
            <button onClick={() => requestSort("voyage_date_berth")} className="flex items-center gap-1 hover:opacity-90">
              Date Berth
              <span className="text-[10px] opacity-80">{sortConfig?.key === "voyage_date_berth" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}</span>
            </button>
          </th>
          <th className="p-2 border border-slate-200/30" colSpan={4}>Bongkaran</th>
          <th className="p-2 border border-slate-200/30" colSpan={4}>Pengajuan</th>
          <th className="p-2 border border-slate-200/30" colSpan={4}>Acc Pengajuan</th>
          <th className="p-2 border border-slate-200/30" colSpan={3}>Total Pengajuan</th>
          <th className="p-2 border border-slate-200/30" colSpan={4}>Realisasi All Depo</th>
          <th className="p-2 border border-slate-200/30" colSpan={8}>Shipside</th>
          <th className="p-2 border border-slate-200/30" colSpan={3}>Total Realisasi</th>
          <th className="p-2 border border-slate-200/30" colSpan={3}>Turun CY</th>
          <th className="p-2 border border-slate-200/30" rowSpan={4}>% Vessel</th>
          <th className="p-2 border border-slate-200/30" rowSpan={4}>Obstacles</th>
          <th className="p-2 border border-slate-200/30" rowSpan={4} aria-sort={sortConfig?.key === "created_at" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
            <button onClick={() => requestSort("created_at")} className="flex items-center gap-1 hover:opacity-90">
              Created
              <span className="text-[10px] opacity-80">{sortConfig?.key === "created_at" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}</span>
            </button>
          </th>
          <th className="p-2 border border-slate-200/30" rowSpan={4} aria-sort={sortConfig?.key === "updated_at" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
            <button onClick={() => requestSort("updated_at")} className="flex items-center gap-1 hover:opacity-90">
              Updated
              <span className="text-[10px] opacity-80">{sortConfig?.key === "updated_at" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}</span>
            </button>
          </th>
        </tr>
        <tr className="text-white">
          <th className="p-2 border border-slate-200/30" colSpan={2}>Empty</th>
          <th className="p-2 border border-slate-200/30" colSpan={2}>Full</th>
          <th className="p-2 border border-slate-200/30" colSpan={2}>Empty</th>
          <th className="p-2 border border-slate-200/30" colSpan={2}>Full</th>
          <th className="p-2 border border-slate-200/30" colSpan={2}>Empty</th>
          <th className="p-2 border border-slate-200/30" colSpan={2}>Full</th>
          <th className="p-2 border border-slate-200/30" colSpan={2}>Box</th>
          <th className="p-2 border border-slate-200/30" rowSpan={3}>Teus Pengajuan</th>
          <th className="p-2 border border-slate-200/30" colSpan={2}>MXD</th>
          <th className="p-2 border border-slate-200/30" colSpan={2}>FXD</th>
          <th className="p-2 border border-slate-200/30" colSpan={4}>YES</th>
          <th className="p-2 border border-slate-200/30" colSpan={4}>NO</th>
          <th className="p-2 border border-slate-200/30" colSpan={2}>Box</th>
          <th className="p-2 border border-slate-200/30" rowSpan={3}>Teus Realisasi</th>
          <th className="p-2 border border-slate-200/30" colSpan={2}>Box</th>
          <th className="p-2 border border-slate-200/30" rowSpan={3}>Teus Turun CY</th>
        </tr>
        <tr className="text-white">
          <th className="p-2 border border-slate-200/30" rowSpan={2}>20DC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>40HC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>20DC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>40HC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>20DC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>40HC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>20DC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>40HC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>20DC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>40HC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>20DC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>40HC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>20DC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>40HC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>20DC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>40HC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>20DC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>40HC</th>
          <th className="p-2 border border-slate-200/30" colSpan={2}>MXD</th>
          <th className="p-2 border border-slate-200/30" colSpan={2}>FXD</th>
          <th className="p-2 border border-slate-200/30" colSpan={2}>MXD</th>
          <th className="p-2 border border-slate-200/30" colSpan={2}>FXD</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>20DC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>40HC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>20DC</th>
          <th className="p-2 border border-slate-200/30" rowSpan={2}>40HC</th>
        </tr>
        <tr className="text-white">
          <th className="p-2 border border-slate-200/30">20DC</th>
          <th className="p-2 border border-slate-200/30">40HC</th>
          <th className="p-2 border border-slate-200/30">20DC</th>
          <th className="p-2 border border-slate-200/30">40HC</th>
          <th className="p-2 border border-slate-200/30">20DC</th>
          <th className="p-2 border border-slate-200/30">40HC</th>
          <th className="p-2 border border-slate-200/30">20DC</th>
          <th className="p-2 border border-slate-200/30">40HC</th>
        </tr>
          </thead>
          <tbody>
        {sortedData.map((row) => (
          <tr key={row.id} className="even:bg-emerald-50 hover:bg-emerald-100/60 transition-colors">
            <td className="p-2 border border-slate-200">{row.vessel_name}</td>
            <td className="p-2 border border-slate-200">{row.voyage_number}</td>
            <td className="p-2 border border-slate-200">{row.voyage_year}</td>
            <td className="p-2 border border-slate-200">{row.voyage_berth_loc}</td>
            <td className="p-2 border border-slate-200">{row.voyage_date_berth?.slice(0, 10)}</td>
            {/* Bongkaran */}
            <td className="p-2 border border-slate-200">{row.bongkaran_empty_20dc}</td>
            <td className="p-2 border border-slate-200">{row.bongkaran_empty_40hc}</td>
            <td className="p-2 border border-slate-200">{row.bongkaran_full_20dc}</td>
            <td className="p-2 border border-slate-200">{row.bongkaran_full_40hc}</td>
            {/* Pengajuan */}
            <td className="p-2 border border-slate-200">{row.pengajuan_empty_20dc}</td>
            <td className="p-2 border border-slate-200">{row.pengajuan_empty_40hc}</td>
            <td className="p-2 border border-slate-200">{row.pengajuan_full_20dc}</td>
            <td className="p-2 border border-slate-200">{row.pengajuan_full_40hc}</td>
            {/* Acc Pengajuan */}
            <td className="p-2 border border-slate-200">{row.acc_pengajuan_empty_20dc}</td>
            <td className="p-2 border border-slate-200">{row.acc_pengajuan_empty_40hc}</td>
            <td className="p-2 border border-slate-200">{row.acc_pengajuan_full_20dc}</td>
            <td className="p-2 border border-slate-200">{row.acc_pengajuan_full_40hc}</td>
            {/* Total Pengajuan */}
            <td className="p-2 border border-slate-200">{row.total_pengajuan_20dc}</td>
            <td className="p-2 border border-slate-200">{row.total_pengajuan_40hc}</td>
            <td className="p-2 border border-slate-200">{row.teus_pengajuan}</td>
            {/* Realisasi All Depo */}
            <td className="p-2 border border-slate-200">{row.realisasi_mxd_20dc}</td>
            <td className="p-2 border border-slate-200">{row.realisasi_mxd_40hc}</td>
            <td className="p-2 border border-slate-200">{row.realisasi_fxd_20dc}</td>
            <td className="p-2 border border-slate-200">{row.realisasi_fxd_40hc}</td>
            {/* Shipside YES MXD */}
            <td className="p-2 border border-slate-200">{row.shipside_yes_mxd_20dc}</td>
            <td className="p-2 border border-slate-200">{row.shipside_yes_mxd_40hc}</td>
            {/* Shipside YES FXD */}
            <td className="p-2 border border-slate-200">{row.shipside_yes_fxd_20dc}</td>
            <td className="p-2 border border-slate-200">{row.shipside_yes_fxd_40hc}</td>
            {/* Shipside NO MXD */}
            <td className="p-2 border border-slate-200">{row.shipside_no_mxd_20dc}</td>
            <td className="p-2 border border-slate-200">{row.shipside_no_mxd_40hc}</td>
            {/* Shipside NO FXD */}
            <td className="p-2 border border-slate-200">{row.shipside_no_fxd_20dc}</td>
            <td className="p-2 border border-slate-200">{row.shipside_no_fxd_40hc}</td>
            {/* Total Realisasi */}
            <td className="p-2 border border-slate-200">{row.total_realisasi_20dc}</td>
            <td className="p-2 border border-slate-200">{row.total_realisasi_40hc}</td>
            <td className="p-2 border border-slate-200">{row.teus_realisasi}</td>
            {/* Turun CY */}
            <td className="p-2 border border-slate-200">{row.turun_cy_20dc}</td>
            <td className="p-2 border border-slate-200">{row.turun_cy_40hc}</td>
            <td className="p-2 border border-slate-200">{row.teus_turun_cy}</td>
            {/* Sisa kolom */}
            <td className="p-2 border border-slate-200">{(row.percentage_vessel * 100).toFixed(1)}%</td>
            <td className="p-2 border border-slate-200">{row.obstacles}</td>
            <td className="p-2 border border-slate-200">{row.created_at?.slice(0, 10)}</td>
            <td className="p-2 border border-slate-200">{row.updated_at?.slice(0, 10)}</td>
          </tr>
        ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MonitoringVoyages;

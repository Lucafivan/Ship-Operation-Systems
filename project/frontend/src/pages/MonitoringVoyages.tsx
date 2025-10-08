import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../api/axios";
import Modal from "../components/modals";
import EditContainerMovementModal from "../components/modals/EditContainerMovementModal";
import VoyageForm from "../components/form/voyagesform";
import toast from "react-hot-toast";

interface ContainerMovement {
  id: number;
  voyage_id: number;
  vessel_name: string;
  voyage_number: string;
  voyage_year: number;
  port_id: number;
  port_name: string;
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
  voyage_created_at: string;
}

const MonitoringVoyages: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<ContainerMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showCost, setShowCost] = useState(false);

  interface VoyageEstimation {
    estimation_cost1: number | null;
    estimation_cost2: number | null;
    final_cost: number | null;
    computed_at?: string | null;
  }
  const [estimations, setEstimations] = useState<Record<number, VoyageEstimation>>({});

  // Global search states 
  const [useAllPagesForSearch] = useState(false);
  const [allData, setAllData] = useState<ContainerMovement[]>([]);
  const [allLoaded, setAllLoaded] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

  // per-page dropdown state
  const [perPage, setPerPage] = useState<number>(10);

  const MAX_VISIBLE_ROWS = 8;
  const BODY_ROW_APPROX_PX = 200;
  const HEADER_STACK_PX = 180;
  const maxBodyHeight = `calc(${HEADER_STACK_PX}px + ${BODY_ROW_APPROX_PX * MAX_VISIBLE_ROWS}px)`;
  // Cost table header is single-row, so smaller stack height
  const COST_HEADER_PX = 48;
  const maxCostHeight = `calc(${COST_HEADER_PX}px + ${BODY_ROW_APPROX_PX * MAX_VISIBLE_ROWS}px)`;

  type DatePreset = 'all' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  type SortKey =
    | "vessel_name"
    | "voyage_number"
    | "voyage_year"
    | "port_name"
    | "voyage_date_berth"
    | "created_at"
    | "updated_at"
    | "voyage_created_at";
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  } | null>({ key: "voyage_created_at", direction: "desc" });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ContainerMovement | null>(null);

  const openEdit = (row: ContainerMovement) => {
    setEditingRow(row);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingRow(null);
  };

  const requestSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // choose data source for pipeline
  const [searchKey, setSearchKey] = useState<
    'all' | 'vessel_name' | 'voyage_number' | 'voyage_year' | 'port_name' |
    'voyage_date_berth' | 'created_at' | 'updated_at' | 'voyage_created_at' | 'obstacles'
  >('all');
  const [searchText, setSearchText] = useState('');

  // Source data: if global-search ON **and** ada query, pakai allData; else pakai page data biasa
  const sourceData: ContainerMovement[] = useMemo(() => {
    if (useAllPagesForSearch && searchText.trim()) return allData;
    return data;
  }, [useAllPagesForSearch, searchText, allData, data]);

  // Ambil semua halaman sekali (cache) saat dibutuhkan
  const fetchAllPages = async () => {
    if (loadingAll) return;
    setLoadingAll(true);
    try {
      let page = 1;
      const acc: ContainerMovement[] = [];
      let keepGoing = true;
      // batasi safety max 100 page agar tidak infinite loop
      for (let i = 0; i < 100 && keepGoing; i++) {
        const res = await apiClient.get(`/container_movements/?page=${page}&per_page=10`);
        const rows: ContainerMovement[] = res.data.data || [];
        const hasNext: boolean = !!res.data.has_next;
        acc.push(...rows);
        if (!hasNext) {
          keepGoing = false;
        } else {
          page += 1;
        }
      }
      // de-dup pakai key (id || voyage_id)
      const map = new Map<number, ContainerMovement>();
      for (const r of acc) {
        const k = (r.id ?? r.voyage_id) as number;
        map.set(k, r);
      }
      const merged = Array.from(map.values());
      setAllData(merged);
      setAllLoaded(true);
    } catch (e) {
      console.error('Gagal mengambil semua halaman', e);
      toast.error('Gagal mengambil semua halaman untuk pencarian.');
    } finally {
      setLoadingAll(false);
    }
  };

  // Jika user ON-kan global search dan mengetik query, pastikan cache tersedia
  useEffect(() => {
    if (useAllPagesForSearch && searchText.trim() && !allLoaded && !loadingAll) {
      fetchAllPages();
    }
  }, [useAllPagesForSearch, searchText, allLoaded, loadingAll]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pipeline existing (pakai sourceData, bukan data langsung)
  const filteredData = useMemo(() => {
    if (datePreset === 'all') return sourceData;
    const now = new Date();

    const startOfWeek = (d: Date) => {
      const dt = new Date(d);
      const day = dt.getDay();
      const diffToMon = (day + 6) % 7;
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
        return sourceData;
    }

    return sourceData.filter((row) => {
      if (!row.voyage_date_berth) return false;
      const t = Date.parse(row.voyage_date_berth);
      if (Number.isNaN(t)) return false;
      const d = new Date(t);
      if (range.s && d < range.s) return false;
      if (range.e && d > range.e) return false;
      return true;
    });
  }, [sourceData, datePreset, customStart, customEnd]);

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
      if (key === "voyage_date_berth" || key === "created_at" || key === "updated_at" || key === "voyage_created_at") {
        const ts = v ? Date.parse(String(v)) : NaN;
        if (isNaN(ts)) {
          return direction === 'desc' ? Infinity : -Infinity;
        }
        return ts;
      }
      return v == null ? "" : String(v).toLowerCase();
    };
    return [...filteredData].sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return (b.id ?? 0) - (a.id ?? 0);
    });
  }, [filteredData, sortConfig]);

  const ALL_KEYS = useMemo<(keyof ContainerMovement)[]>(() => {
    const ref = (sourceData.length ? sourceData[0] : (data[0] || {})) as ContainerMovement;
    return Object.keys(ref) as (keyof ContainerMovement)[];
  }, [sourceData, data]);

  const finalData = useMemo(() => {
    // minimal guard: kalau server-side search aktif (default), jangan filter di FE lagi
    if (searchText.trim() && !useAllPagesForSearch) return sortedData;

    if (!searchText.trim()) return sortedData;

    const q = searchText.trim().toLowerCase();
    const startsWithQ = (val: unknown) => {
      if (val == null) return false;
      const s = String(val).toLowerCase();
      return s.startsWith(q);
    };

    if (searchKey === 'all') {
      return sortedData.filter((row) =>
        ALL_KEYS.some((k) => startsWithQ((row as any)[k]))
      );
    } else {
      return sortedData.filter((row) => startsWithQ((row as any)[searchKey]));
    }
  }, [sortedData, searchText, searchKey, ALL_KEYS, useAllPagesForSearch]);

  // fetchData bisa "silent" agar tidak men-trigger spinner
  const fetchData = async (page = 1, opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', String(perPage));
      if (!useAllPagesForSearch && searchText.trim()) {
        params.set('q', searchText.trim());
        params.set('field', searchKey);
      }

      const res = await apiClient.get(`/container_movements/?${params.toString()}`);
      setData(res.data.data);
      setTotalPages(res.data.pages);
      setCurrentPage(res.data.current_page);
      setTotalRecords(res.data.total);
      // data page berubah -> invalidasi cache allData supaya refresh saat butuh
      setAllLoaded(false);
    } catch (err) {
      toast.error("Gagal memuat data monitoring.");
      console.error(err);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, perPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // debounce refetch saat query/kolom berubah (server-side)
  useEffect(() => {
    if (useAllPagesForSearch) return; // kalau user pilih global FE search, biarkan FE yang filter
    const t = setTimeout(() => {
      fetchData(1, { silent: true });
    }, 250);
    return () => clearTimeout(t);
  }, [searchText, searchKey, useAllPagesForSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prefetch estimations when switching to cost view
  useEffect(() => {
    if (showCost) {
      // load estimations for currently filtered rows (limit to first 15 to avoid bursts)
      const ids = filteredData.slice(0, 15).map(r => r.voyage_id);
      ids.forEach((id) => {
        if (!estimations[id]) {
          fetchEstimation(id);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCost]);

  const fetchEstimation = async (voyageId: number) => {
    try {
      const res = await apiClient.get(`/cost/cost-estimation/${voyageId}`);
      const payload = res.data as VoyageEstimation | undefined;
      setEstimations((prev) => ({ ...prev, [voyageId]: payload ?? {
        estimation_cost1: null,
        estimation_cost2: null,
        final_cost: null,
        computed_at: null,
      } }));
    } catch (e) {
      console.error('Gagal mengambil cost estimation', e);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchData(1);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center text-slate-600">Loading Monitoring Voyages…</div>
    );

  return (
    <>
      <div className="overflow-x-auto">
        <h1 className="text-2xl font-semibold mb-4 text-slate-800">
          Monitoring Voyages
        </h1>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col px-1">
              <label className="text-xs text-slate-600">Date Filter</label>
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value as DatePreset)}
                className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none"
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
                    className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-600">End</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

          <div className="flex items-end gap-3 px-1">
            {/* Search controls */}
            <div className="flex flex-col md:flex-row items-end gap-2">
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow hover:bg-slate-200"
                  type="button"
                >
                  Clear
                </button>
              )}
              <div className="flex flex-col">
                <label className="text-xs text-slate-600">Cari</label>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Kata Kunci"
                  className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-slate-600">Pilih Kolom</label>
                <select
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value as any)}
                  className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none"
                >
                  <option value="all">Semua kolom</option>
                  <option value="vessel_name">Vessel</option>
                  <option value="voyage_number">Voyage Number</option>
                  <option value="voyage_year">Voyage Year</option>
                  <option value="port_name">Berth Location</option>
                  <option value="voyage_date_berth">Date Berth</option>
                  <option value="created_at">Created</option>
                  <option value="updated_at">Updated</option>
                  <option value="voyage_created_at">Voyage Created</option>
                  <option value="obstacles">Obstacles</option>
                </select>
              </div>

              {useAllPagesForSearch && searchText.trim() && (
                <span className="text-xs text-slate-500">
                  {loadingAll ? 'Mengambil semua halaman…' : (allLoaded ? `Data terambil: ${allData.length} baris` : 'Siap mengambil semua halaman')}
                </span>
              )}
            </div>

            <div className="flex justify-start">
              <button
                onClick={() => setShowCost((s) => !s)}
                className="text-sm rounded-md border border-slate-300 bg-white px-3 py-1 shadow hover:bg-slate-100"
                type="button"
              >
                {showCost ? 'Tampilkan Container Movement' : 'Tampilkan Cost Estimation'}
              </button>
            </div>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Tambah Voyage Baru"
          >
            <VoyageForm onSuccess={handleSuccess} />
          </Modal>
        </div>
      </div>

      <section className="bg-white backdrop-blur rounded-xl p-4 shadow mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium text-slate-800">
            {showCost ? 'Cost Estimation per Voyage' : 'Daftar Container Movement'}
          </h2>
          <div className="flex items-center gap-2">
            {!showCost && (
              <>
                <button
                  onClick={() => setIsModalOpen(true)}
                  type="button"
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-200"
                >
                  Tambah Data
                </button>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {!showCost && (
          <div
            className={`overflow-y-auto ${finalData.length > MAX_VISIBLE_ROWS ? 'shadow-inner' : ''} custom-scroll`}
            style={{ maxHeight: finalData.length > MAX_VISIBLE_ROWS ? maxBodyHeight : 'auto' }}
          >
            <table className="min-w-[1200px] w-full text-xs md:text-sm border-collapse">
              <thead className="sticky top-0 bg-gray-100 z-10 text-slate-700">
                <tr className="text-white">
                  <th className="p-2 font-medium border border-white bg-emerald-600 text-white" rowSpan={4}>Action</th>
                  <th className="p-2 font-medium border border-white bg-emerald-600 text-white" rowSpan={4} aria-sort={sortConfig?.key === "vessel_name" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
                    Vessel
                  </th>
                  <th className="p-2 font-medium border border-white bg-emerald-600 text-white" rowSpan={4} aria-sort={sortConfig?.key === "voyage_number" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
                    Voyage Number
                  </th>
                  <th className="p-2 font-medium border border-white bg-emerald-600 text-white" rowSpan={4} aria-sort={sortConfig?.key === "voyage_year" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
                    Voyage Year
                  </th>
                  <th className="p-2 font-medium border border-white bg-emerald-600 text-white" rowSpan={4} aria-sort={sortConfig?.key === "port_name" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
                    Berth Location
                  </th>
                  {/* Date Berth */}
                  <th className="p-2 font-medium border border-white bg-emerald-600 text-white w-[120px]" rowSpan={4} aria-sort={sortConfig?.key === "voyage_date_berth" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
                    <button onClick={() => requestSort("voyage_date_berth")} className="flex items-center gap-1 hover:opacity-90">
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
                  {/* Obstacles */}
                  <th className="p-2 border border-white bg-emerald-600 w-[200px]" rowSpan={4}>Obstacles</th>
                  {/* Created */}
                  <th className="p-2 border border-white bg-emerald-600 w-[120px]" rowSpan={4} aria-sort={sortConfig?.key === "created_at" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
                    Created
                  </th>
                  {/* Updated */}
                  <th className="p-2 border border-white bg-emerald-600 w-[120px]" rowSpan={4} aria-sort={sortConfig?.key === "updated_at" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
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
                  <th className="p-2 border border-white bg-emerald-600" colSpan={2}>MXD</th>
                  <th className="p-2 border border-white bg-emerald-600" colSpan={2}>FXD</th>
                  <th className="p-2 border border-white bg-emerald-600" colSpan={2}>MXD</th>
                  <th className="p-2 border border-white bg-emerald-600" colSpan={2}>FXD</th>
                  <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>20DC</th>
                  <th className="p-2 border border-white bg-emerald-600" rowSpan={2}>40HC</th>
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
              <tbody>
                {finalData.map((row) => (
                  <tr key={row.id ?? row.voyage_id} className="hover:bg-gray-50 border-b last:border-b-0">
                    <td className="p-2 align-middle text-center">
                      <button
                        onClick={() => openEdit(row)}
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
                    <td className="p-2 align-middle">{row.pengajuan_empty_20dc}</td>
                    <td className="p-2 align-middle">{row.pengajuan_empty_40hc}</td>
                    <td className="p-2 align-middle">{row.pengajuan_full_20dc}</td>
                    <td className="p-2 align-middle">{row.pengajuan_full_40hc}</td>
                    <td className="p-2 align-middle">{row.acc_pengajuan_empty_20dc}</td>
                    <td className="p-2 align-middle">{row.acc_pengajuan_empty_40hc}</td>
                    <td className="p-2 align-middle">{row.acc_pengajuan_full_20dc}</td>
                    <td className="p-2 align-middle">{row.acc_pengajuan_full_40hc}</td>
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
                    <td className="p-2 align-middle">{row.total_realisasi_20dc}</td>
                    <td className="p-2 align-middle">{row.total_realisasi_40hc}</td>
                    <td className="p-2 align-middle">{row.teus_realisasi}</td>
                    <td className="p-2 align-middle">{row.turun_cy_20dc}</td>
                    <td className="p-2 align-middle">{row.turun_cy_40hc}</td>
                    <td className="p-2 align-middle">{row.teus_turun_cy}</td>
                    <td className="p-2 align-middle">{row.percentage_vessel ? (row.percentage_vessel * 100).toFixed(1) + '%' : '0.0%'}</td>
                    <td className="p-2 align-middle">{row.obstacles}</td>
                    <td className="p-2 align-middle whitespace-nowrap">{row.created_at?.slice(0, 10)}</td>
                    <td className="p-2 align-middle whitespace-nowrap">{row.updated_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {showCost && (
            <div
              className={`overflow-y-auto ${finalData.length > MAX_VISIBLE_ROWS ? 'shadow-inner' : ''} custom-scroll`}
              style={{ maxHeight: finalData.length > MAX_VISIBLE_ROWS ? maxCostHeight : 'auto' }}
            >
              <table className="min-w-[1100px] w-full text-xs md:text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="text-white">
                    <th className="p-2 font-medium border border-white bg-emerald-600 text-white">Voyage</th>
                    <th className="p-2 font-medium border border-white bg-emerald-600 text-white">Berth Location</th>
                    <th className="p-2 font-medium border border-white bg-emerald-600 text-white">
                      <div className="flex flex-col items-start">
                        <span>Estimasi Cost 1</span>
                        <span className="text-[10px] opacity-90">(Diajukan + Tidak Diajukan)</span>
                      </div>
                    </th>
                    <th className="p-2 font-medium border border-white bg-emerald-600 text-white">
                      <div className="flex flex-col items-start">
                        <span>Estimasi Cost 2</span>
                        <span className="text-[10px] opacity-90">(ACC Pengajuan + Tidak TL)</span>
                      </div>
                    </th>
                    <th className="p-2 font-medium border border-white bg-emerald-600 text-white">
                      <div className="flex flex-col items-start">
                        <span>Final Cost</span>
                        <span className="text-[10px] opacity-90">(Tidak TL + Realisasi + Shipside + Turun CY)</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {finalData.map((row) => {
                    const e = estimations[row.voyage_id];
                    const fmt = (val?: number | null) =>
                      val == null ? '-' : val.toLocaleString('id-ID');
                    return (
                      <tr key={`est-${row.id ?? row.voyage_id}`} className="hover:bg-gray-50 border-b last:border-b-0">
                        <td className="p-2 align-middle">{row.vessel_name} / {row.voyage_number}-{row.voyage_year}</td>
                        <td className="p-2 align-middle">{row.port_name}</td>
                        <td className="p-2 align-middle">{e?.estimation_cost1 == null ? '-' : `Rp${fmt(e?.estimation_cost1)}`}</td>
                        <td className="p-2 align-middle">{e?.estimation_cost2 == null ? '-' : `Rp${fmt(e?.estimation_cost2)}`}</td>
                        <td className="p-2 align-middle">{e?.final_cost == null ? '-' : `Rp${fmt(e?.final_cost)}`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!showCost && totalPages > 0 && (
          <div className="flex items-center justify-between pt-3 border-t mt-4 text-sm">
            <span className="text-slate-600">
              Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> ({totalRecords} data)
            </span>
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2 mr-2">
                <span className="text-slate-600">Rows:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setPerPage(v);
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 shadow-sm focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage <= 1}
                className="rounded-md border border-slate-300 bg-white px-3 py-1 shadow-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>

              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-md border border-slate-300 bg-white px-3 py-1 shadow-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="rounded-md border border-slate-300 bg-white px-3 py-1 shadow-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages}
                className="rounded-md border border-slate-300 bg-white px-3 py-1 shadow-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </section>

      <EditContainerMovementModal
        isOpen={isEditOpen}
        onClose={closeEdit}
        row={editingRow}
        onUpdated={() => fetchData(currentPage)}
      />
    </>
  );
};

export default MonitoringVoyages;
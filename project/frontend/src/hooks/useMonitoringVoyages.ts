import { useEffect, useMemo, useRef, useState } from 'react';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import type { ContainerMovement, DatePreset, SortConfig, SortKey, VoyageEstimation } from '../pages/monitoring.types';
import { PredictionService, type SizeKey } from '../services/PredictionService';

export function useMonitoringVoyages() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<ContainerMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showCost, setShowCost] = useState(false);
  const [estimations, setEstimations] = useState<Record<number, VoyageEstimation>>({});
  const [predictions, setPredictions] = useState<Record<number, Partial<ContainerMovement>>>({});
  const predictingRef = useRef<Set<number>>(new Set());

  const [useAllPagesForSearch] = useState(false);
  const [allData, setAllData] = useState<ContainerMovement[]>([]);
  const [allLoaded, setAllLoaded] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [perPage, setPerPage] = useState<number>(10);

  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'voyage_created_at', direction: 'desc' });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ContainerMovement | null>(null);
  const [searchKey, setSearchKey] = useState<'all' | 'vessel_name' | 'voyage_number' | 'voyage_year' | 'port_name' | 'voyage_date_berth' | 'created_at' | 'updated_at' | 'voyage_created_at' | 'obstacles'>('all');
  const [searchText, setSearchText] = useState('');

  const requestSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sourceData: ContainerMovement[] = useMemo(() => {
    if (useAllPagesForSearch && searchText.trim()) return allData;
    return data;
  }, [useAllPagesForSearch, searchText, allData, data]);

  const fetchAllPages = async () => {
    if (loadingAll) return;
    setLoadingAll(true);
    try {
      let page = 1;
      const acc: ContainerMovement[] = [];
      let keepGoing = true;
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

  useEffect(() => {
    if (useAllPagesForSearch && searchText.trim() && !allLoaded && !loadingAll) {
      fetchAllPages();
    }
  }, [useAllPagesForSearch, searchText, allLoaded, loadingAll]);

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
        break;
      }
      case 'this_month':
        range = { s: startOfMonth(now), e: endOfMonth(now) };
        break;
      case 'last_month': {
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 15);
        range = { s: startOfMonth(lm), e: endOfMonth(lm) };
        break;
      }
      case 'custom': {
        const s = customStart ? new Date(customStart + 'T00:00:00') : undefined;
        const e = customEnd ? new Date(customEnd + 'T23:59:59.999') : undefined;
        range = { s, e };
        break;
      }
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
    const dir = direction === 'asc' ? 1 : -1;
    const getVal = (row: ContainerMovement) => {
      const v = row[key as keyof ContainerMovement] as unknown as string | number | null | undefined;
      if (key === 'voyage_year') return typeof v === 'number' ? v : Number(v ?? 0);
      if (key === 'voyage_number') {
        const s = v == null ? '' : String(v);
        const n = Number(s);
        return Number.isFinite(n) ? n : s.toLowerCase();
      }
      if (key === 'voyage_date_berth' || key === 'created_at' || key === 'updated_at' || key === 'voyage_created_at') {
        const ts = v ? Date.parse(String(v)) : NaN;
        if (isNaN(ts)) {
          return direction === 'desc' ? Infinity : -Infinity;
        }
        return ts;
      }
      return v == null ? '' : String(v).toLowerCase();
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
    if (searchText.trim() && !useAllPagesForSearch) return sortedData;
    if (!searchText.trim()) return sortedData;
    const q = searchText.trim().toLowerCase();
    const startsWithQ = (val: unknown) => {
      if (val == null) return false;
      const s = String(val).toLowerCase();
      return s.startsWith(q);
    };
    if (searchKey === 'all') {
      return sortedData.filter((row) => ALL_KEYS.some((k) => startsWithQ((row as any)[k])));
    } else {
      return sortedData.filter((row) => startsWithQ((row as any)[searchKey]));
    }
  }, [sortedData, searchText, searchKey, ALL_KEYS, useAllPagesForSearch]);

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
      setAllLoaded(false);
    } catch (err) {
      toast.error('Gagal memuat data monitoring.');
      console.error(err);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, perPage]);

  useEffect(() => {
    if (useAllPagesForSearch) return;
    const t = setTimeout(() => {
      fetchData(1, { silent: true });
    }, 250);
    return () => clearTimeout(t);
  }, [searchText, searchKey, useAllPagesForSearch]);

  useEffect(() => {
    if (showCost) {
      const ids = finalData.slice(0, 15).map((r) => r.voyage_id);
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
      setEstimations((prev) => ({
        ...prev,
        [voyageId]:
          payload ?? {
            estimation_cost1: null,
            estimation_cost2: null,
            final_cost: null,
            computed_at: null,
          },
      }));
    } catch (e) {
      console.error('Gagal mengambil cost estimation', e);
    }
  };

  const deriveSizeKeys = (row: ContainerMovement): Array<{
    size: SizeKey;
    bongkar: number;
    pengajuan: number;
    acc: number;
  }> => [
    { size: 'empty_20', bongkar: row.bongkaran_empty_20dc, pengajuan: row.pengajuan_empty_20dc, acc: row.acc_pengajuan_empty_20dc },
    { size: 'empty_40', bongkar: row.bongkaran_empty_40hc, pengajuan: row.pengajuan_empty_40hc, acc: row.acc_pengajuan_empty_40hc },
    { size: 'full_20', bongkar: row.bongkaran_full_20dc, pengajuan: row.pengajuan_full_20dc, acc: row.acc_pengajuan_full_20dc },
    { size: 'full_40', bongkar: row.bongkaran_full_40hc, pengajuan: row.pengajuan_full_40hc, acc: row.acc_pengajuan_full_40hc },
  ];

  const ensurePredictionsForRow = async (row: ContainerMovement) => {
    const key = row.voyage_id;
    if (predictions[key]) return;
    if (predictingRef.current.has(key)) return;
    predictingRef.current.add(key);
    if (import.meta.env.DEV) {
      console.debug('[predict] ensure start', { key, vessel: row.vessel_name, voyage: `${row.voyage_number}-${row.voyage_year}` });
    }
    const partial: Partial<ContainerMovement> = {};
    const baseFeatures: Record<string, any> = {
      'BERTH LOCATION': row.port_name,
      'VESSEL ID (DMY)': row.vessel_name,
      'Voyage Yr': row.voyage_year,
      'Voyage No.': row.voyage_number,
    };
    const ensureNum = (v: any) => (v == null || Number.isNaN(v) ? 0 : Number(v));
    const buildBongkaranFeatures = (r: ContainerMovement) => ({
      'TOTAL BONGKARAN_EMPTY_20 DC': ensureNum(r.bongkaran_empty_20dc),
      'TOTAL BONGKARAN_EMPTY_40 HC': ensureNum(r.bongkaran_empty_40hc),
      'TOTAL BONGKARAN_FULL_20 DC': ensureNum(r.bongkaran_full_20dc),
      'TOTAL BONGKARAN_FULL_40 HC': ensureNum(r.bongkaran_full_40hc),
    });
    const buildPengajuanFeatures = (r: ContainerMovement) => ({
      'PENGAJUAN KE PLANNER_EMPTY_20 DC': ensureNum(r.pengajuan_empty_20dc),
      'PENGAJUAN KE PLANNER_EMPTY_40 HC': ensureNum(r.pengajuan_empty_40hc),
      'PENGAJUAN KE PLANNER_FULL_20 DC': ensureNum(r.pengajuan_full_20dc),
      'PENGAJUAN KE PLANNER_FULL_40 HC': ensureNum(r.pengajuan_full_40hc),
    });
    const buildAccFeatures = (r: ContainerMovement) => ({
      'ACC PENGAJUAN_EMPTY_20 DC': ensureNum(r.acc_pengajuan_empty_20dc),
      'ACC PENGAJUAN_EMPTY_40 HC': ensureNum(r.acc_pengajuan_empty_40hc),
      'ACC PENGAJUAN_FULL_20 DC': ensureNum(r.acc_pengajuan_full_20dc),
      'ACC PENGAJUAN_FULL_40 HC': ensureNum(r.acc_pengajuan_full_40hc),
    });
    const ctx = {
      vessel: row.vessel_name,
      voyage_number: row.voyage_number,
      voyage_year: row.voyage_year,
      port_name: row.port_name,
      voyage_id: row.voyage_id,
    };

    const anyAccPresent = [
      row.acc_pengajuan_empty_20dc,
      row.acc_pengajuan_empty_40hc,
      row.acc_pengajuan_full_20dc,
      row.acc_pengajuan_full_40hc,
    ].some((v) => v != null && !Number.isNaN(v as any));
    const anyPengajuanPresent = [
      row.pengajuan_empty_20dc,
      row.pengajuan_empty_40hc,
      row.pengajuan_full_20dc,
      row.pengajuan_full_40hc,
    ].some((v) => v != null && !Number.isNaN(v as any));
    const anyBongkarPresent = [
      row.bongkaran_empty_20dc,
      row.bongkaran_empty_40hc,
      row.bongkaran_full_20dc,
      row.bongkaran_full_40hc,
    ].some((v) => v != null && !Number.isNaN(v as any));

    const mode: 'realisasi' | 'acc' | 'pengajuan' | 'none' = anyAccPresent
      ? 'realisasi'
      : anyPengajuanPresent
      ? 'acc'
      : anyBongkarPresent
      ? 'pengajuan'
      : 'none';
    if (import.meta.env.DEV) {
      console.debug('[predict] mode', { ...ctx, mode });
    }

    if (mode === 'pengajuan') {
      for (const sk of deriveSizeKeys(row)) {
        const hasBongkar = sk.bongkar != null && !Number.isNaN(sk.bongkar);
        const pengajuanMissing = sk.pengajuan == null || Number.isNaN(sk.pengajuan);
        const needsPengajuan = pengajuanMissing && hasBongkar;
        if (import.meta.env.DEV) {
          console.debug('[predict] pengajuan gate', { size: sk.size, bongkar: sk.bongkar, pengajuan: sk.pengajuan, needsPengajuan });
        }
        if (needsPengajuan) {
          if (import.meta.env.DEV) {
            console.debug('[predict][call] pengajuan', { ...ctx, size: sk.size, input_from: 'bongkaran', value: sk.bongkar });
          }
          const pred = await PredictionService.predictPengajuan(sk.size, { ...baseFeatures, ...buildBongkaranFeatures(row) });
          if (pred != null) {
            if (import.meta.env.DEV) {
              console.debug('[predict][result] pengajuan', { ...ctx, size: sk.size, value: pred });
            }
            if (sk.size === 'empty_20') partial.pengajuan_empty_20dc = pred;
            if (sk.size === 'empty_40') partial.pengajuan_empty_40hc = pred;
            if (sk.size === 'full_20') partial.pengajuan_full_20dc = pred;
            if (sk.size === 'full_40') partial.pengajuan_full_40hc = pred;
          } else if (import.meta.env.DEV) {
            console.debug('[predict][no-result] pengajuan', { ...ctx, size: sk.size });
          }
        }
      }
    } else if (mode === 'acc') {
      for (const sk of deriveSizeKeys(row)) {
        const hasPengajuan = sk.pengajuan != null && !Number.isNaN(sk.pengajuan);
        const accMissing = sk.acc == null || Number.isNaN(sk.acc);
        const needsAcc = accMissing && hasPengajuan;
        if (import.meta.env.DEV) {
          console.debug('[predict] acc gate', { size: sk.size, pengajuan: sk.pengajuan, acc: sk.acc, needsAcc });
        }
        if (needsAcc) {
          if (import.meta.env.DEV) {
            console.debug('[predict][call] acc', { ...ctx, size: sk.size, input_from: 'pengajuan', value: sk.pengajuan });
          }
          const pred = await PredictionService.predictAcc(sk.size, {
            ...baseFeatures,
            ...buildBongkaranFeatures(row),
            ...buildPengajuanFeatures(row),
          });
          if (pred != null) {
            if (import.meta.env.DEV) {
              console.debug('[predict][result] acc', { ...ctx, size: sk.size, value: pred });
            }
            if (sk.size === 'empty_20') partial.acc_pengajuan_empty_20dc = pred;
            if (sk.size === 'empty_40') partial.acc_pengajuan_empty_40hc = pred;
            if (sk.size === 'full_20') partial.acc_pengajuan_full_20dc = pred;
            if (sk.size === 'full_40') partial.acc_pengajuan_full_40hc = pred;
          } else if (import.meta.env.DEV) {
            console.debug('[predict][no-result] acc', { ...ctx, size: sk.size });
          }
        }
      }
    } else if (mode === 'realisasi') {
      for (const sk of deriveSizeKeys(row)) {
        const needEmpty20 = sk.size === 'empty_20' && (
          row.realisasi_mxd_20dc == null || row.shipside_yes_mxd_20dc == null || row.shipside_no_mxd_20dc == null
        );
        const needEmpty40 = sk.size === 'empty_40' && (
          row.realisasi_mxd_40hc == null || row.shipside_yes_mxd_40hc == null || row.shipside_no_mxd_40hc == null
        );
        const needFull20 = sk.size === 'full_20' && (
          row.realisasi_fxd_20dc == null || row.shipside_yes_fxd_20dc == null || row.shipside_no_fxd_20dc == null
        );
        const needFull40 = sk.size === 'full_40' && (
          row.realisasi_fxd_40hc == null || row.shipside_yes_fxd_40hc == null || row.shipside_no_fxd_40hc == null
        );
        const needThisSize = needEmpty20 || needEmpty40 || needFull20 || needFull40;
        if (import.meta.env.DEV) {
          console.debug('[predict] realisasi gate', { size: sk.size, acc: sk.acc, needThisSize });
        }
        if (needThisSize && (sk.acc != null && !Number.isNaN(sk.acc))) {
          if (import.meta.env.DEV) {
            console.debug('[predict][call] realisasi', { ...ctx, size: sk.size, input_from: 'acc', value: sk.acc });
          }
          const result = await PredictionService.predictRealisasi(sk.size, {
            ...baseFeatures,
            ...buildBongkaranFeatures(row),
            ...buildPengajuanFeatures(row),
            ...buildAccFeatures(row),
          });
          if (result) {
            if (import.meta.env.DEV) {
              console.debug('[predict][result] realisasi', { ...ctx, size: sk.size, result });
            }
            if (sk.size === 'empty_20') {
              if (row.realisasi_mxd_20dc == null) partial.realisasi_mxd_20dc = result['REALISASI_ALL_DEPO_MXD_20_DC'] ?? row.realisasi_mxd_20dc;
              if (row.shipside_yes_mxd_20dc == null) partial.shipside_yes_mxd_20dc = result['SHIPSIDE_YES_MXD_20_DC'] ?? row.shipside_yes_mxd_20dc;
              if (row.shipside_no_mxd_20dc == null) partial.shipside_no_mxd_20dc = result['SHIPSIDE_NO_MXD_20_DC'] ?? row.shipside_no_mxd_20dc;
            }
            if (sk.size === 'empty_40') {
              if (row.realisasi_mxd_40hc == null) partial.realisasi_mxd_40hc = result['REALISASI_ALL_DEPO_MXD_40_HC'] ?? row.realisasi_mxd_40hc;
              if (row.shipside_yes_mxd_40hc == null) partial.shipside_yes_mxd_40hc = result['SHIPSIDE_YES_MXD_40_HC'] ?? row.shipside_yes_mxd_40hc;
              if (row.shipside_no_mxd_40hc == null) partial.shipside_no_mxd_40hc = result['SHIPSIDE_NO_MXD_40_HC'] ?? row.shipside_no_mxd_40hc;
            }
            if (sk.size === 'full_20') {
              if (row.realisasi_fxd_20dc == null) partial.realisasi_fxd_20dc = result['REALISASI_ALL_DEPO_FXD_20_DC'] ?? row.realisasi_fxd_20dc;
              if (row.shipside_yes_fxd_20dc == null) partial.shipside_yes_fxd_20dc = result['SHIPSIDE_YES_FXD_20_DC'] ?? row.shipside_yes_fxd_20dc;
              if (row.shipside_no_fxd_20dc == null) partial.shipside_no_fxd_20dc = result['SHIPSIDE_NO_FXD_20_DC'] ?? row.shipside_no_fxd_20dc;
            }
            if (sk.size === 'full_40') {
              if (row.realisasi_fxd_40hc == null) partial.realisasi_fxd_40hc = result['REALISASI_ALL_DEPO_FXD_40_HC'] ?? row.realisasi_fxd_40hc;
              if (row.shipside_yes_fxd_40hc == null) partial.shipside_yes_fxd_40hc = result['SHIPSIDE_YES_FXD_40_HC'] ?? row.shipside_yes_fxd_40hc;
              if (row.shipside_no_fxd_40hc == null) partial.shipside_no_fxd_40hc = result['SHIPSIDE_NO_FXD_40_HC'] ?? row.shipside_no_fxd_40hc;
            }
          } else if (import.meta.env.DEV) {
            console.debug('[predict][no-result] realisasi', { ...ctx, size: sk.size });
          }
        }
      }
    }

    if (Object.keys(partial).length > 0) {
      setPredictions((prev) => ({ ...prev, [key]: partial }));
      if (import.meta.env.DEV) {
        console.debug('[predict] cache update', { key, fields: Object.keys(partial) });
      }
    }
    predictingRef.current.delete(key);
    if (import.meta.env.DEV) {
      console.debug('[predict] ensure end', { key });
    }
  };

  const openEdit = (row: ContainerMovement) => {
    setEditingRow(row);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingRow(null);
  };

  return {
    // state
    isModalOpen, setIsModalOpen,
    data, loading, currentPage, setCurrentPage, totalPages, totalRecords,
    showCost, setShowCost,
    estimations,
    predictions,
    useAllPagesForSearch, allData, allLoaded, loadingAll,
    perPage, setPerPage,
    datePreset, setDatePreset, customStart, setCustomStart, customEnd, setCustomEnd,
    sortConfig, setSortConfig, requestSort,
    isEditOpen, setIsEditOpen, editingRow, setEditingRow,
    searchKey, setSearchKey, searchText, setSearchText,
    // derived
    sourceData, filteredData, finalData,
    // actions
    fetchData, fetchEstimation, openEdit, closeEdit,
    ensurePredictionsForRow,
  } as const;
}

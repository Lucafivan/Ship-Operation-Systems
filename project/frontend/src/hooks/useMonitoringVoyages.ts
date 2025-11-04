import { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import type { ContainerMovement, DatePreset, SortConfig, SortKey, VoyageEstimation } from '../pages/monitoring.types';

export function useMonitoringVoyages() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<ContainerMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showCost, setShowCost] = useState(false);
  const [estimations, setEstimations] = useState<Record<number, VoyageEstimation>>({});

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
  } as const;
}

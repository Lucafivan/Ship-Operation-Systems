import { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import type { PortPercentagesResponse, PortSummary } from '../pages/dashboard.types';

export function useDashboardData() {
  const [summaryData, setSummaryData] = useState<PortSummary[]>([]);
  const [selectedPortId, setSelectedPortId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [pctLoading, setPctLoading] = useState(false);
  const [portPct, setPortPct] = useState<PortPercentagesResponse | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<PortSummary[]>('/container_movements/summary-by-port');
        const list = res.data ?? [];
        setSummaryData(list);
        if (list.length > 0) {
          const firstAlpha = [...list].sort((a, b) => a.port_name.localeCompare(b.port_name, undefined, { sensitivity: 'base' }))[0];
          setSelectedPortId(firstAlpha.port_id);
        }
      } catch (err) {
        toast.error('Gagal memuat data ringkasan untuk dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchPct = async () => {
      if (selectedPortId == null) {
        setPortPct(null);
        return;
      }
      setPctLoading(true);
      try {
        const res = await apiClient.get<PortPercentagesResponse>(`/percentages/by-port/${selectedPortId}`);
        setPortPct(res.data);
      } catch (err) {
        setPortPct(null);
        toast.error('Gagal memuat persentase untuk port terpilih.');
      } finally {
        setPctLoading(false);
      }
    };
    fetchPct();
  }, [selectedPortId]);

  const chartData = useMemo(() => {
    if (selectedPortId == null) return [] as { name: string; value: number }[];
    const portData = summaryData.find((d) => d.port_id === selectedPortId);
    if (!portData) return [] as { name: string; value: number }[];
    return [
      { name: 'Total Pengajuan', value: portData.total_pengajuan },
      { name: 'Total Realisasi', value: portData.total_realisasi },
    ];
  }, [selectedPortId, summaryData]);

  const by20 = portPct?.percentages.by_size?.['20dc'];
  const by40 = portPct?.percentages.by_size?.['40hc'];

  return {
    summaryData,
    selectedPortId,
    setSelectedPortId,
    loading,
    pctLoading,
    portPct,
    chartData,
    by20,
    by40,
  } as const;
}

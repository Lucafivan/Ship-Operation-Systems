import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

interface PortSummary {
  port_id: number;
  port_name: string;
  total_pengajuan: number;
  acc_pengajuan: number;
  total_realisasi: number;
}

interface PortPercentagesResponse {
  port_id: number;
  port_name: string;
  percentages: {
    pengajuan: number; // Total Pengajuan / Total Bongkar
    acc: number;       // Total ACC / Total Pengajuan
    tl: number;        // Total ACC / Total Bongkar
    realisasi: number; // Total TL+SS / Total Pengajuan
    by_size?: {
      ['20dc']?: { pengajuan: number; acc: number; tl: number; realisasi: number };
      ['40hc']?: { pengajuan: number; acc: number; tl: number; realisasi: number };
    }
  };
  totals?: {
    bongkaran?: { overall: number };
    pengajuan?: { overall: number };
    acc?: { overall: number };
    tlss?: { overall: number };
  };
}

const CHART_COLORS = ['#03c0ff', '#ffc658'];

const DashboardPage: React.FC = () => {
  const [summaryData, setSummaryData] = useState<PortSummary[]>([]);
  const [selectedPortId, setSelectedPortId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [pctLoading, setPctLoading] = useState(false);
  const [portPct, setPortPct] = useState<PortPercentagesResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<PortSummary[]>('/container_movements/summary-by-port');
        setSummaryData(res.data);
        if (res.data.length > 0) {
          setSelectedPortId(res.data[0].port_id);
        }
      } catch (err) {
        toast.error('Gagal memuat data ringkasan untuk dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const getChartDataForSelectedPort = () => {
    if (selectedPortId == null) return [];
    const portData = summaryData.find(d => d.port_id === selectedPortId);
    if (!portData) return [];
    return [
      { name: 'Total Pengajuan', value: portData.total_pengajuan },
      { name: 'Total Realisasi', value: portData.total_realisasi },
    ];
  };

  const chartData = getChartDataForSelectedPort();

  // Helper untuk format persentase
  const fmtPct = (v?: number) => (typeof v === 'number' ? `${v.toFixed(2)}%` : '-');

  // Komponen kartu persentase
  const PercentCard: React.FC<{ title: string; value?: number; desc?: string }> = ({ title, value, desc }) => (
    <div className="bg-white rounded-lg shadow p-4" title={desc /* tooltip cepat saat hover */}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        <span className="text-sm text-slate-400">
          {portPct?.port_name && selectedPortId != null ? portPct.port_name : ''}
        </span>
      </div>

      {/* Nilai */}
      <div className="mt-3">
        <div className="text-2xl font-semibold text-slate-800">
          {pctLoading ? '...' : fmtPct(value ?? 0)}
        </div>
        {desc && <p className="mt-1 text-xs text-slate-500">{desc}</p>}
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-2 rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }}
          />
        </div>
      </div>
    </div>
  );


  if (loading) {
    return <div className="p-6 text-center text-slate-600 font-semibold">Memuat Data Dashboard...</div>;
  }

  const by20 = portPct?.percentages.by_size?.['20dc'];
  const by40 = portPct?.percentages.by_size?.['40hc'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold mb-4 text-slate-800">
        Operation Dashboard
      </h1>

      {summaryData.length > 0 ? (
        <>
          <div className="bg-white p-4 rounded-lg shadow-sm max-w-sm">
            <label htmlFor="port-select" className="block text-sm font-medium text-gray-700 mb-2">
              Filter Berdasarkan Port:
            </label>
            <select
              id="port-select"
              value={selectedPortId ?? ''}
              onChange={(e) => setSelectedPortId(Number(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
            >
              {summaryData.map(item => (
                <option key={item.port_id} value={item.port_id}>
                  {item.port_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <PercentCard
              title="Persentase Pengajuan"
              value={portPct?.percentages.pengajuan ?? 0}
              desc="Total Pengajuan ÷ Total Bongkar Muat"
            />
            <PercentCard
              title="Persentase ACC"
              value={portPct?.percentages.acc ?? 0}
              desc="Total ACC ÷ Total Pengajuan"
            />
            <PercentCard
              title="Persentase Realisasi"
              value={portPct?.percentages.realisasi ?? 0}
              desc="Total TL+SS ÷ Total Pengajuan"
            />
            <PercentCard
              title="Persentase TL"
              value={portPct?.percentages.tl ?? 0}
              desc="Total ACC ÷ Total Bongkar Muat"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-700">Persentase per Size (20DC & 40HC)</h3>
            {/* 20DC & 40HC */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <PercentCard title="20DC — Pengajuan" value={by20?.pengajuan ?? 0} desc="Pengajuan 20DC ÷ Bongkar 20DC" />
              <PercentCard title="40HC — Pengajuan" value={by40?.pengajuan ?? 0} desc="Pengajuan 40HC ÷ Bongkar 40HC" />
              <PercentCard title="20DC — ACC"       value={by20?.acc ?? 0}       desc="ACC 20DC ÷ Pengajuan 20DC" />
              <PercentCard title="40HC — ACC"       value={by40?.acc ?? 0}       desc="ACC 40HC ÷ Pengajuan 40HC" />
              <PercentCard title="20DC — Realisasi" value={by20?.realisasi ?? 0} desc="TL+SS 20DC ÷ Pengajuan 20DC" />
              <PercentCard title="40HC — Realisasi" value={by40?.realisasi ?? 0} desc="TL+SS 40HC ÷ Pengajuan 40HC" />
              <PercentCard title="20DC — TL"        value={by20?.tl ?? 0}        desc="ACC 20DC ÷ Bongkar 20DC" />
              <PercentCard title="40HC — TL"        value={by40?.tl ?? 0}        desc="ACC 40HC ÷ Bongkar 40HC" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg" style={{ height: '500px' }}>
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">
              Ringkasan TEUs untuk Pelabuhan:{' '}
              <span className="text-green-700">
                {summaryData.find(p => p.port_id === selectedPortId)?.port_name || '-'}
              </span>
            </h2>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#4A5568' }} />
                <YAxis tick={{ fill: '#4A5568' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(230, 247, 237, 0.5)' }}
                  contentStyle={{
                    borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                />
                <Legend />
                <Bar dataKey="value" name="Jumlah TEUs" barSize={60}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-lg font-semibold text-gray-600">Tidak ada data untuk ditampilkan.</h2>
          <p className="text-gray-500 mt-2">Silakan tambahkan data voyage dan container movement terlebih dahulu.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
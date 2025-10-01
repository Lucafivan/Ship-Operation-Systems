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

const CHART_COLORS = ['#03c0ff', '#ffc658'];

const DashboardPage: React.FC = () => {
  const [summaryData, setSummaryData] = useState<PortSummary[]>([]);
  const [selectedPortId, setSelectedPortId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="p-6 text-center text-slate-600 font-semibold">Memuat Data Dashboard...</div>;
  }

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

          <div className="bg-white p-6 rounded-lg shadow-lg" style={{ height: '500px' }}>
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">
              Ringkasan TEUs untuk Pelabuhan: <span className="text-green-700">{summaryData.find(p => p.port_id === selectedPortId)?.port_name || '-'}</span>
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
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
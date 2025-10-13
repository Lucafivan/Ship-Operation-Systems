import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import PercentCard from '../components/dashboard/PercentCard';
import PortSelect from '../components/dashboard/PortSelect';
import TeusBarChart from '../components/dashboard/TeusBarChart';

const DashboardPage: React.FC = () => {
  const { summaryData, selectedPortId, setSelectedPortId, loading, pctLoading, portPct, chartData, by20, by40 } = useDashboardData();


  if (loading) {
    return <div className="p-6 text-center text-gray-50 font-semibold">Memuat Data Dashboard...</div>;
  }

  // by20 & by40 disediakan oleh hook

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold mb-4 text-gray-50">
        Operation Dashboard
      </h1>

      {summaryData.length > 0 ? (
        <>
          <PortSelect items={summaryData} value={selectedPortId} onChange={setSelectedPortId} />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <PercentCard title="Persentase Pengajuan" value={portPct?.percentages.pengajuan ?? 0} desc="Total Pengajuan ÷ Total Bongkar Muat" subtitle={portPct?.port_name} loading={pctLoading} />
            <PercentCard title="Persentase ACC" value={portPct?.percentages.acc ?? 0} desc="Total ACC ÷ Total Pengajuan" subtitle={portPct?.port_name} loading={pctLoading} />
            <PercentCard title="Persentase Realisasi" value={portPct?.percentages.realisasi ?? 0} desc="Total TL+SS ÷ Total Pengajuan" subtitle={portPct?.port_name} loading={pctLoading} />
            <PercentCard title="Persentase TL" value={portPct?.percentages.tl ?? 0} desc="Total ACC ÷ Total Bongkar Muat" subtitle={portPct?.port_name} loading={pctLoading} />
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-700">Persentase per Size (20DC & 40HC)</h3>
            {/* 20DC & 40HC */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <PercentCard title="20DC — Pengajuan" value={by20?.pengajuan ?? 0} desc="Pengajuan 20DC ÷ Bongkar 20DC" subtitle={portPct?.port_name} loading={pctLoading} />
              <PercentCard title="40HC — Pengajuan" value={by40?.pengajuan ?? 0} desc="Pengajuan 40HC ÷ Bongkar 40HC" subtitle={portPct?.port_name} loading={pctLoading} />
              <PercentCard title="20DC — ACC"       value={by20?.acc ?? 0}       desc="ACC 20DC ÷ Pengajuan 20DC" subtitle={portPct?.port_name} loading={pctLoading} />
              <PercentCard title="40HC — ACC"       value={by40?.acc ?? 0}       desc="ACC 40HC ÷ Pengajuan 40HC" subtitle={portPct?.port_name} loading={pctLoading} />
              <PercentCard title="20DC — Realisasi" value={by20?.realisasi ?? 0} desc="TL+SS 20DC ÷ Pengajuan 20DC" subtitle={portPct?.port_name} loading={pctLoading} />
              <PercentCard title="40HC — Realisasi" value={by40?.realisasi ?? 0} desc="TL+SS 40HC ÷ Pengajuan 40HC" subtitle={portPct?.port_name} loading={pctLoading} />
              <PercentCard title="20DC — TL"        value={by20?.tl ?? 0}        desc="ACC 20DC ÷ Bongkar 20DC" subtitle={portPct?.port_name} loading={pctLoading} />
              <PercentCard title="40HC — TL"        value={by40?.tl ?? 0}        desc="ACC 40HC ÷ Bongkar 40HC" subtitle={portPct?.port_name} loading={pctLoading} />
            </div>
          </div>

          <TeusBarChart
            title={`Ringkasan TEUs untuk Pelabuhan: ${summaryData.find(p => p.port_id === selectedPortId)?.port_name || '-'}`}
            data={chartData}
          />
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
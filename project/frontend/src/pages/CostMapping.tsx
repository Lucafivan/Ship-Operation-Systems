import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

type Port = { id: number; name: string };
type CostRateRow = {
  id: number;
  port_id: number;
  [key: string]: number | string;
};

const costFields = [
  'tdk_tl_20mt','tdk_tl_40mt','tdk_tl_20fl','tdk_tl_40fl',
  'tl_20mt','tl_40mt','tl_20fl','tl_40fl',
  'shipside_yes_20mt','shipside_yes_40mt','shipside_yes_20fl','shipside_yes_40fl',
  'shipside_no_20mt','shipside_no_40mt','shipside_no_20fl','shipside_no_40fl',
  'turun_cy_20mt','turun_cy_40mt','turun_cy_20fl','turun_cy_40fl'
];

const CostMapping: React.FC = () => {
  const [ports, setPorts] = useState<Port[]>([]);
  const [rates, setRates] = useState<CostRateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Scroll behavior similar to Monitoring Voyages
  const MAX_VISIBLE_ROWS = 8;
  const BODY_ROW_APPROX_PX = 34;
  const HEADER_STACK_PX = 44;
  const maxBodyHeight = `calc(${HEADER_STACK_PX}px + ${BODY_ROW_APPROX_PX * MAX_VISIBLE_ROWS}px)`;

  const portNameById = useMemo(() => {
    const m = new Map<number, string>();
    ports.forEach(p => m.set(p.id, p.name));
    return m;
  }, [ports]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pRes, rRes] = await Promise.all([
        apiClient.get<Port[]>('/ports'),
        apiClient.get<CostRateRow[]>('/cost/cost-rates'),
      ]);
      setPorts(pRes.data);
      setRates(rRes.data);
    } catch (e: any) {
      const msg = e?.response?.data?.msg || e?.message || 'Gagal memuat cost mapping';
      toast.error(msg);
      console.error('CostMapping loadAll error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onChangeField = (id: number, field: string, val: string) => {
    setRates(prev => prev.map(r => r.id === id ? { ...r, [field]: Number(val) } : r));
  };

  const saveRow = async (row: CostRateRow) => {
    setSavingId(row.id);
    try {
      const payload: any = { port_id: row.port_id };
      costFields.forEach(f => {
        if (row[f] !== undefined) payload[f] = row[f];
      });
      await apiClient.put(`/cost/cost-rates/${row.id}`, payload);
      toast.success('Berhasil menyimpan cost rate');
    } catch (e) {
      toast.error('Gagal menyimpan');
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="p-6 text-slate-600">Loading Cost Mapping…</div>;

  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl font-semibold mb-4 text-slate-800">Cost Mapping</h1>

      <section className="bg-white backdrop-blur rounded-xl p-4 shadow">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium text-slate-800">Daftar Cost Rate per Port</h2>
          <button
            onClick={loadAll}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
            disabled={loading}
            type="button"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className={`overflow-y-auto custom-scroll`} style={{ maxHeight: rates.length > MAX_VISIBLE_ROWS ? maxBodyHeight : 'auto' }}>
            <table className="min-w-[1200px] w-full text-xs md:text-sm border-collapse">
              <thead className="sticky top-0 bg-gray-100 z-10 text-slate-700">
                <tr className="text-white">
                  <th className="p-2 font-medium border border-white bg-emerald-600 text-white" rowSpan={2}>Action</th>
                  <th className="p-2 font-medium border border-white bg-emerald-600 text-white" rowSpan={2}>Port</th>
                  <th className="p-2 font-medium border border-white bg-emerald-600 text-white" colSpan={4}>TDK TL</th>
                  <th className="p-2 font-medium border border-white bg-emerald-600 text-white" colSpan={4}>TL</th>
                  <th className="p-2 font-medium border border-white bg-emerald-600 text-white" colSpan={4}>SHIPSIDE YES</th>
                  <th className="p-2 font-medium border border-white bg-emerald-600 text-white" colSpan={4}>SHIPSIDE NO</th>
                  <th className="p-2 font-medium border border-white bg-emerald-600 text-white" colSpan={4}>TURUN CY</th>
                </tr>
                <tr className='text-white'>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>20MT</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>40MT</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>20FL</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>40FL</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>20MT</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>40MT</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>20FL</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>40FL</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>20MT</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>40MT</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>20FL</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>40FL</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>20MT</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>40MT</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>20FL</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>40FL</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>20MT</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>40MT</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>20FL</th>
                    <th className='p-2 font-medium border border-white bg-emerald-600 text-white'>40FL</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 border-b last:border-b-0">
                    <td className="p-2 border text-center align-middle">
                      <button
                        onClick={() => saveRow(r)}
                        className="text-emerald-700 hover:underline"
                        disabled={savingId === r.id}
                        type="button"
                      >
                        {savingId === r.id ? 'Saving…' : 'Save'}
                      </button>
                    </td>
                    <td className="p-2 border align-middle">{portNameById.get(r.port_id) || `Port #${r.port_id}`}</td>
                    {costFields.map((f) => (
                      <td key={f} className="p-1 border align-middle">
                        <input
                          type="number"
                          step="0.01"
                          value={Number(r[f] || 0)}
                          onChange={(e) => onChangeField(r.id, f, e.target.value)}
                          className="w-24 rounded border border-slate-300 px-2 py-1 text-xs"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                {rates.length === 0 && (
                  <tr>
                    <td colSpan={2 + costFields.length} className="p-3 text-center text-slate-500">Belum ada data cost rate.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CostMapping;

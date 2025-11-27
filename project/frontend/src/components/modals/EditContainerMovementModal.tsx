import React, { useState } from 'react';
import Modal from '../modals';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';
import { PredictionService, type SizeKey } from '../../services/PredictionService';

const NumberInput = ({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    <input
      type="number"
      min={0}
      // Jika value adalah 0, tampilkan string kosong. Jika tidak, tampilkan value.
      value={value === 0 ? '' : value}
      // Jika pengguna menghapus input, set nilainya kembali ke 0.
      onChange={(e) => onChange(e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      placeholder="0" // Placeholder akan muncul saat input kosong
    />
  </div>
);

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
}

interface EditContainerMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: ContainerMovement | null;
  onUpdated: () => Promise<void> | void;
}

type TabKey = 'bongkaran' | 'pengajuan' | 'acc_pengajuan' | 'realisasi' | 'obstacles';

const EditContainerMovementModal: React.FC<EditContainerMovementModalProps> = ({ isOpen, onClose, row, onUpdated }) => {
  const formatIDR = (val: number | null | undefined) => {
    if (val == null || !isFinite(Number(val))) return '-';
    try {
      return 'Rp' + new Intl.NumberFormat('id-ID').format(Math.round(Number(val)));
    } catch {
      return 'Rp' + String(Math.round(Number(val)));
    }
  };
  const [activeTab, setActiveTab] = useState<TabKey>('bongkaran');
  const [obstaclesValue, setObstaclesValue] = useState('');
  const [ports, setPorts] = useState<{ id: number; name: string }[]>([]);
  const [selectedPortId, setSelectedPortId] = useState<string>('');
  // Bongkaran
  const [bongkaranEmpty20, setBongkaranEmpty20] = useState<number>(0);
  const [bongkaranEmpty40, setBongkaranEmpty40] = useState<number>(0);
  const [bongkaranFull20, setBongkaranFull20] = useState<number>(0);
  const [bongkaranFull40, setBongkaranFull40] = useState<number>(0);
  // Pengajuan
  const [pengajuanEmpty20, setPengajuanEmpty20] = useState<number>(0);
  const [pengajuanEmpty40, setPengajuanEmpty40] = useState<number>(0);
  const [pengajuanFull20, setPengajuanFull20] = useState<number>(0);
  const [pengajuanFull40, setPengajuanFull40] = useState<number>(0);
  // ACC Pengajuan
  const [accEmpty20, setAccEmpty20] = useState<number>(0);
  const [accEmpty40, setAccEmpty40] = useState<number>(0);
  const [accFull20, setAccFull20] = useState<number>(0);
  const [accFull40, setAccFull40] = useState<number>(0);
  // Realisasi
  const [realMxd20, setRealMxd20] = useState<number>(0);
  const [realMxd40, setRealMxd40] = useState<number>(0);
  const [realFxd20, setRealFxd20] = useState<number>(0);
  const [realFxd40, setRealFxd40] = useState<number>(0);
  // Shipside
  const [yesMxd20, setYesMxd20] = useState<number>(0);
  const [yesMxd40, setYesMxd40] = useState<number>(0);
  const [yesFxd20, setYesFxd20] = useState<number>(0);
  const [yesFxd40, setYesFxd40] = useState<number>(0);
  const [noMxd20, setNoMxd20] = useState<number>(0);
  const [noMxd40, setNoMxd40] = useState<number>(0);
  const [noFxd20, setNoFxd20] = useState<number>(0);
  const [noFxd40, setNoFxd40] = useState<number>(0);

  const [saving, setSaving] = useState(false);
  const [predLoading, setPredLoading] = useState(false);
  const [predictionsByPort, setPredictionsByPort] = useState<Record<number, { pengajuan: Record<SizeKey, number | null>; acc: Record<SizeKey, number | null>; cost1?: number; cost2?: number; hasRate?: boolean }>>({});

  const isBongkaranComplete = !!row && (row.bongkaran_empty_20dc > 0 || row.bongkaran_empty_40hc > 0 || row.bongkaran_full_20dc > 0 || row.bongkaran_full_40hc > 0);
  const isPengajuanComplete = !!row && (row.pengajuan_empty_20dc > 0 || row.pengajuan_empty_40hc > 0 || row.pengajuan_full_20dc > 0 || row.pengajuan_full_40hc > 0);
  const isAccPengajuanComplete = !!row && row.teus_pengajuan > 0;
  const isRealisasiComplete = !!row && (row.realisasi_mxd_20dc > 0 || row.realisasi_mxd_40hc > 0 || row.realisasi_fxd_20dc > 0 || row.realisasi_fxd_40hc > 0);
  const isShipsideComplete = !!row && row.teus_realisasi > 0;

  const tabs: { key: TabKey; label: string; disabled: boolean }[] = [
    { key: 'bongkaran', label: 'Bongkaran', disabled: false },
    { key: 'pengajuan', label: 'Pengajuan', disabled: !isBongkaranComplete },
    { key: 'acc_pengajuan', label: 'Acc Pengajuan', disabled: !isPengajuanComplete },
    { key: 'realisasi', label: 'Realisasi All Depo dan Shipside', disabled: !isAccPengajuanComplete },
    { key: 'obstacles', label: 'Obstacles', disabled: !isShipsideComplete },
  ];

  React.useEffect(() => {
    if (row) {
      setObstaclesValue(row.obstacles || '');
      // Prefill bongkaran
      setBongkaranEmpty20(row.bongkaran_empty_20dc || 0);
      setBongkaranEmpty40(row.bongkaran_empty_40hc || 0);
      setBongkaranFull20(row.bongkaran_full_20dc || 0);
      setBongkaranFull40(row.bongkaran_full_40hc || 0);
      // Prefill pengajuan
      setPengajuanEmpty20(row.pengajuan_empty_20dc || 0);
      setPengajuanEmpty40(row.pengajuan_empty_40hc || 0);
      setPengajuanFull20(row.pengajuan_full_20dc || 0);
      setPengajuanFull40(row.pengajuan_full_40hc || 0);
      // Prefill acc pengajuan
      setAccEmpty20(row.acc_pengajuan_empty_20dc || 0);
      setAccEmpty40(row.acc_pengajuan_empty_40hc || 0);
      setAccFull20(row.acc_pengajuan_full_20dc || 0);
      setAccFull40(row.acc_pengajuan_full_40hc || 0);
      // Prefill realisasi
      setRealMxd20(row.realisasi_mxd_20dc || 0);
      setRealMxd40(row.realisasi_mxd_40hc || 0);
      setRealFxd20(row.realisasi_fxd_20dc || 0);
      setRealFxd40(row.realisasi_fxd_40hc || 0);
      // Prefill shipside
      setYesMxd20(row.shipside_yes_mxd_20dc || 0);
      setYesMxd40(row.shipside_yes_mxd_40hc || 0);
      setYesFxd20(row.shipside_yes_fxd_20dc || 0);
      setYesFxd40(row.shipside_yes_fxd_40hc || 0);
      setNoMxd20(row.shipside_no_mxd_20dc || 0);
      setNoMxd40(row.shipside_no_mxd_40hc || 0);
      setNoFxd20(row.shipside_no_fxd_20dc || 0);
      setNoFxd40(row.shipside_no_fxd_40hc || 0);

      if (!isBongkaranComplete) setActiveTab('bongkaran');
      else if (!isPengajuanComplete) setActiveTab('pengajuan');
      else if (!isAccPengajuanComplete) setActiveTab('acc_pengajuan');
      else if (!isRealisasiComplete) setActiveTab('realisasi');
      else setActiveTab('obstacles');

      if (!row.port_name) {
        void (async () => {
          try {
            const res = await apiClient.get<{ id: number; name: string }[]>('/ports');
            setPorts(res.data);
          } catch (e) {
            console.error('Gagal memuat ports', e);
          }
        })();
      }
      setSelectedPortId('');
    }
  }, [row, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const shouldPredict = !!row && activeTab === 'pengajuan' && !row.port_name && ports.length > 0;
    if (!shouldPredict) return;
    let cancelled = false;
    void (async () => {
      try {
        setPredLoading(true);
        const next: Record<number, { pengajuan: Record<SizeKey, number | null>; acc: Record<SizeKey, number | null> }> = {};
        for (const p of ports) {
          const ensureNum = (v: any) => (v == null || Number.isNaN(v) ? 0 : Number(v));
          const baseFeatures: Record<string, any> = {
            'BERTH LOCATION': p.name,
            'VESSEL ID (DMY)': row!.vessel_name,
            'Voyage Yr': row!.voyage_year,
            'Voyage No.': row!.voyage_number,
          };
          const bongkaranFeatures: Record<string, any> = {
            'TOTAL BONGKARAN_EMPTY_20 DC': ensureNum(row!.bongkaran_empty_20dc),
            'TOTAL BONGKARAN_EMPTY_40 HC': ensureNum(row!.bongkaran_empty_40hc),
            'TOTAL BONGKARAN_FULL_20 DC': ensureNum(row!.bongkaran_full_20dc),
            'TOTAL BONGKARAN_FULL_40 HC': ensureNum(row!.bongkaran_full_40hc),
          };
          const sizes: SizeKey[] = ['empty_20', 'empty_40', 'full_20', 'full_40'];
          const pengajuan: Record<SizeKey, number | null> = { empty_20: null, empty_40: null, full_20: null, full_40: null };
          const acc: Record<SizeKey, number | null> = { empty_20: null, empty_40: null, full_20: null, full_40: null };
          // Predict Pengajuan based on Bongkaran -> Pengajuan models
          for (const s of sizes) {
            pengajuan[s] = await PredictionService.predictPengajuan(s, { ...baseFeatures, ...bongkaranFeatures });
          }
          // Predict ACC based on Pengajuan -> ACC models
          for (const s of sizes) {
            const pengajuanFeatures: Record<string, any> = {
              'PENGAJUAN KE PLANNER_EMPTY_20 DC': ensureNum(pengajuan.empty_20),
              'PENGAJUAN KE PLANNER_EMPTY_40 HC': ensureNum(pengajuan.empty_40),
              'PENGAJUAN KE PLANNER_FULL_20 DC': ensureNum(pengajuan.full_20),
              'PENGAJUAN KE PLANNER_FULL_40 HC': ensureNum(pengajuan.full_40),
            };
            const accPayload = { ...baseFeatures, ...bongkaranFeatures, ...pengajuanFeatures };
            acc[s] = await PredictionService.predictAcc(s, accPayload);
          }
          next[p.id] = { pengajuan, acc };
        }
        if (!cancelled) setPredictionsByPort(next);
      } catch (e) {
        console.warn('Gagal memuat prediksi', e);
      } finally {
        if (!cancelled) setPredLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, row, ports]);

  // Fetch monetary cost estimations after prediction values are ready
  React.useEffect(() => {
    if (!row || activeTab !== 'pengajuan' || row.port_name || Object.keys(predictionsByPort).length === 0) return;
    let cancelled = false;
    const bongkaran = {
      empty_20: row.bongkaran_empty_20dc || 0,
      empty_40: row.bongkaran_empty_40hc || 0,
      full_20: row.bongkaran_full_20dc || 0,
      full_40: row.bongkaran_full_40hc || 0,
    };
    const portsPayload = Object.entries(predictionsByPort).map(([pid, data]) => ({
      port_id: Number(pid),
      pengajuan: {
        empty_20: data.pengajuan.empty_20 || 0,
        empty_40: data.pengajuan.empty_40 || 0,
        full_20: data.pengajuan.full_20 || 0,
        full_40: data.pengajuan.full_40 || 0,
      },
      acc: {
        empty_20: data.acc.empty_20 || 0,
        empty_40: data.acc.empty_40 || 0,
        full_20: data.acc.full_20 || 0,
        full_40: data.acc.full_40 || 0,
      },
    }));
    void (async () => {
      try {
        const res = await apiClient.post('/predict/cost_estimation_preview', {
          voyage_id: row.voyage_id,
          bongkaran,
          ports: portsPayload,
        });
        if (cancelled) return;
        const costs: Array<any> = res.data?.costs || [];
        setPredictionsByPort((prev) => {
          const copy = { ...prev };
          for (const c of costs) {
            const entry = copy[c.port_id];
            if (entry) {
              entry.cost1 = c.estimation_cost1;
              entry.cost2 = c.estimation_cost2;
              entry.hasRate = c.has_rate;
            }
          }
          return copy;
        });
      } catch (e) {
        console.warn('Gagal memuat estimasi biaya', e);
      }
    })();
    return () => { cancelled = true; };
  }, [predictionsByPort, activeTab, row]);

  const saveBongkaran = async () => {
    if (!row) return;
    setSaving(true);
    try {
      await apiClient.post('/container_movements/bongkaran', {
        id: row.id,
        voyage_id: row.voyage_id,
        bongkaran_empty_20dc: Number(bongkaranEmpty20 || 0),
        bongkaran_empty_40hc: Number(bongkaranEmpty40 || 0),
        bongkaran_full_20dc: Number(bongkaranFull20 || 0),
        bongkaran_full_40hc: Number(bongkaranFull40 || 0),
      });
      toast.success('Berhasil memperbarui Bongkaran');
      await onUpdated();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.msg || 'Gagal memperbarui bongkaran');
    } finally {
      setSaving(false);
    }
  };

  const savePengajuan = async () => {
    if (!row) return;
    setSaving(true);
    try {
      if (!row.port_name && selectedPortId) {
        try {
          await apiClient.put(`/voyages/${row.voyage_id}/port`, { port_id: Number(selectedPortId) });
          toast.success('Berth location diset untuk voyage ini');
          await onUpdated();
        } catch (err: any) {
          const data = err?.response?.data;
          toast.error(data?.msg || 'Gagal menyetel berth location');
          throw err;
        }
      }
      await apiClient.post('/container_movements/pengajuan', {
        id: row.id,
        pengajuan_empty_20dc: Number(pengajuanEmpty20 || 0),
        pengajuan_empty_40hc: Number(pengajuanEmpty40 || 0),
        pengajuan_full_20dc: Number(pengajuanFull20 || 0),
        pengajuan_full_40hc: Number(pengajuanFull40 || 0),
      });
      toast.success('Berhasil memperbarui Pengajuan');
      await onUpdated();
      onClose();
    } catch (e: any) {
      const data = e?.response?.data;
      toast.error(data?.msg || 'Gagal memperbarui pengajuan');
    } finally {
      setSaving(false);
    }
  };

  const saveAccPengajuan = async () => {
    if (!row) return;
    setSaving(true);
    try {
      await apiClient.post('/container_movements/acc_pengajuan', {
        id: row.id,
        acc_pengajuan_empty_20dc: Number(accEmpty20 || 0),
        acc_pengajuan_empty_40hc: Number(accEmpty40 || 0),
        acc_pengajuan_full_20dc: Number(accFull20 || 0),
        acc_pengajuan_full_40hc: Number(accFull40 || 0),
      });
      toast.success('Berhasil memperbarui ACC Pengajuan');
      await onUpdated();
      onClose();
    } catch (e: any) {
      const data = e?.response?.data;
      toast.error(data?.msg || 'Gagal memperbarui ACC Pengajuan');
    } finally {
      setSaving(false);
    }
  };

  const saveRealisasiAndShipside = async () => {
    if (!row) return;
    setSaving(true);
    try {
      await apiClient.post('/container_movements/realisasi_shipside', {
        id: row.id,
        realisasi_mxd_20dc: Number(realMxd20 || 0),
        realisasi_mxd_40hc: Number(realMxd40 || 0),
        realisasi_fxd_20dc: Number(realFxd20 || 0),
        realisasi_fxd_40hc: Number(realFxd40 || 0),
        shipside_yes_mxd_20dc: Number(yesMxd20 || 0),
        shipside_yes_mxd_40hc: Number(yesMxd40 || 0),
        shipside_yes_fxd_20dc: Number(yesFxd20 || 0),
        shipside_yes_fxd_40hc: Number(yesFxd40 || 0),
        shipside_no_mxd_20dc: Number(noMxd20 || 0),
        shipside_no_mxd_40hc: Number(noMxd40 || 0),
        shipside_no_fxd_20dc: Number(noFxd20 || 0),
        shipside_no_fxd_40hc: Number(noFxd40 || 0),
        obstacles: obstaclesValue,
      });

      toast.success('Berhasil memperbarui Realisasi dan Shipside');
      await onUpdated();
      onClose();
    } catch (e: any) {
      const data = e?.response?.data;
      toast.error(data?.msg || 'Gagal memperbarui Realisasi/Shipside');
    } finally {
      setSaving(false);
    }
  };

  const saveObstacles = async () => {
    if (!row) return;
    setSaving(true);
    try {
      await apiClient.post('/container_movements/obstacles', {
        id: row.id,
        obstacles: obstaclesValue,
      });
      toast.success('Berhasil memperbarui Obstacles');
      await onUpdated();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.msg || 'Gagal memperbarui data');
    } finally {
      setSaving(false);
    }
  };

  // Tekan Enter = klik Simpan (kecuali fokus di textarea)
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key !== 'Enter' || saving) return;
    const target = e.target as HTMLElement;
    const tag = target?.tagName?.toLowerCase();
    if (tag === 'textarea') return; // biarkan Enter buat baris baru di textarea

    e.preventDefault();
    switch (activeTab) {
      case 'bongkaran':
        void saveBongkaran();
        break;
      case 'pengajuan':
        void savePengajuan();
        break;
      case 'acc_pengajuan':
        void saveAccPengajuan();
        break;
      case 'realisasi':
        void saveRealisasiAndShipside();
        break;
      case 'obstacles':
        void saveObstacles();
        break;
      default:
        break;
    }
  };

  const renderTabContent = () => {
    if (!row) return <p className="text-sm text-slate-500">Data tidak tersedia.</p>;
    switch (activeTab) {
      case 'bongkaran':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberInput label="Bongkaran Empty 20DC" value={bongkaranEmpty20} onChange={setBongkaranEmpty20} />
              <NumberInput label="Bongkaran Empty 40HC" value={bongkaranEmpty40} onChange={setBongkaranEmpty40} />
              <NumberInput label="Bongkaran Full 20DC" value={bongkaranFull20} onChange={setBongkaranFull20} />
              <NumberInput label="Bongkaran Full 40HC" value={bongkaranFull40} onChange={setBongkaranFull40} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} disabled={saving} className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 text-sm disabled:opacity-50">Batal</button>
              <button onClick={saveBongkaran} disabled={saving} className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        );
      case 'pengajuan':
        return (
          <div className="space-y-3">
            {activeTab === 'pengajuan' && !row.port_name && (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-amber-800">Prediksi Pengajuan & ACC per Berth</h4>
                  {predLoading && <span className="text-xs text-amber-700">Menghitung prediksi…</span>}
                </div>
                <div className="overflow-auto">
                  <div className="min-w-[1200px]">
                    <div className="grid grid-cols-11 gap-2 text-[11px] font-semibold text-amber-900 border-b border-amber-200 pb-1 items-end">
                      <div>Berth</div>
                      <div>Pengajuan E20</div>
                      <div>Pengajuan E40</div>
                      <div>Pengajuan F20</div>
                      <div>Pengajuan F40</div>
                      <div>ACC E20</div>
                      <div>ACC E40</div>
                      <div>ACC F20</div>
                      <div>ACC F40</div>
                      <div>Estimasi Cost 1 (Diajukan + Tidak Diajukan)</div>
                      <div>Estimasi Cost 2 (ACC Pengajuan + Tidak TL)</div>
                    </div>
                    <div className="divide-y divide-amber-200">
                      {ports.map((p) => {
                        const pr = predictionsByPort[p.id];
                        // Aggregate totals
                        const pengTotal =
                          (pr?.pengajuan.empty_20 ?? 0)
                          + (pr?.pengajuan.empty_40 ?? 0)
                          + (pr?.pengajuan.full_20 ?? 0)
                          + (pr?.pengajuan.full_40 ?? 0);
                        const accTotal =
                          (pr?.acc.empty_20 ?? 0)
                          + (pr?.acc.empty_40 ?? 0)
                          + (pr?.acc.full_20 ?? 0)
                          + (pr?.acc.full_40 ?? 0);
                        const bongkarTotal =
                          (row.bongkaran_empty_20dc || 0)
                          + (row.bongkaran_empty_40hc || 0)
                          + (row.bongkaran_full_20dc || 0)
                          + (row.bongkaran_full_40hc || 0);
                        const notSubmitted = Math.max(0, bongkarTotal - pengTotal);
                        const notTL = Math.max(0, bongkarTotal - accTotal);
                        // Note: Without rates, we display counts approximation
                        const fallbackEst1 = Math.round(pengTotal + notSubmitted);
                        const fallbackEst2 = Math.round(accTotal + notTL);
                        const est1Raw = pr?.cost1 != null ? pr.cost1 : fallbackEst1;
                        const est2Raw = pr?.cost2 != null ? pr.cost2 : fallbackEst2;
                        return (
                          <div key={p.id} className="grid grid-cols-11 gap-2 py-1 text-[11px] text-amber-900">
                            <div className="font-medium truncate" title={p.name}>{p.name}</div>
                            <div>{pr?.pengajuan.empty_20 != null ? Math.round(pr.pengajuan.empty_20) : '-'}</div>
                            <div>{pr?.pengajuan.empty_40 != null ? Math.round(pr.pengajuan.empty_40) : '-'}</div>
                            <div>{pr?.pengajuan.full_20 != null ? Math.round(pr.pengajuan.full_20) : '-'}</div>
                            <div>{pr?.pengajuan.full_40 != null ? Math.round(pr.pengajuan.full_40) : '-'}</div>
                            <div>{pr?.acc.empty_20 != null ? Math.round(pr.acc.empty_20) : '-'}</div>
                            <div>{pr?.acc.empty_40 != null ? Math.round(pr.acc.empty_40) : '-'}</div>
                            <div>{pr?.acc.full_20 != null ? Math.round(pr.acc.full_20) : '-'}</div>
                            <div>{pr?.acc.full_40 != null ? Math.round(pr.acc.full_40) : '-'}</div>
                            <div title={pr?.hasRate ? 'Estimasi Cost 1 (Diajukan + Tidak Diajukan)' : 'Estimasi Cost 1 (fallback count)'}>
                              {pr?.hasRate ? formatIDR(est1Raw) : (isFinite(est1Raw) ? est1Raw : '-')}
                            </div>
                            <div title={pr?.hasRate ? 'Estimasi Cost 2 (ACC Pengajuan + Tidak TL)' : 'Estimasi Cost 2 (fallback count)'}>
                              {pr?.hasRate ? formatIDR(est2Raw) : (isFinite(est2Raw) ? est2Raw : '-')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberInput label="Pengajuan Empty 20DC" value={pengajuanEmpty20} onChange={setPengajuanEmpty20} />
              <NumberInput label="Pengajuan Empty 40HC" value={pengajuanEmpty40} onChange={setPengajuanEmpty40} />
              <NumberInput label="Pengajuan Full 20DC" value={pengajuanFull20} onChange={setPengajuanFull20} />
              <NumberInput label="Pengajuan Full 40HC" value={pengajuanFull40} onChange={setPengajuanFull40} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} disabled={saving} className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 text-sm disabled:opacity-50">Batal</button>
              <button onClick={savePengajuan} disabled={saving} className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        );
      case 'acc_pengajuan':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberInput label="ACC Pengajuan Empty 20DC" value={accEmpty20} onChange={setAccEmpty20} />
              <NumberInput label="ACC Pengajuan Empty 40HC" value={accEmpty40} onChange={setAccEmpty40} />
              <NumberInput label="ACC Pengajuan Full 20DC" value={accFull20} onChange={setAccFull20} />
              <NumberInput label="ACC Pengajuan Full 40HC" value={accFull40} onChange={setAccFull40} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} disabled={saving} className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 text-sm disabled:opacity-50">Batal</button>
              <button onClick={saveAccPengajuan} disabled={saving} className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        );
      case 'realisasi':
        return (
          <div className="space-y-5">
            {/* Realisasi All Depo */}
            <div>
              <h4 className="text-sm font-medium text-slate-800 mb-3">Realisasi All Depo</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <NumberInput label="Realisasi MXD 20DC" value={realMxd20} onChange={setRealMxd20} />
                <NumberInput label="Realisasi MXD 40HC" value={realMxd40} onChange={setRealMxd40} />
                <NumberInput label="Realisasi FXD 20DC" value={realFxd20} onChange={setRealFxd20} />
                <NumberInput label="Realisasi FXD 40HC" value={realFxd40} onChange={setRealFxd40} />
              </div>
            </div>

            {/* Shipside */}
            <div>
              <h4 className="text-sm font-medium text-slate-800 mb-3">Shipside</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <NumberInput label="Shipside YES MXD 20DC" value={yesMxd20} onChange={setYesMxd20} />
                <NumberInput label="Shipside YES MXD 40HC" value={yesMxd40} onChange={setYesMxd40} />
                <NumberInput label="Shipside YES FXD 20DC" value={yesFxd20} onChange={setYesFxd20} />
                <NumberInput label="Shipside YES FXD 40HC" value={yesFxd40} onChange={setYesFxd40} />
                <NumberInput label="Shipside NO MXD 20DC" value={noMxd20} onChange={setNoMxd20} />
                <NumberInput label="Shipside NO MXD 40HC" value={noMxd40} onChange={setNoMxd40} />
                <NumberInput label="Shipside NO FXD 20DC" value={noFxd20} onChange={setNoFxd20} />
                <NumberInput label="Shipside NO FXD 40HC" value={noFxd40} onChange={setNoFxd40} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} disabled={saving} className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 text-sm disabled:opacity-50">Batal</button>
              <button onClick={saveRealisasiAndShipside} disabled={saving} className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        );
      case 'obstacles':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Obstacles</label>
            <textarea
              value={obstaclesValue}
              onChange={(e) => setObstaclesValue(e.target.value)}
              rows={5}
              className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Isi kendala / catatan di sini"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 text-sm disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={saveObstacles}
                disabled={saving}
                className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-sm text-slate-500 py-4">
            Konten untuk tab <span className="font-semibold">{tabs.find(t => t.key === activeTab)?.label}</span> belum diimplementasikan.
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={'Edit Voyage'}>
      {row ? (
        <div className="space-y-5" onKeyDown={handleKeyDown}>
          {/* Voyage Basic Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm bg-slate-50 p-3 rounded-md border border-slate-200">
            <div>
              <p className="text-slate-500">Vessel</p>
              <p className="font-semibold">{row.vessel_name}</p>
            </div>
            <div>
              <p className="text-slate-500">Voyage No</p>
              <p className="font-semibold">{row.voyage_number}</p>
            </div>
            <div>
              <p className="text-slate-500">Year</p>
              <p className="font-semibold">{row.voyage_year}</p>
            </div>
            <div>
              <p className="text-slate-500">Berth Location</p>
              <p className="font-semibold">{row.port_name}</p>
              {activeTab === 'pengajuan' && !row.port_name && (
                <select
                  value={selectedPortId}
                  onChange={(e) => setSelectedPortId(e.target.value)}
                  className="mt-1 rounded-md border border-slate-300 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Pilih Berth Location</option>
                  {ports.map((p) => (
                    <option key={p.id} value={String(p.id)}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <p className="text-slate-500">Date Berth</p>
              <p className="font-semibold">{row.voyage_date_berth?.slice(0,10)}</p>
            </div>
          </div>

          {/* Tabs */}
          <div>
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => !tab.disabled && setActiveTab(tab.key)}
                  disabled={tab.disabled}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                    tab.disabled
                      ? 'opacity-60 cursor-not-allowed bg-slate-100 text-slate-400'
                      : 'hover:bg-slate-50'
                  } ${
                    activeTab === tab.key
                      ? 'bg-emerald-600 hover:bg-emerald-800 text-white shadow'
                      : 'bg-white border border-slate-300 text-slate-600'
                  }`}
                >
                  {tab.disabled && <Lock size={12} />}
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="pt-4">
              {renderTabContent()}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Tidak ada data untuk diedit.</p>
      )}
    </Modal>
  );
};

export default EditContainerMovementModal;
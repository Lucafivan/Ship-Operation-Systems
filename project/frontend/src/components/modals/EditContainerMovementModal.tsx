import React, { useState } from 'react';
import Modal from '../modals';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<TabKey>('bongkaran');
  const [obstaclesValue, setObstaclesValue] = useState('');
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
    }
  }, [row, isOpen]);

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
      if (data?.violations && Array.isArray(data.violations) && data.violations.length > 0) {
        data.violations.forEach((v: any) => toast.error(v?.msg || data?.msg || 'ACC melebihi Pengajuan'));
      } else {
        toast.error(data?.msg || 'Gagal memperbarui ACC Pengajuan');
      }
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
      if (data?.violations && Array.isArray(data.violations) && data.violations.length > 0) {
        data.violations.forEach((v: any) => toast.error(v?.msg || data?.msg || 'Input melebihi batas'));
      } else {
        toast.error(data?.msg || 'Gagal memperbarui Realisasi/Shipside');
      }
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
                    activeTab === tab.key
                      ? 'bg-emerald-600 hover:bg-emerald-800 text-white shadow'
                      : 'bg-white border border-slate-300 text-slate-600'
                  } ${
                    tab.disabled
                      ? 'opacity-60 cursor-not-allowed bg-slate-100 text-slate-400'
                      : 'hover:bg-slate-50'
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

import apiClient from '../api/axios';

export type SizeKey = 'empty_20' | 'empty_40' | 'full_20' | 'full_40';

export const PredictionService = {
  async predictPengajuan(size: SizeKey, payload: Record<string, any>): Promise<number | null> {
    const path = {
      empty_20: '/predict/bongkaran_to_pengajuan/empty_20',
      empty_40: '/predict/bongkaran_to_pengajuan/empty_40',
      full_20: '/predict/bongkaran_to_pengajuan/full_20',
      full_40: '/predict/bongkaran_to_pengajuan/full_40',
    }[size];
    try {
      const res = await apiClient.post(path, payload);
      if (import.meta.env.DEV) {
        console.debug('[predictPengajuan]', path, payload, res.data);
      }
      const keys = Object.keys(res.data?.prediction ?? {});
      if (keys.length) return Number(res.data.prediction[keys[0]]);
      return null;
    } catch (e: any) {
      console.warn('predictPengajuan error', size, e?.response?.data || e?.message || e);
      return null;
    }
  },

  async predictAcc(size: SizeKey, payload: Record<string, any>): Promise<number | null> {
    const path = {
      empty_20: '/predict/pengajuan_to_acc/empty_20',
      empty_40: '/predict/pengajuan_to_acc/empty_40',
      full_20: '/predict/pengajuan_to_acc/full_20',
      full_40: '/predict/pengajuan_to_acc/full_40',
    }[size];
    try {
      const res = await apiClient.post(path, payload);
      if (import.meta.env.DEV) {
        console.debug('[predictAcc]', path, payload, res.data);
      }
      const keys = Object.keys(res.data?.prediction ?? {});
      if (keys.length) return Number(res.data.prediction[keys[0]]);
      return null;
    } catch (e: any) {
      console.warn('predictAcc error', size, e?.response?.data || e?.message || e);
      return null;
    }
  },

  async predictRealisasi(size: SizeKey, payload: Record<string, any>): Promise<Record<string, number> | null> {
    const path = {
      empty_20: '/predict/acc_to_realisasi/empty_20',
      empty_40: '/predict/acc_to_realisasi/empty_40',
      full_20: '/predict/acc_to_realisasi/full_20',
      full_40: '/predict/acc_to_realisasi/full_40',
    }[size];
    try {
      const res = await apiClient.post(path, payload);
      if (import.meta.env.DEV) {
        console.debug('[predictRealisasi]', path, payload, res.data);
      }
      return (res.data?.prediction ?? null) as Record<string, number> | null;
    } catch (e: any) {
      console.warn('predictRealisasi error', size, e?.response?.data || e?.message || e);
      return null;
    }
  },
};

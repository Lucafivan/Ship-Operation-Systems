export interface ContainerMovement {
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
  voyage_created_at: string;
}

export interface VoyageEstimation {
  estimation_cost1: number | null;
  estimation_cost2: number | null;
  final_cost: number | null;
  computed_at?: string | null;
}

export type DatePreset = 'all' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';

export type SortKey =
  | 'vessel_name'
  | 'voyage_number'
  | 'voyage_year'
  | 'port_name'
  | 'voyage_date_berth'
  | 'created_at'
  | 'updated_at'
  | 'voyage_created_at';

export interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

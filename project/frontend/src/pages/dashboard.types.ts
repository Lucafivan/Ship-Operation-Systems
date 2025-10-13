export interface PortSummary {
  port_id: number;
  port_name: string;
  total_pengajuan: number;
  acc_pengajuan: number;
  total_realisasi: number;
}

export interface PortPercentagesResponse {
  port_id: number;
  port_name: string;
  percentages: {
    pengajuan: number;
    acc: number;
    tl: number;
    realisasi: number;
    by_size?: {
      ['20dc']?: { pengajuan: number; acc: number; tl: number; realisasi: number };
      ['40hc']?: { pengajuan: number; acc: number; tl: number; realisasi: number };
    };
  };
  totals?: {
    bongkaran?: { overall: number };
    pengajuan?: { overall: number };
    acc?: { overall: number };
    tlss?: { overall: number };
  };
}

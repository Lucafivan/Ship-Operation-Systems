import React from 'react';

const CostHeader: React.FC = () => (
  <thead className="sticky top-0 z-10">
    <tr className="text-white">
      <th className="p-2 font-medium border border-white bg-emerald-600 text-white">Voyage</th>
      <th className="p-2 font-medium border border-white bg-emerald-600 text-white">Berth Location</th>
      <th className="p-2 font-medium border border-white bg-emerald-600 text-white">
        <div className="flex flex-col items-start">
          <span>Estimasi Cost 1</span>
          <span className="text-[10px] opacity-90">(Diajukan + Tidak Diajukan)</span>
        </div>
      </th>
      <th className="p-2 font-medium border border-white bg-emerald-600 text-white">
        <div className="flex flex-col items-start">
          <span>Estimasi Cost 2</span>
          <span className="text-[10px] opacity-90">(ACC Pengajuan + Tidak TL)</span>
        </div>
      </th>
      <th className="p-2 font-medium border border-white bg-emerald-600 text-white">
        <div className="flex flex-col items-start">
          <span>Final Cost</span>
          <span className="text-[10px] opacity-90">(Tidak TL + Realisasi + Shipside + Turun CY)</span>
        </div>
      </th>
    </tr>
  </thead>
);

export default CostHeader;

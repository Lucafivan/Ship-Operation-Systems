import React from 'react';
import type { PortSummary } from '../../pages/dashboard.types';

interface Props {
  items: PortSummary[];
  value: number | null;
  onChange: (id: number | null) => void;
}

const PortSelect: React.FC<Props> = ({ items, value, onChange }) => {
  const sorted = [...items].sort((a, b) => a.port_name.localeCompare(b.port_name, undefined, { sensitivity: 'base' }));
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm max-w-sm">
      <label htmlFor="port-select" className="block text-sm font-medium text-gray-700 mb-2">
        Filter Berdasarkan Port:
      </label>
      <select
        id="port-select"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
      >
        {sorted.map((item) => (
          <option key={item.port_id} value={item.port_id}>
            {item.port_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PortSelect;

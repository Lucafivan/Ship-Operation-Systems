import React from 'react';

interface TableHeader {
  key: string;
  label: string;
}

interface TableProps {
  headers: TableHeader[];
  data: Record<string, any>[];
}

const Table: React.FC<TableProps> = ({ headers, data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">Tidak ada data untuk ditampilkan.</p>;
  }

  return (
    <div className="overflow-x-auto relative">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-800 uppercase bg-gray-100">
          <tr>
            {headers.map((header) => (
              <th key={header.key} scope="col" className="py-3 px-6">
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="bg-white border-b hover:bg-gray-50">
              {headers.map((header) => (
                <td key={`${header.key}-${index}`} className="py-4 px-6">
                  {item[header.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
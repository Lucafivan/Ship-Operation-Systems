import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import DynamicForm from "../components/form/dynamicform";
import toast from "react-hot-toast";

interface ContainerMovementReference {
  id: number;
  voyage_id: number;
}

const AccPengajuanPage: React.FC = () => {
  const navigate = useNavigate();
  const [movements, setMovements] = useState<ContainerMovementReference[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const response = await apiClient.get<ContainerMovementReference[]>("/container_movements/");
        setMovements(response.data);
      } catch (error) {
        console.error("Gagal mengambil data container movements:", error);
        toast.error("Gagal memuat data referensi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovements();
  }, []);

  const fields = [
    { name: "id", label: "ID Container Movement", type: "number", placeholder: "Pilih ID dari daftar di atas" },
    { name: "acc_pengajuan_empty_20dc", label: "ACC Pengajuan Empty 20DC", type: "number", placeholder: "Jumlah" },
    { name: "acc_pengajuan_empty_40hc", label: "ACC Pengajuan Empty 40HC", type: "number", placeholder: "Jumlah" },
    { name: "acc_pengajuan_full_20dc", label: "ACC Pengajuan Full 20DC", type: "number", placeholder: "Jumlah" },
    { name: "acc_pengajuan_full_40hc", label: "ACC Pengajuan Full 40HC", type: "number", placeholder: "Jumlah" },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    if (!data.id) {
        toast.error("ID Container Movement wajib diisi!");
        return;
    }

    const processedData = {
        id: Number(data.id),
        acc_pengajuan_empty_20dc: Number(data.acc_pengajuan_empty_20dc || 0),
        acc_pengajuan_empty_40hc: Number(data.acc_pengajuan_empty_40hc || 0),
        acc_pengajuan_full_20dc: Number(data.acc_pengajuan_full_20dc || 0),
        acc_pengajuan_full_40hc: Number(data.acc_pengajuan_full_40hc || 0),
    };

    try {
      const res = await apiClient.post("/container_movements/acc_pengajuan", processedData);
      toast.success("Data ACC Pengajuan berhasil diperbarui!");
      navigate("/realisasi"); // Arahkan kembali ke halaman daftar
    } catch (err: any) {
      console.error("Error submit:", err.response || err);
      toast.error(err.response?.data?.msg || "Gagal memperbarui data.");
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Memuat data...</div>;
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        <div className="bg-slate-100 p-4 rounded-lg mb-6 border border-slate-200">
          <h3 className="font-semibold text-gray-700 mb-2">Data Container Movement yang Ada:</h3>
          {movements.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-600 max-h-40 overflow-y-auto">
              {movements.map((cm) => (
                <li key={cm.id}>
                  <strong>ID: {cm.id}</strong> (Voyage ID: {cm.voyage_id})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              Tidak ada data container movement untuk diupdate.
            </p>
          )}
        </div>

        <DynamicForm
          title="Form Update ACC Pengajuan"
          fields={fields}
          onSubmit={handleSubmit}
          buttonText="Update ACC Pengajuan"
        />

      </div>
    </div>
  );
};

export default AccPengajuanPage;
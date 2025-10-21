import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import DynamicForm from "../components/form/dynamicform";
import toast from "react-hot-toast";

interface ContainerMovementReference {
  id: number;
  voyage_id: number;
}

const PengajuanPage: React.FC = () => {
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
    { name: "pengajuan_empty_20dc", label: "Pengajuan Empty 20DC", type: "number", placeholder: "Jumlah" },
    { name: "pengajuan_empty_40hc", label: "Pengajuan Empty 40HC", type: "number", placeholder: "Jumlah" },
    { name: "pengajuan_full_20dc", label: "Pengajuan Full 20DC", type: "number", placeholder: "Jumlah" },
    { name: "pengajuan_full_40hc", label: "Pengajuan Full 40HC", type: "number", placeholder: "Jumlah" },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    if (!data.id) {
        toast.error("ID Container Movement wajib diisi!");
        return;
    }

    const processedData = {
        id: Number(data.id),
        pengajuan_empty_20dc: Number(data.pengajuan_empty_20dc || 0),
        pengajuan_empty_40hc: Number(data.pengajuan_empty_40hc || 0),
        pengajuan_full_20dc: Number(data.pengajuan_full_20dc || 0),
        pengajuan_full_40hc: Number(data.pengajuan_full_40hc || 0),
    };

    try {
      await apiClient.post("/container_movements/pengajuan", processedData);
      toast.success("Data pengajuan berhasil diperbarui!");
      navigate("/acc_pengajuan");
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
        
        {/* Bantuan untuk user */}
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
          title="Form Update Pengajuan"
          fields={fields}
          onSubmit={handleSubmit}
          buttonText="Update Pengajuan"
        />

      </div>
    </div>
  );
};

export default PengajuanPage;
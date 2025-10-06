import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import DynamicForm from "../components/form/dynamicform";
import toast from "react-hot-toast";

interface ContainerMovementReference {
  id: number;
  voyage_id: number;
}

const RealisasiPage: React.FC = () => {
  const navigate = useNavigate();
  const [movements, setMovements] = useState<ContainerMovementReference[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const response = await apiClient.get<ContainerMovementReference[]>("/container_movements/");
        setMovements(response.data);
      } catch (error) {
        toast.error("Gagal memuat data referensi.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovements();
  }, []);

  const fields = [
    { name: "id", label: "ID Container Movement", type: "number", placeholder: "Pilih ID dari daftar di atas" },
    { name: "realisasi_mxd_20dc", label: "Realisasi MXD 20DC", type: "number", placeholder: "Jumlah" },
    { name: "realisasi_mxd_40hc", label: "Realisasi MXD 40HC", type: "number", placeholder: "Jumlah" },
    { name: "realisasi_fxd_20dc", label: "Realisasi FXD 20DC", type: "number", placeholder: "Jumlah" },
    { name: "realisasi_fxd_40hc", label: "Realisasi FXD 40HC", type: "number", placeholder: "Jumlah" },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    if (!data.id) {
      toast.error("ID Container Movement wajib diisi!");
      return;
    }

    const processedData = {
      id: Number(data.id),
      realisasi_mxd_20dc: Number(data.realisasi_mxd_20dc || 0),
      realisasi_mxd_40hc: Number(data.realisasi_mxd_40hc || 0),
      realisasi_fxd_20dc: Number(data.realisasi_fxd_20dc || 0),
      realisasi_fxd_40hc: Number(data.realisasi_fxd_40hc || 0),
    };

    try {
      await apiClient.post("/container_movements/realisasi", processedData);
      toast.success("Data realisasi berhasil diperbarui!");
      navigate("/shipside");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Gagal memperbarui data.");
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Memuat data...</div>;
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-100 p-4 rounded-lg mb-6 border">
          <h3 className="font-semibold mb-2">Data Container Movement yang Ada:</h3>
          <ul className="list-disc list-inside text-sm max-h-40 overflow-y-auto">
            {movements.map((cm) => (
              <li key={cm.id}>
                <strong>ID: {cm.id}</strong> (Voyage ID: {cm.voyage_id})
              </li>
            ))}
          </ul>
        </div>

        <DynamicForm
          title="Form Update Realisasi"
          fields={fields}
          onSubmit={handleSubmit}
          buttonText="Update Realisasi"
        />
      </div>
    </div>
  );
};

export default RealisasiPage;
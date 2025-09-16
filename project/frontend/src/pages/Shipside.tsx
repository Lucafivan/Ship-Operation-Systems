// src/pages/ShipsidePage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import DynamicForm from "../components/dynamicform";
import toast from "react-hot-toast";

interface ContainerMovementReference {
  id: number;
  voyage_id: number;
}

const ShipsidePage: React.FC = () => {
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
    { name: "shipside_yes_mxd_20dc", label: "Shipside YES MXD 20DC", type: "number", placeholder: "Jumlah" },
    { name: "shipside_yes_mxd_40hc", label: "Shipside YES MXD 40HC", type: "number", placeholder: "Jumlah" },
    { name: "shipside_yes_fxd_20dc", label: "Shipside YES FXD 20DC", type: "number", placeholder: "Jumlah" },
    { name: "shipside_yes_fxd_40hc", label: "Shipside YES FXD 40HC", type: "number", placeholder: "Jumlah" },
    { name: "shipside_no_mxd_20dc", label: "Shipside NO MXD 20DC", type: "number", placeholder: "Jumlah" },
    { name: "shipside_no_mxd_40hc", label: "Shipside NO MXD 40HC", type: "number", placeholder: "Jumlah" },
    { name: "shipside_no_fxd_20dc", label: "Shipside NO FXD 20DC", type: "number", placeholder: "Jumlah" },
    { name: "shipside_no_fxd_40hc", label: "Shipside NO FXD 40HC", type: "number", placeholder: "Jumlah" },
    { name: "obstacles", label: "Kendala (Obstacles)", type: "text", placeholder: "Jelaskan kendala jika ada" },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    if (!data.id) {
      toast.error("ID Container Movement wajib diisi!");
      return;
    }

    const processedData = {
      id: Number(data.id),
      shipside_yes_mxd_20dc: Number(data.shipside_yes_mxd_20dc || 0),
      shipside_yes_mxd_40hc: Number(data.shipside_yes_mxd_40hc || 0),
      shipside_yes_fxd_20dc: Number(data.shipside_yes_fxd_20dc || 0),
      shipside_yes_fxd_40hc: Number(data.shipside_yes_fxd_40hc || 0),
      shipside_no_mxd_20dc: Number(data.shipside_no_mxd_20dc || 0),
      shipside_no_mxd_40hc: Number(data.shipside_no_mxd_40hc || 0),
      shipside_no_fxd_20dc: Number(data.shipside_no_fxd_20dc || 0),
      shipside_no_fxd_40hc: Number(data.shipside_no_fxd_40hc || 0),
      obstacles: data.obstacles || "",
    };

    try {
      await apiClient.post("/container_movements/shipside", processedData);
      toast.success("Data shipside berhasil diperbarui!");
      navigate("/container-movements");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Gagal memperbarui data.");
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Memuat data...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
          title="Form Update Shipside"
          fields={fields}
          onSubmit={handleSubmit}
          buttonText="Update Shipside"
        />
      </div>
    </div>
  );
};

export default ShipsidePage;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import DynamicForm from "../components/form/dynamicform";
import toast from "react-hot-toast";

interface ContainerMovementReference {
  id: number;
  voyage_id: number;
}

interface VoyageRef {
  id: number;
  vessel_id: number;
  voyage_no: string;
  voyage_yr: number;
  port_id: number | null;
  port_name: string | null;
}

interface PortRef {
  id: number;
  name: string;
}

const PengajuanPage: React.FC = () => {
  const navigate = useNavigate();
  const [movements, setMovements] = useState<ContainerMovementReference[]>([]);
  const [voyages, setVoyages] = useState<VoyageRef[]>([]);
  const [ports, setPorts] = useState<PortRef[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmittingBerth, setIsSubmittingBerth] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get<ContainerMovementReference[]>("/container_movements/");
        setMovements(response.data);
        const voyagesRes = await apiClient.get<VoyageRef[]>("/voyages");
        setVoyages(voyagesRes.data);
        const portsRes = await apiClient.get<PortRef[]>("/ports");
        setPorts(portsRes.data);
      } catch (error) {
        console.error("Gagal mengambil data container movements:", error);
        toast.error("Gagal memuat data referensi.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
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

  const berthFields = [
    { name: "voyage_id", label: "Voyage", type: "select", placeholder: "Pilih voyage",
      options: voyages.map(v => ({ value: String(v.id), label: `V${v.voyage_no} - Vessel ${v.vessel_id}` })) },
    { name: "port_id", label: "Berth Location", type: "select", placeholder: "Pilih port",
      options: ports.map(p => ({ value: String(p.id), label: p.name })) }
  ];

  const handleBerthSubmit = async (data: Record<string, any>) => {
    if (!data.voyage_id || !data.port_id) {
      toast.error("Voyage dan Port wajib dipilih");
      return;
    }
    setIsSubmittingBerth(true);
    try {
      await apiClient.put(`/voyages/${data.voyage_id}/port`, { port_id: Number(data.port_id) });
      toast.success("Berth location berhasil diperbarui!");
      // Refresh voyages to reflect changes
      const voyagesRes = await apiClient.get<VoyageRef[]>("/voyages");
      setVoyages(voyagesRes.data);
    } catch (err: any) {
      console.error("Error set berth:", err.response || err);
      toast.error(err.response?.data?.msg || "Gagal memperbarui berth location.");
    } finally {
      setIsSubmittingBerth(false);
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

        <div className="mt-10">
          <DynamicForm
            title="Set / Ubah Berth Location Voyage"
            fields={berthFields}
            onSubmit={handleBerthSubmit}
            buttonText={isSubmittingBerth ? "Memproses..." : "Simpan Berth"}
          />
        </div>

      </div>
    </div>
  );
};

export default PengajuanPage;
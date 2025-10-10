import React, { useState, useEffect } from "react";
import apiClient from "../../api/axios";
import DynamicForm from "./dynamicform";
import toast from "react-hot-toast";
import Modal from "../modals";
import Table from "../tables/tables";

interface Vessel {
  id: number;
  name: string;
}

interface Port {
  id: number;
  name: string;
  code: string | null;
}

interface VoyageFormProps {
  onSuccess?: () => void;
}

const VoyageForm: React.FC<VoyageFormProps> = ({ onSuccess }) => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]); // State untuk menyimpan data port
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil data vessel dan port secara bersamaan
        const [vesselsRes, portsRes] = await Promise.all([
          apiClient.get<Vessel[]>("/vessels"),
          apiClient.get<Port[]>("/ports")
        ]);
        setVessels(vesselsRes.data);
        setPorts(portsRes.data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        toast.error("Gagal memuat daftar vessel atau port.");
      }
    };
    fetchData();
  }, []);

  const sortedVessels = React.useMemo(
    () => [...vessels].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    [vessels]
  );

  const sortedPorts = React.useMemo(
    () => [...ports].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    [ports]
  );

  const fields = [
    { 
      name: "vessel_id", 
      label: "Vessel", 
      type: "select", 
      placeholder: "Pilih vessel", 
      options: sortedVessels.map(v => ({ value: String(v.id), label: v.name })) 
    },
    { name: "voyage_yr", label: "Tahun Voyage", type: "number", placeholder: "2025" },
    { 
      name: "port_id", 
      label: "Berth Location", 
      type: "select", 
      placeholder: "Pilih berth location", 
      options: sortedPorts.map(port => ({ value: String(port.id), label: port.name })) 
    },
    { name: "date_berth", label: "Tanggal Sandar", type: "date" },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    if (!data.vessel_id || !data.voyage_yr || !data.port_id || !data.date_berth) {
        toast.error("Semua field wajib diisi!");
        return;
    }

    const payload = {
      vessel_id: Number(data.vessel_id),
      voyage_yr: Number(data.voyage_yr),
      port_id: Number(data.port_id),
      date_berth: data.date_berth,
    };
    try {
      await apiClient.post("/voyages", payload);
      toast.success("Voyage berhasil dibuat!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Error submit:", err.response || err);
      toast.error(err.response?.data?.msg || "Gagal membuat voyage.");
    }
  };

  const vesselTableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nama Vessel' }
  ];

  return (
    // Gunakan React Fragment <> agar bisa menampung form dan modal
    <>
      <div className="space-y-4">
        <DynamicForm
          title="Form Tambah Voyage Baru"
          fields={fields}
          onSubmit={handleSubmit}
          buttonText="Simpan Voyage"
        />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Semua Vessel Tersedia"
      >
        <Table headers={vesselTableHeaders} data={vessels} />
      </Modal>
    </>
  );
};

export default VoyageForm;
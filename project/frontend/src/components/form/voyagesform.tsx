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


interface VoyageFormProps {
  onSuccess?: () => void;
}

const VoyageForm: React.FC<VoyageFormProps> = ({ onSuccess }) => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const vesselsRes = await apiClient.get<Vessel[]>("/vessels");
        setVessels(vesselsRes.data);
      } catch (error) {
        console.error("Gagal mengambil data vessels:", error);
        toast.error("Gagal memuat daftar vessel.");
      }
    };
    fetchVessels();
  }, []);

  const sortedVessels = React.useMemo(
    () => [...vessels].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    [vessels]
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
    { name: "date_berth", label: "Tanggal Sandar", type: "date" },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    if (!data.vessel_id || !data.voyage_yr || !data.date_berth) {
      toast.error("Vessel, Tahun Voyage, dan Tanggal Sandar wajib diisi!");
      return;
    }

    const payload = {
      vessel_id: Number(data.vessel_id),
      voyage_yr: Number(data.voyage_yr),
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
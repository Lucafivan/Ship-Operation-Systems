import React, { useState, useEffect } from "react";
// Jalur impor diperbaiki
import apiClient from "../api/axios";
import DynamicForm from "../components/form/dynamicform";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Modal from "../components/modals";
import Table from "../components/tables/tables";
import { Button } from "../components/ui/Button";

interface Vessel {
  id: number;
  name: string;
}

const VesselPage: React.FC = () => {
  const navigate = useNavigate();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const response = await apiClient.get<Vessel[]>("/vessels");
        setVessels(response.data);
      } catch (error) {
        toast.error("Gagal memuat daftar vessel.");
      }
    };
    fetchVessels();
  }, []);

  const fields = [
    { name: "name", label: "Nama Vessel", placeholder: "Masukkan nama vessel" },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      const res = await apiClient.post("/vessels", data);
      toast.success("Vessel berhasil dibuat!");
      
      const updatedVessels = await apiClient.get<Vessel[]>("/vessels");
      setVessels(updatedVessels.data);
    } catch (err: any) {
      console.error("Error submit:", err.response || err);
      toast.error(err.response?.data?.msg || "Gagal membuat vessel");
    }
  };

  const vesselTableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nama Vessel' }
  ];

  return (
    <>
      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* 1. Ubah <DynamicForm /> menjadi <DynamicForm>...</DynamicForm> */}
          <DynamicForm 
            title="Form Tambah Vessel Baru" 
            fields={fields} 
            onSubmit={handleSubmit} 
            buttonText="Simpan" 
          >
            {/* 2. Sisipkan tombol secondary di sini. Ini akan menjadi 'children' */}
            <Button
              type="button" // PENTING: agar tidak men-submit form
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
            >
              Lihat Semua Vessel
            </Button>
          </DynamicForm>
        </div>
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

export default VesselPage;
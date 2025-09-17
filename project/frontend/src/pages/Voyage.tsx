import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import DynamicForm from "../components/dynamicform";
import toast from "react-hot-toast";
import Modal from "../components/modals";
import Table from "../components/tables/tables"; 

interface Vessel {
  id: number;
  name: string;
}

const VoyagePage: React.FC = () => {
  const navigate = useNavigate();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  
  // 3. TAMBAHKAN STATE UNTUK MENGONTROL MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const response = await apiClient.get<Vessel[]>("/vessels");
        setVessels(response.data);
      } catch (error) {
        console.error("Gagal mengambil data vessels:", error);
        toast.error("Gagal memuat daftar vessel.");
      }
    };
    fetchVessels();
  }, []);

  const fields = [
    { name: "vessel_id", label: "Vessel ID", type: "number", placeholder: "Masukkan ID Vessel (lihat daftar)" },
    { name: "voyage_no", label: "Nomor Voyage", type: "text", placeholder: "Masukkan nomor voyage" },
    { name: "voyage_yr", label: "Tahun Voyage", type: "number", placeholder: "Contoh: 2025" },
    { name: "berth_loc", label: "Lokasi Sandar", type: "text", placeholder: "Masukkan lokasi sandar" },
    { name: "date_berth", label: "Tanggal Sandar", type: "date" },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      const res = await apiClient.post("/voyages", data);
      console.log("Response:", res.data);
      toast.success("Voyage berhasil dibuat!");
      navigate("/bongkaran3");
    } catch (err: any) {
      console.error("Error submit:", err.response || err);
      toast.error(err.response?.data?.msg || "Gagal membuat voyage.");
    }
  };

  // 4. Definisikan header untuk tabel di dalam modal
  const vesselTableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nama Vessel' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* 5. MODIFIKASI BAGIAN DAFTAR VESSEL */}
        <div className="bg-slate-100 p-4 rounded-lg mb-6 border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Daftar Vessel Tersedia:</h3>
            {/* Tampilkan tombol hanya jika data lebih dari 5 */}
            {vessels.length > 5 && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-sm text-green-600 hover:underline font-semibold"
              >
                Lihat Semua
              </button>
            )}
          </div>
          {vessels.length > 0 ? (
            // Tampilkan hanya 5 item pertama
            <ul className="list-disc list-inside text-sm text-gray-600">
              {vessels.slice(0, 5).map((vessel) => (
                <li key={vessel.id}>
                  <strong>{vessel.name}</strong> (ID: {vessel.id})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Memuat daftar vessel...</p>
          )}
        </div>

        <DynamicForm
          title="Form Tambah Voyage Baru"
          fields={fields}
          onSubmit={handleSubmit}
          buttonText="Simpan Voyage"
        />
        
      </div>

      {/* 6. TAMBAHKAN KOMPONEN MODAL DI SINI */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Semua Vessel Tersedia"
      >
        <Table headers={vesselTableHeaders} data={vessels} />
      </Modal>
    </div>
  );
};

export default VoyagePage;
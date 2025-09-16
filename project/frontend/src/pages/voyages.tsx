// src/pages/VoyagePage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import DynamicForm from "../components/dynamicform"; // Impor DynamicForm Anda yang ada
import toast from "react-hot-toast";

// Definisikan tipe data untuk Vessel
interface Vessel {
  id: number;
  name: string;
}

const VoyagePage: React.FC = () => {
  const navigate = useNavigate();
  const [vessels, setVessels] = useState<Vessel[]>([]);

  // 1. Tetap ambil data vessels untuk ditampilkan sebagai referensi
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

  // 2. Definisikan field untuk DynamicForm menggunakan input biasa
  const fields = [
    { name: "vessel_id", label: "Vessel ID", type: "number", placeholder: "Masukkan ID Vessel (lihat daftar di atas)" },
    { name: "voyage_no", label: "Nomor Voyage", type: "text", placeholder: "Masukkan nomor voyage" },
    { name: "voyage_yr", label: "Tahun Voyage", type: "number", placeholder: "Contoh: 2025" },
    { name: "berth_loc", label: "Lokasi Sandar", type: "text", placeholder: "Masukkan lokasi sandar" },
    { name: "date_berth", label: "Tanggal Sandar", type: "date" },
  ];

  // 3. Fungsi handleSubmit tetap sama
  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // Data sudah otomatis diubah jadi angka oleh DynamicForm Anda
      const res = await apiClient.post("/voyages", data);
      console.log("Response:", res.data);
      toast.success("Voyage berhasil dibuat!");
      navigate("/bongkaran3"); // Opsional: arahkan ke halaman lain
    } catch (err: any) {
      console.error("Error submit:", err.response || err);
      toast.error(err.response?.data?.msg || "Gagal membuat voyage.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* DAFTAR VESSEL TES AJA*/}
        <div className="bg-slate-100 p-4 rounded-lg mb-6 border border-slate-200">
          <h3 className="font-semibold text-gray-700 mb-2">Daftar Vessel Tersedia:</h3>
          {vessels.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-600">
              {vessels.map((vessel) => (
                <li key={vessel.id}>
                  <strong>{vessel.name}</strong> (ID: {vessel.id})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Memuat daftar vessel...</p>
          )}
        </div>

        {/* Form Dinamis Anda */}
        <DynamicForm
          title="Form Tambah Voyage Baru"
          fields={fields}
          onSubmit={handleSubmit}
          buttonText="Simpan Voyage"
        />
        
      </div>
    </div>
  );
};

export default VoyagePage;
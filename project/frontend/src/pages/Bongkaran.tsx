import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import DynamicForm from "../components/dynamicform";
import toast from "react-hot-toast";

// Definisikan tipe data yang relevan
interface Voyage {
  id: number;
  voyage_no: string;
  vessel_name?: string; // Kita mungkin perlu join di backend untuk ini, tapi kita tampilkan ID saja
}

interface ContainerMovement {
  id: number;
  voyage_id: number;
}

const BongkaranPage: React.FC = () => {
  const navigate = useNavigate();
  const [availableVoyages, setAvailableVoyages] = useState<Voyage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Ambil data voyage yang belum punya data bongkaran
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil semua voyage dan semua container movement secara bersamaan
        const [voyagesRes, movementsRes] = await Promise.all([
            apiClient.get<Voyage[]>("/voyages"), // Pastikan ini juga konsisten
            apiClient.get<ContainerMovement[]>("/container_movements/"),
        ]);

        // Buat daftar ID voyage yang sudah terpakai
        const usedVoyageIds = new Set(
          movementsRes.data.map((cm) => cm.voyage_id)
        );

        // Saring voyage yang ID-nya belum ada di daftar terpakai
        const available = voyagesRes.data.filter(
          (voyage) => !usedVoyageIds.has(voyage.id)
        );
        
        setAvailableVoyages(available);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        toast.error("Gagal memuat data voyage yang tersedia.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Definisikan field untuk DynamicForm
  const fields = [
    { name: "voyage_id", label: "Voyage ID", type: "number", placeholder: "Pilih ID Voyage dari daftar di atas" },
    { name: "bongkaran_empty_20dc", label: "Bongkaran Empty 20DC", type: "number", placeholder: "Jumlah" },
    { name: "bongkaran_empty_40hc", label: "Bongkaran Empty 40HC", type: "number", placeholder: "Jumlah" },
    { name: "bongkaran_full_20dc", label: "Bongkaran Full 20DC", type: "number", placeholder: "Jumlah" },
    { name: "bongkaran_full_40hc", label: "Bongkaran Full 40HC", type: "number", placeholder: "Jumlah" },
  ];

  // 3. Fungsi untuk menangani submit form
  const handleSubmit = async (data: Record<string, any>) => {
    // Pastikan semua field number dikirim sebagai angka
    const processedData = {
        voyage_id: Number(data.voyage_id),
        bongkaran_empty_20dc: Number(data.bongkaran_empty_20dc || 0),
        bongkaran_empty_40hc: Number(data.bongkaran_empty_40hc || 0),
        bongkaran_full_20dc: Number(data.bongkaran_full_20dc || 0),
        bongkaran_full_40hc: Number(data.bongkaran_full_40hc || 0),
    };

    try {
      // Asumsi cm_bp didaftarkan dengan prefix /container_movements
      const res = await apiClient.post("/container_movements/bongkaran", processedData);
      toast.success("Data bongkaran berhasil dibuat!");
      navigate("/pengajuan"); // Arahkan ke halaman daftar setelah sukses
    } catch (err: any) {
      console.error("Error submit:", err.response || err);
      toast.error(err.response?.data?.msg || "Gagal menyimpan data bongkaran.");
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Memuat data voyage...</div>;
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Bantuan untuk Pengguna */}
        <div className="bg-slate-100 p-4 rounded-lg mb-6 border border-slate-200">
          <h3 className="font-semibold text-gray-700 mb-2">Voyage yang Tersedia:</h3>
          {availableVoyages.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-600 max-h-40 overflow-y-auto">
              {availableVoyages.map((voyage) => (
                <li key={voyage.id}>
                  <strong>Voyage No: {voyage.voyage_no}</strong> (ID: {voyage.id})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              Tidak ada voyage baru yang bisa ditambahkan data bongkaran.
            </p>
          )}
        </div>

        <DynamicForm
          title="Form Input Bongkaran"
          fields={fields}
          onSubmit={handleSubmit}
          buttonText="Simpan Bongkaran"
        />

      </div>
    </div>
  );
};

export default BongkaranPage;
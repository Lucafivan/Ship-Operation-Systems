import React from "react";
import apiClient from "../api/axios"; // <-- GUNAKAN IMPORT INI
import DynamicForm from "../components/dynamicform";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const VesselPage: React.FC = () => {
  const navigate = useNavigate();

  const fields = [
    { name: "name", label: "Nama Vessel", placeholder: "Masukkan nama vessel" },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    console.log("Data dikirim:", data);
    try {
      // Request menjadi jauh lebih simpel.
      // Header 'Authorization' dan 'Content-Type' akan diurus otomatis.
      const res = await apiClient.post("/vessels", data);

      console.log("Response:", res.data);
      toast.success("Vessel berhasil dibuat");
      navigate("/voyages2")
    } catch (err: any) {
      console.error("Error submit:", err.response || err);
      toast.error(err.response?.data?.msg || "Gagal membuat vessel");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <DynamicForm title="Form Vessel" fields={fields} onSubmit={handleSubmit} buttonText="Simpan" />
    </div>
  );
};

export default VesselPage;
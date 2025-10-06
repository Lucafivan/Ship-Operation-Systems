import React, { useEffect, useState } from "react";
import apiClient from "../api/axios";
import DynamicForm from "../components/form/dynamicform";
import toast from "react-hot-toast";
import Modal from "../components/modals";
import Table from "../components/tables/tables";
import { Button } from "../components/ui/Button";

interface PortItem {
  id: number;
  name: string;
  code?: string | null;
}

const PortPage: React.FC = () => {
  const [ports, setPorts] = useState<PortItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPorts = async () => {
    try {
      const res = await apiClient.get<PortItem[]>("/ports");
      setPorts(res.data);
    } catch (err) {
      toast.error("Gagal memuat daftar port.");
    }
  };

  useEffect(() => {
    fetchPorts();
  }, []);

  const fields = [
    { name: "name", label: "Nama Port", placeholder: "Masukkan nama port" },
    { name: "code", label: "Kode (opsional)", placeholder: "TPK1" },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await apiClient.post("/ports", data);
      toast.success("Port berhasil dibuat!");
      await fetchPorts();
    } catch (err: any) {
      toast.error(err?.response?.data?.msg || "Gagal membuat port");
    }
  };

  const portTableHeaders = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nama Port" },
    { key: "code", label: "Kode" },
  ];

  return (
    <>
      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-md">
          <DynamicForm
            title="Form Tambah Port Baru"
            fields={fields}
            onSubmit={handleSubmit}
            buttonText="Simpan"
          >
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(true)}>
              Lihat Semua Port
            </Button>
          </DynamicForm>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Semua Port Tersedia">
        <Table headers={portTableHeaders} data={ports} />
      </Modal>
    </>
  );
};

export default PortPage;
import React, { useState } from "react";
// Path ke komponen Button diperbaiki di sini
import { Button } from "../ui/Button";

interface Field {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
}

interface DynamicFormProps {
  title?: string;
  fields: Field[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  buttonText?: string;
  // 1. Tambahkan 'children' ke dalam props agar bisa menerima komponen lain
  children?: React.ReactNode;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  title,
  fields,
  onSubmit,
  buttonText = "Next",
  // Ambil 'children' dari props
  children,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-md w-full mx-auto space-y-4"
    >
      {title && (
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          {title}
        </h2>
      )}

      {fields.map((field, idx) => (
        <div key={idx} className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">
            {field.label}
          </label>
          <input
            type={field.type || "text"}
            name={field.name}
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      ))}

      {/* 2. Modifikasi area tombol agar bisa menampung lebih dari satu */}
      <div className="pt-4 flex flex-col gap-3">
        {/* 3. Tampilkan 'children' (tombol secondary kita) di sini */}
        
        <Button variant="primary" type="submit">
          {buttonText}
        </Button>
        {children}
      </div>
    </form>
  );
};

export default DynamicForm;
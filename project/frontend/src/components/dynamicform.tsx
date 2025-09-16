import React, { useState } from "react";
import { Button } from "../components/ui/Button";

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
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  title,
  fields,
  onSubmit,
  buttonText = "Next",
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value, // auto convert number
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md mx-auto space-y-4"
    >
      {/* 🔥 tampilkan title jika ada */}
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
            value={formData[field.name] || ""}   //  controlled input
            onChange={handleChange}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      ))}

      <div className="pt-4">
        <Button variant="primary" type="submit">
          {buttonText}
        </Button>
      </div>
    </form>
  );
};

export default DynamicForm;

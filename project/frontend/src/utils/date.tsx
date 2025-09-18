// utils/date.ts
export const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Senin sebagai awal minggu
  return new Date(d.setDate(diff));
};

export const endOfWeek = (date: Date) => {
  const d = startOfWeek(date);
  return new Date(d.setDate(d.getDate() + 6));
};

export const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

export const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

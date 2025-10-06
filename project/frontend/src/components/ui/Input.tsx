import { forwardRef, type ComponentProps } from 'react';

// Tipe props yang bisa diterima
type InputProps = ComponentProps<'input'> & {
  hasError?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', hasError, ...props }, ref) => {
    
    // Gaya dasar untuk semua input
    const baseStyle = 
      "mt-1 w-full h-10 rounded-md border px-3 outline-none focus:ring-2";
    
    // Gaya kondisional jika ada error
    const errorStyle = "border-red-500 focus:ring-red-500";
    
    // Gaya default (jika tidak ada error)
    const defaultStyle = "border-gray-300 focus:ring-green-600";

    return (
      <input
        className={`${baseStyle} ${hasError ? errorStyle : defaultStyle} ${className}`}
        ref={ref} // Teruskan ref ke elemen input
        {...props}
      />
    );
  }
);

// Nama display untuk kemudahan debugging
Input.displayName = 'Input';
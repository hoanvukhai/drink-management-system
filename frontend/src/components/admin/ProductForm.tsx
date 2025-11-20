// src/components/admin/ProductForm.tsx
import { useState, useEffect } from 'react'; // <-- Thêm useEffect
import type { FormEvent, ReactElement } from 'react'; // <-- Thêm useEffect
import { PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid'; // <-- Thêm icon
import type { Product } from './ProductList'; // <-- Import kiểu Product

// Định nghĩa Type
interface Category {
  id: number;
  name: string;
}

export type ProductFormData = {
  name: string;
  price: number;
  categoryId: number;
  imageUrl?: string | null;
};

type ProductFormProps = {
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading: boolean;
  productToEdit?: Product | null; // <-- Prop mới: sản phẩm đang sửa
  onCancel: () => void; // <-- Prop mới: để hủy sửa
};

export function ProductForm({
  categories,
  onSubmit,
  isLoading,
  productToEdit,
  onCancel,
}: ProductFormProps): ReactElement {
  // State
  const [name, setName] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');

  // --- LOGIC QUAN TRỌNG NHẤT ---
  // Tự động điền form khi productToEdit thay đổi
  useEffect(() => {
    if (productToEdit) {
      // Mode Sửa: Điền dữ liệu
      setName(productToEdit.name);
      setPriceStr(String(productToEdit.price ?? ''));
      setCategoryId(productToEdit.categoryId ?? '');
      setImageUrl(productToEdit.imageUrl ?? '');
    } else {
      // Mode Thêm: Reset form về rỗng
      setName('');
      setPriceStr('');
      setCategoryId('');
      setImageUrl('');
    }
    // Phụ thuộc vào productToEdit (khi bấm Sửa) và categories (khi mới tải trang)
  }, [productToEdit, categories]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (categoryId === '') {
      alert('Vui lòng chọn một danh mục!');
      return;
    }

    // Parse price from string, remove non-digit characters
    const numeric = Number(String(priceStr).replace(/[^0-9.-]+/g, '')) || 0;

    await onSubmit({ name, price: numeric, categoryId: Number(categoryId), imageUrl: imageUrl || null });
  };

  // Xác định xem đang ở mode Sửa hay Thêm
  const isEditMode = !!productToEdit;

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        {/* Tiêu đề động */}
        {isEditMode ? `Sửa sản phẩm: ${productToEdit.name}` : 'Thêm sản phẩm'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Tên */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tên sản phẩm
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Trà sữa..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                       focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        {/* Input Giá */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Giá</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9,]*"
            value={priceStr}
            onChange={(e) => setPriceStr(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                       focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="1000"
            required
          />
        </div>
      </div>
      {/* Select Danh mục */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Danh mục
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                     focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="" disabled>
            -- Chọn danh mục --
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Image URL (optional) */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Hình ảnh (URL, không bắt buộc)</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                     focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* --- CỤM NÚT BẤM ĐỘNG --- */}
      <div className="flex items-center space-x-3 mt-4">
        <button
          type="submit"
          disabled={isLoading}
          // Màu nút thay đổi theo mode
          className={`px-4 py-2 text-white rounded-md flex items-center 
                      disabled:bg-gray-400 transition-colors
                      ${
                        isEditMode
                          ? 'bg-green-600 hover:bg-green-700' // Mode Sửa
                          : 'bg-blue-600 hover:bg-blue-700' // Mode Thêm
                      }`}
        >
          {/* Icon và Text thay đổi theo mode */}
          {isEditMode ? (
            <CheckIcon className="h-5 w-5 mr-1" />
          ) : (
            <PlusIcon className="h-5 w-5 mr-1" />
          )}
          {isEditMode ? 'Lưu thay đổi' : 'Thêm'}
        </button>

        {/* Nút Hủy (chỉ hiện ở mode Sửa) */}
        {isEditMode && (
          <button
            type="button" // QUAN TRỌNG: type="button" để không submit form
            onClick={onCancel} // <-- Gọi hàm onCancel
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md 
                       hover:bg-gray-300 flex items-center transition-colors"
          >
            <XMarkIcon className="h-5 w-5 mr-1" />
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
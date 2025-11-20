// src/components/admin/CategoryForm.tsx (ĐÃ SỬA)
import { useState, useEffect } from 'react';
import type { FormEvent, ReactElement } from 'react'; // <-- Thêm
import {
  PlusIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'; // <-- Thêm
import type { Category } from './CategoryList'; // <-- Import kiểu

// Định nghĩa Props
type CategoryFormProps = {
  onSubmit: (categoryName: string) => Promise<void>;
  isLoading: boolean;
  categoryToEdit?: Category | null; // <-- Prop mới
  onCancel: () => void; // <-- Prop mới
};

export function CategoryForm({
  onSubmit,
  isLoading,
  categoryToEdit,
  onCancel,
}: CategoryFormProps): ReactElement {
  // State
  const [categoryName, setCategoryName] = useState('');

  // Tự động điền form khi ở mode Sửa
  useEffect(() => {
    if (categoryToEdit) {
      setCategoryName(categoryToEdit.name);
    } else {
      setCategoryName('');
    }
  }, [categoryToEdit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (categoryName.trim() === '') return;

    await onSubmit(categoryName); // Hàm onSubmit (từ cha) sẽ lo logic

    // Chỉ reset form nếu đang ở mode "Thêm"
    if (!isEditMode) {
      setCategoryName('');
    }
  };

  const isEditMode = !!categoryToEdit;

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEditMode ? `Sửa danh mục: ${categoryToEdit.name}` : 'Thêm danh mục'}
      </h2>
      <label className="block text-sm font-medium text-gray-700">
        Tên danh mục
      </label>
      <div className="flex mt-1">
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="VD: Cà phê..."
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                     focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
        {/* Cụm nút bấm động */}
      </div>
      <div className="flex items-center space-x-3 mt-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 text-white rounded-md flex items-center 
                      disabled:bg-gray-400 transition-colors
                      ${
                        isEditMode
                          ? 'bg-green-600 hover:bg-green-700' // Mode Sửa
                          : 'bg-blue-600 hover:bg-blue-700' // Mode Thêm (đổi từ xanh lá)
                      }`}
        >
          {isEditMode ? (
            <CheckIcon className="h-5 w-5 mr-1" />
          ) : (
            <PlusIcon className="h-5 w-5 mr-1" />
          )}
          {isEditMode ? 'Lưu' : 'Thêm'}
        </button>

        {isEditMode && (
          <button
            type="button"
            onClick={onCancel}
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
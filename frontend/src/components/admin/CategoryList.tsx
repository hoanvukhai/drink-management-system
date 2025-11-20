// src/components/admin/CategoryList.tsx
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

// Kiểu Category (nên định nghĩa ở nơi chung, nhưng tạm thời để đây)
export interface Category {
  id: number;
  name: string;
}

type CategoryListProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  onSelect?: (category: Category) => void;
  onAdd?: () => void;
};

export function CategoryList({ categories, onEdit, onDelete, onSelect, onAdd }: Readonly<CategoryListProps>) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 max-h-[calc(100vh-6rem)] overflow-auto">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-semibold">Danh mục</h2>
        <div className="flex items-center space-x-2">
          <button onClick={() => onSelect?.({ id: -1, name: 'Tất cả' })} className="text-sm text-gray-600 hover:underline">Tất cả</button>
          <button onClick={() => onAdd?.()} aria-label="Thêm danh mục" className="inline-flex items-center px-2 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">+</button>
        </div>
      </div>

      {/* Mobile: horizontal pills */}
      <div className="mt-3 block lg:hidden overflow-x-auto">
        <div className="flex space-x-2 px-2">
          {categories.map((category) => (
            <button key={category.id} onClick={() => onSelect?.(category)} className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 whitespace-nowrap">{category.name}</button>
          ))}
        </div>
      </div>

      {/* Desktop: list */}
      <div className="hidden lg:block mt-3">
        {categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Chưa có danh mục nào.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-900 cursor-pointer" onClick={() => onSelect?.(category)}>
                  {category.name}
                </span>
                <div className="flex space-x-4">
                  <button onClick={() => onEdit(category)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Sửa">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => onDelete(category.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Xóa">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
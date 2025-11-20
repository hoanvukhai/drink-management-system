import type { ReactElement } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Category as CategoryType } from './CategoryList';

type Props = {
  categories: CategoryType[];
  onEdit: (c: CategoryType) => void;
  onDelete: (id: number) => void;
  onSelect?: (c: CategoryType) => void;
  onAdd?: () => void;
};

export function RightCategoryPanel({ categories, onEdit, onDelete, onSelect, onAdd }: Props): ReactElement {
  return (
    <div className="hidden lg:flex">
      <aside className="flex flex-col w-80 h-screen fixed right-0 top-0 bg-white shadow-inner z-40">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Danh mục</h3>
          <div className="flex items-center space-x-2">
            <button onClick={() => onAdd?.()} aria-label="Thêm danh mục" className="inline-flex items-center px-2 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">+
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {categories.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Chưa có danh mục nào.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {categories.map((category) => (
                <li key={category.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                  <button className="text-sm font-medium text-gray-900 text-left w-full" onClick={() => onSelect?.(category)}>{category.name}</button>
                  <div className="flex items-center space-x-3 ml-3">
                    <button onClick={() => onEdit(category)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
                    <button onClick={() => onDelete(category.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

export default RightCategoryPanel;

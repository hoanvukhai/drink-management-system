// src/components/admin/ProductList.tsx
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline'; // <-- Thêm PencilIcon

// Định nghĩa Type (Sửa lại, dùng chung với AdminMenu)
export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  imageUrl?: string | null;
  // Bạn có thể thêm 'category' nếu API trả về
}

type ProductListProps = {
  products: Product[];
  onEdit: (product: Product) => void; // <-- Thêm prop mới
  onDelete: (id: number) => void; // <-- Thêm prop mới
  onAdd?: () => void;
};

export function ProductList({ products, onEdit, onDelete, onAdd }: Readonly<ProductListProps>) {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-none min-w-0">
      <div className="flex items-center justify-between p-6">
        <h2 className="text-xl font-semibold w-full ">Danh sách sản phẩm</h2>
        <div className="flex items-center space-x-2">
          <button onClick={() => onAdd?.()} className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            <span className="mr-2">+</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-12 w-12 rounded-md object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">{product.name.split(' ').map(w => w[0]).slice(0,2).join('')}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.price.toLocaleString()} đ</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-4">
                  <button onClick={() => onEdit(product)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Sửa">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => onDelete(product.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Xóa">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
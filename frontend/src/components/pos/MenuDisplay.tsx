// File: src/components/pos/MenuDisplay.tsx
import type { ReactElement } from 'react';

// Định nghĩa Types (Nhận từ cha)
interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
}
interface Category {
  id: number;
  name: string;
}
type MenuDisplayProps = {
  categories: Category[];
  products: Product[];
  onAddToCart: (product: Product) => void;
};

export function MenuDisplay({
  categories,
  products,
  onAddToCart,
}: MenuDisplayProps): ReactElement {
  return (
    // Dùng space-y-6 để tạo khoảng cách giữa các "Card" danh mục
    <div className="space-y-6">
      {categories.map((category) => (
        // Mỗi danh mục là 1 "Card"
        <div
          key={category.id}
          className="bg-white shadow-lg rounded-lg overflow-hidden"
        >
          {/* Tiêu đề Card (Tên danh mục) */}
          <h3 className="text-xl font-semibold p-4 bg-gray-50 border-b">
            {category.name}
          </h3>

          {/* Grid chứa các sản phẩm */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {products
              .filter((p) => p.categoryId === category.id)
              .map((product) => (
                <button
                  key={product.id}
                  onClick={() => onAddToCart(product)}
                  className="border p-4 rounded-xl shadow-sm hover:bg-indigo-50 text-left 
                             transition-colors transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 
                             focus:ring-indigo-500 flex flex-col justify-between min-h-[6rem]"
                  title={product.name}
                >
                  <div className="font-semibold text-gray-800 overflow-hidden text-ellipsis" style={{WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical'}}>
                    {product.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {product.price.toLocaleString()} đ
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
// src/pages/OrderHistory.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa Type cho dữ liệu trả về
// (Dựa trên truy vấn 'include' của Prisma)
interface Product {
  id: number;
  name: string;
  price: number;
}

interface OrderItem {
  id: number;
  quantity: number;
  product: Product;
}

interface Order {
  id: number;
  createdAt: string;
  totalAmount: number;
  items: OrderItem[];
}

// API client
const apiClient = axios.create({ baseURL: 'http://localhost:3000' });

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Gọi API GET /orders từ backend
    apiClient
      .get('/orders')
      .then((res) => {
        setOrders(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch orders', err);
        setError('Không thể tải lịch sử đơn hàng');
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="p-8">Đang tải lịch sử đơn hàng...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (orders.length === 0) {
    return <div className="p-8">Chưa có đơn hàng nào.</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Lịch sử Đơn hàng
      </h1>
      
      {/* Vòng lặp ngoài: Lặp qua từng Đơn hàng (Order) */}
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow-lg rounded-lg overflow-hidden"
          >
            {/* Thông tin chung của Đơn hàng */}
            <div className="bg-gray-100 p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  Đơn hàng #{order.id}
                </h2>
                <p className="text-sm text-gray-600">
                  Ngày: {new Date(order.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-blue-600">
                  Tổng tiền: {order.totalAmount.toLocaleString()} đ
                </span>
              </div>
            </div>

            {/* Vòng lặp trong: Lặp qua các Món hàng (OrderItem) */}
            <ul className="divide-y divide-gray-200 p-4">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">{item.product.name}</span>
                    <span className="text-gray-500 text-sm">
                      {' '}
                      (Giá: {item.product.price.toLocaleString()} đ)
                    </span>
                  </div>
                  <span className="text-gray-700">
                    Số lượng: {item.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
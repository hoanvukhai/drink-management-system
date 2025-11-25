import { useState, useEffect } from 'react';
import { ordersAPI, Order } from '../../../lib/api';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  CheckCircleIcon,
  MapPinIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000); // Auto refresh 3s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getForKitchen();
      setOrders(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsReady = async (orderId: number, orderNumber: string) => {
    if (!confirm(`Xác nhận đã hoàn thành đơn ${orderNumber}?`)) return;

    try {
      await ordersAPI.markAsReady(orderId);
      toast.success('Đã hoàn thành đơn!');
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    }
  };

  const getDuration = (createdAt: string) => {
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const minutes = Math.floor((now - start) / 60000);
    
    if (minutes < 1) return 'Vừa tạo';
    if (minutes >= 10) {
      return <span className="text-red-600 font-bold">⚠️ {minutes}p</span>;
    }
    return `${minutes}p`;
  };

  const getTotalItems = (order: Order) => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <FireIcon className="h-8 w-8 text-orange-600" />
              ☕ Pha chế
            </h1>
            <p className="text-gray-600 mt-1">Các đơn đang chờ pha chế</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchOrders}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>

        {/* Statistics */}
        <Card padding="md" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đơn chờ</p>
              <p className="text-3xl font-bold text-orange-600">{orders.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng món</p>
              <p className="text-3xl font-bold text-gray-900">
                {orders.reduce((sum, o) => sum + getTotalItems(o), 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Đơn lâu nhất</p>
              <p className="text-xl font-bold text-red-600">
                {orders.length > 0
                  ? getDuration(orders[orders.length - 1].createdAt)
                  : '-'}
              </p>
            </div>
          </div>
        </Card>

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-12 text-gray-500">
              <FireIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Không có đơn nào đang chờ</p>
              <p className="text-sm mt-2">Nghỉ ngơi một chút! ☕</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => {
              const isUrgent = new Date().getTime() - new Date(order.createdAt).getTime() > 600000; // > 10 phút

              return (
                <Card
                  key={order.id}
                  padding="none"
                  className={`overflow-hidden ${isUrgent ? 'ring-2 ring-red-500' : ''}`}
                >
                  {/* Card Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {order.type === 'DINE_IN' ? (
                          <>
                            <MapPinIcon className="h-5 w-5" />
                            <span className="font-bold text-lg">{order.table?.name}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBagIcon className="h-5 w-5" />
                            <span className="font-bold text-lg">Mang về</span>
                          </>
                        )}
                      </div>
                      <Badge variant="neutral" className="bg-white text-orange-600">
                        <ClockIcon className="h-3 w-3 mr-1 inline" />
                        {getDuration(order.createdAt)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>{order.orderNumber}</span>
                      <span>{formatDate(order.createdAt).split(' ')[1]}</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="px-4 py-3 space-y-2 max-h-60 overflow-y-auto">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-start gap-2 flex-1">
                          <div className="w-8 h-8 rounded-md bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600 flex-shrink-0">
                            {item.quantity}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{item.product.name}</p>
                            {item.note && (
                              <div className="mt-1 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                <span className="font-semibold text-yellow-800">📝 Ghi chú:</span>{' '}
                                <span className="text-yellow-900">{item.note}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Tổng món:</span>
                      <span className="font-bold text-gray-900">{getTotalItems(order)} món</span>
                    </div>
                    <Button
                      variant="success"
                      size="lg"
                      className="w-full"
                      onClick={() => handleMarkAsReady(order.id, order.orderNumber)}
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Hoàn thành
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
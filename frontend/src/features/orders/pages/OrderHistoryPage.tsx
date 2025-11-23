// frontend/src/features/orders/pages/OrderHistoryPage.tsx
import { useState, useEffect } from 'react';
import { ordersAPI, Order } from '../../../lib/api';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  ShoppingBagIcon,
  ReceiptPercentIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOrder = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'success' | 'warning' | 'danger' | 'primary' | 'neutral'; label: string }> = {
      PENDING: { variant: 'warning', label: 'Chờ xác nhận' },
      CONFIRMED: { variant: 'primary', label: 'Đã xác nhận' },
      PREPARING: { variant: 'warning', label: 'Đang pha chế' },
      READY: { variant: 'success', label: 'Sẵn sàng' },
      COMPLETED: { variant: 'success', label: 'Hoàn thành' },
      CANCELLED: { variant: 'danger', label: 'Đã hủy' },
    };
    const { variant, label } = config[status] || { variant: 'neutral', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalItems = orders.reduce(
    (sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0),
    0
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        <div className="page-header">
          <h1 className="page-title">Lịch sử đơn hàng</h1>
          <p className="text-gray-600 mt-2">Xem lại tất cả đơn hàng đã tạo</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-indigo-100">
                <ShoppingBagIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <ReceiptPercentIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng món</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card padding="lg">
              <div className="text-center py-12">
                <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-gray-600">Các đơn hàng sẽ hiển thị tại đây sau khi được tạo</p>
              </div>
            </Card>
          ) : (
            orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <Card key={order.id} padding="none" hover className="overflow-hidden">
                  {/* Order Header */}
                  <button
                    onClick={() => toggleOrder(order.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <ShoppingBagIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-gray-900">Đơn #{order.id}</h3>
                          {getStatusBadge(order.status)}
                          {/* Table/Takeaway Badge */}
                          {order.tableId ? (
                            <Badge variant="primary">
                              <MapPinIcon className="h-3 w-3 mr-1 inline" />
                              {order.table?.name || `Bàn ${order.tableId}`}
                            </Badge>
                          ) : (
                            <Badge variant="neutral">
                              <ShoppingBagIcon className="h-3 w-3 mr-1 inline" />
                              Mang về
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span>{itemCount} món</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold text-indigo-600">{formatCurrency(order.totalAmount)}</div>
                      </div>
                      {isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Order Items (Expandable) */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="px-6 py-4">
                        <h4 className="font-medium text-gray-900 mb-3">Chi tiết đơn hàng</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                  {item.quantity}x
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{item.product.name}</p>
                                  <p className="text-sm text-gray-600">{formatCurrency(item.product.price)} / món</p>
                                  {item.note && (
                                    <p className="text-xs text-indigo-600 italic mt-0.5">📝 {item.note}</p>
                                  )}
                                </div>
                              </div>
                              <div className="font-semibold text-gray-900">
                                {formatCurrency(item.product.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Total */}
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                          <span className="font-medium text-gray-900">Tổng cộng</span>
                          <span className="text-xl font-bold text-indigo-600">{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { ordersAPI, Order } from '../../../lib/api';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';

export default function CashierPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Auto refresh 5s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getForCashier();
      setOrders(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPayment = (order: Order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handleCompletePayment = async () => {
    if (!selectedOrder) return;

    setIsProcessing(true);
    try {
      await ordersAPI.complete(selectedOrder.id);
      toast.success('Thanh toán thành công!');
      setShowPaymentModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsProcessing(false);
    }
  };

  const getDuration = (createdAt: string) => {
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const minutes = Math.floor((now - start) / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h${mins}p`;
    }
    return `${mins}p`;
  };

  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
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
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              💰 Thu ngân
            </h1>
            <p className="text-gray-600 mt-1">Thanh toán và trả bàn</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchOrders}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Đơn chờ thanh toán</p>
              <p className="text-4xl font-bold text-green-600">{orders.length}</p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng doanh thu chờ</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalRevenue())}</p>
            </div>
          </Card>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-12 text-gray-500">
              <ReceiptPercentIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Không có đơn nào chờ thanh toán</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <Card key={order.id} padding="none" className="overflow-hidden">
                {/* Card Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white">
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
                    <Badge variant="neutral" className="bg-white text-green-600">
                      <ClockIcon className="h-3 w-3 mr-1 inline" />
                      {getDuration(order.createdAt)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{order.orderNumber}</span>
                    {order.customerName && <span>{order.customerName}</span>}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="px-4 py-3 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-6 text-center font-medium text-gray-600">
                            {item.quantity}×
                          </span>
                          <span className="text-gray-900">{item.product.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Payment Button */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                  <Button
                    variant="success"
                    size="lg"
                    className="w-full"
                    onClick={() => handleOpenPayment(order)}
                  >
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    Thanh toán
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Payment Confirmation Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Xác nhận thanh toán"
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Order Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Đơn hàng:</span>
                <span className="font-semibold">{selectedOrder.orderNumber}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {selectedOrder.type === 'DINE_IN' ? 'Bàn:' : 'Khách hàng:'}
                </span>
                <span className="font-semibold">
                  {selectedOrder.type === 'DINE_IN'
                    ? selectedOrder.table?.name
                    : selectedOrder.customerName || 'Khách vãng lai'}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Thời gian:</span>
                <span className="font-semibold">{getDuration(selectedOrder.createdAt)}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">Món</th>
                    <th className="px-3 py-2 text-center">SL</th>
                    <th className="px-3 py-2 text-right">Đơn giá</th>
                    <th className="px-3 py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-3 py-2">{item.product.name}</td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.price)}</td>
                      <td className="px-3 py-2 text-right font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Tổng thanh toán:</span>
                <span className="text-3xl font-bold text-green-600">
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <ModalFooter>
              <Button
                variant="secondary"
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessing}
              >
                Hủy
              </Button>
              <Button
                variant="success"
                onClick={handleCompletePayment}
                isLoading={isProcessing}
                leftIcon={<CurrencyDollarIcon className="h-5 w-5" />}
              >
                Xác nhận thanh toán
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
}
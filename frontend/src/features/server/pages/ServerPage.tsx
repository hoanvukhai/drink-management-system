import { useState, useEffect } from 'react';
import { ordersAPI, Order, tablesAPI } from '../../../lib/api';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Input';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  CheckCircleIcon,
  MapPinIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function ServerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [newTableId, setNewTableId] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Auto refresh 5s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, tablesRes] = await Promise.all([
        ordersAPI.getForServer(),
        tablesAPI.getAll(),
      ]);
      setOrders(ordersRes.data);
      setTables(tablesRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkItemServed = async (orderId: number, itemId: number) => {
    try {
      await ordersAPI.markItemServed(orderId, itemId);
      toast.success('Đã đánh dấu món mang ra');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleMoveTable = async () => {
    if (!selectedOrder || !newTableId) return;

    try {
      await ordersAPI.moveTable(selectedOrder.id, Number(newTableId));
      toast.success('Đã chuyển bàn');
      setShowMoveModal(false);
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Không thể chuyển bàn');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'warning' | 'primary' | 'success'; label: string }> = {
      PENDING: { variant: 'warning', label: '⏳ Đang pha chế' },
      READY: { variant: 'primary', label: '✅ Sẵn sàng' },
      SERVED: { variant: 'success', label: '🍽️ Đã mang ra' },
    };
    const { variant, label } = config[status] || { variant: 'warning', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getDuration = (createdAt: string) => {
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const minutes = Math.floor((now - start) / 60000);
    return `${minutes}p`;
  };

  // Phân loại orders
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const readyOrders = orders.filter((o) => o.status === 'READY');
  const servedOrders = orders.filter((o) => o.status === 'SERVED');

  const availableTables = tables.filter((t) => t.status === 'AVAILABLE');

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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title">📋 Phục vụ</h1>
            <p className="text-gray-600 mt-1">Theo dõi đơn hàng và phục vụ khách</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchData}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Đang pha chế</p>
              <p className="text-3xl font-bold text-orange-600">{pendingOrders.length}</p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Sẵn sàng</p>
              <p className="text-3xl font-bold text-blue-600">{readyOrders.length}</p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Chờ thanh toán</p>
              <p className="text-3xl font-bold text-green-600">{servedOrders.length}</p>
            </div>
          </Card>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card padding="lg">
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Không có đơn hàng nào</p>
              </div>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} padding="none">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {order.type === 'DINE_IN' ? (
                          <>
                            <MapPinIcon className="h-5 w-5 text-indigo-600" />
                            <span className="font-semibold text-gray-900">
                              {order.table?.name || `Bàn ${order.tableId}`}
                            </span>
                            <span className="text-sm text-gray-500">
                              • {order.table?.zone?.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <ShoppingBagIcon className="h-5 w-5 text-blue-600" />
                            <span className="font-semibold text-gray-900">Mang về</span>
                            {order.customerName && (
                              <span className="text-sm text-gray-500">• {order.customerName}</span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        <Badge variant="neutral">
                          <ClockIcon className="h-3 w-3 mr-1 inline" />
                          {getDuration(order.createdAt)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.type === 'DINE_IN' && order.status !== 'SERVED' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowMoveModal(true);
                          }}
                        >
                          🔄 Chuyển bàn
                        </Button>
                      )}
                      <span className="text-lg font-bold text-indigo-600">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        item.isServed ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-white border flex items-center justify-center text-sm font-medium">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          {item.note && (
                            <p className="text-sm text-indigo-600">📝 {item.note}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {formatCurrency(item.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.isServed ? (
                          <Badge variant="success">✓ Đã mang ra</Badge>
                        ) : order.status === 'READY' ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleMarkItemServed(order.id, item.id)}
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Đã mang ra
                          </Button>
                        ) : (
                          <Badge variant="warning">Đang làm...</Badge>
                        )}
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Move Table Modal */}
      <Modal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        title="Chuyển bàn"
        size="sm"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Chuyển đơn <span className="font-semibold">{selectedOrder.orderNumber}</span> từ{' '}
              <span className="font-semibold">{selectedOrder.table?.name}</span> sang bàn:
            </p>
            <Select
              label="Chọn bàn mới"
              value={newTableId}
              onChange={(e) => setNewTableId(e.target.value)}
              options={[
                { value: '', label: '-- Chọn bàn --' },
                ...availableTables.map((t) => ({
                  value: t.id.toString(),
                  label: `${t.name} (${t.zone.name})`,
                })),
              ]}
            />
            <ModalFooter>
              <Button variant="secondary" onClick={() => setShowMoveModal(false)}>
                Hủy
              </Button>
              <Button variant="primary" onClick={handleMoveTable} disabled={!newTableId}>
                Chuyển bàn
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
}
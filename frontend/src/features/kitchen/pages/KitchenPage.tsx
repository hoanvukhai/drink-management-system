// frontend/src/features/kitchen/pages/KitchenPage.tsx
import { useState, useEffect } from 'react';
import { ordersAPI, recipesAPI, Order, OrderItem } from '../../../lib/api';
import { formatCurrency } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  CheckCircleIcon,
  MapPinIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  FireIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

interface Recipe {
  id: number;
  productId: number;
  description?: string;
  ingredients: { id: number; name: string; quantity: string; note?: string }[];
  steps: { id: number; stepNumber: number; instruction: string }[];
  product: { id: number; name: string };
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
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

  const handleItemClick = async (productId: number) => {
    try {
      const response = await recipesAPI.getByProduct(productId);
      setSelectedRecipe(response.data);
      setShowRecipeModal(true);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Món này chưa có công thức');
      } else {
        toast.error('Không thể tải công thức');
      }
    }
  };

  const toggleItemComplete = async (orderId: number, itemId: number, currentStatus: boolean) => {
    try {
      // Cho phép toggle on/off bằng cách gọi API nhiều lần
      await ordersAPI.markItemCompleted(orderId, itemId);
      
      if (!currentStatus) {
        toast.success('✅ Đã đánh dấu hoàn thành');
      } else {
        toast.success('🔄 Đã bỏ đánh dấu');
      }
      
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleCompleteOrder = async (orderId: number, orderNumber: string) => {
    // Check if all items completed
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const allCompleted = order.items.every(item => item.isCompleted);
    if (!allCompleted) {
      toast.error('Vui lòng hoàn thành tất cả món trước!');
      return;
    }

    if (!confirm(`Xác nhận đã hoàn thành đơn ${orderNumber}?`)) return;

    try {
      await ordersAPI.markAsReady(orderId);
      toast.success('Đơn đã sẵn sàng!');
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

  const getCompletedCount = (order: Order) => {
    return order.items.filter(item => item.isCompleted).length;
  };

  const isOrderReady = (order: Order) => {
    return order.items.every(item => item.isCompleted);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <FireIcon className="h-8 w-8 text-orange-600" />
              ☕ Bếp / Bar
            </h1>
            <p className="text-gray-600 mt-1">Đơn đang chờ pha chế - Click vào món để xem công thức</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchOrders}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Đơn chờ</p>
              <p className="text-3xl font-bold text-orange-600">{orders.length}</p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng món</p>
              <p className="text-3xl font-bold text-gray-900">
                {orders.reduce((sum, o) => sum + getTotalItems(o), 0)}
              </p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Hoàn thành</p>
              <p className="text-3xl font-bold text-green-600">
                {orders.reduce((sum, o) => sum + getCompletedCount(o), 0)}
              </p>
            </div>
          </Card>
        </div>

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">☕</div>
              <p className="text-lg">Không có đơn nào đang chờ</p>
              <p className="text-sm mt-2">Nghỉ ngơi một chút! ☕</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => {
              const isUrgent = new Date().getTime() - new Date(order.createdAt).getTime() > 600000;
              const allDone = isOrderReady(order);

              return (
                <Card
                  key={order.id}
                  padding="none"
                  className={`overflow-hidden ${isUrgent ? 'ring-2 ring-red-500' : ''} ${allDone ? 'ring-2 ring-green-500' : ''}`}
                >
                  {/* Card Header */}
                  <div className={`px-4 py-3 text-white ${allDone ? 'bg-green-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
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
                      <span className="text-sm bg-white/20 px-2 py-1 rounded">
                        {getDuration(order.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{order.orderNumber}</p>
                  </div>

                  {/* Items List with Checklist */}
                  <div className="p-4 space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-lg p-3 border-2 transition-all ${
                          item.isCompleted
                            ? 'bg-green-50 border-green-300'
                            : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleItemComplete(order.id, item.id, item.isCompleted)}
                            className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              item.isCompleted
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300 hover:border-orange-500'
                            }`}
                          >
                            {item.isCompleted && (
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          {/* Content - Click to view recipe */}
                          <button
                            onClick={() => handleItemClick(item.product.id)}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`font-semibold ${item.isCompleted ? 'text-green-900 line-through' : 'text-gray-900'}`}>
                                  <span className="inline-block w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-center leading-8 mr-2">
                                    {item.quantity}
                                  </span>
                                  {item.product.name}
                                </p>
                                {item.note && (
                                  <p className="text-sm text-orange-600 mt-1">
                                    📝 {item.note}
                                  </p>
                                )}
                                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                  <BookOpenIcon className="h-3 w-3" />
                                  Click để xem công thức
                                </p>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 pb-4">
                    <div className="text-center text-sm text-gray-600 mb-3">
                      Hoàn thành: {getCompletedCount(order)}/{order.items.length} món
                    </div>
                    {allDone ? (
                      <Button
                        variant="success"
                        size="lg"
                        className="w-full"
                        onClick={() => handleCompleteOrder(order.id, order.orderNumber)}
                      >
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        Hoàn thành đơn
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full"
                        disabled
                      >
                        Đang làm...
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recipe Modal */}
      <Modal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        title="📖 Công thức"
        size="lg"
      >
        {selectedRecipe && (
          <div className="space-y-6">
            {/* Product Name */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">{selectedRecipe.product.name}</h3>
              {selectedRecipe.description && (
                <p className="text-gray-600 mt-2">{selectedRecipe.description}</p>
              )}
            </div>

            {/* Ingredients */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                🥤 Nguyên liệu
              </h4>
              <div className="space-y-2">
                {selectedRecipe.ingredients.map((ing, idx) => (
                  <div key={ing.id} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{ing.name}</p>
                      <p className="text-sm text-gray-600">{ing.quantity}</p>
                      {ing.note && (
                        <p className="text-xs text-orange-600 mt-1">💡 {ing.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                👨‍🍳 Cách làm
              </h4>
              <div className="space-y-3">
                {selectedRecipe.steps.map((step) => (
                  <div key={step.id} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center font-bold">
                      {step.stepNumber}
                    </span>
                    <div className="flex-1 bg-white rounded-lg p-3 border-2 border-gray-200">
                      <p className="text-gray-800">{step.instruction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
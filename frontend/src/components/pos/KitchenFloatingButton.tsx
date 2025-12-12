// frontend/src/components/pos/KitchenFloatingButton.tsx
import { useState, useEffect } from 'react';
import { ordersAPI, recipesAPI, Order, OrderItem } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Sheet, SheetFooter } from '../ui/Sheet';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import toast from 'react-hot-toast';
import {
  FireIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  ShoppingBagIcon,
  XCircleIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

interface Recipe {
  id: number;
  productId: number;
  description?: string;
  ingredients: { id: number; ingredient: { name: string; unit: string }; quantity: number }[];
  steps: { id: number; stepNumber: number; instruction: string }[];
  product: { id: number; name: string };
}

export function KitchenFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const allCompleted = order.items.every(item => item.isCompleted);
    if (!allCompleted) {
      toast.error('Vui lòng hoàn thành tất cả món trước!');
      return;
    }

    if (!confirm(`Xác nhận đã hoàn thành đơn ${orderNumber}?`)) return;

    setIsLoading(true);
    try {
      await ordersAPI.markAsReady(orderId);
      toast.success('Đơn đã sẵn sàng!');
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
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

  const getPendingItems = (order: Order) => {
    return order.items.filter(item => !item.isCompleted);
  };

  const isOrderReady = (order: Order) => {
    return order.items.every(item => item.isCompleted);
  };

  // Count total pending items across all orders
  const totalPendingItems = orders.reduce((sum, order) => 
    sum + getPendingItems(order).reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  // Only show orders that have pending items
  const ordersWithPendingItems = orders
    .map(order => ({
      ...order,
      pendingItems: getPendingItems(order)
    }))
    .filter(order => order.pendingItems.length > 0);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-2xl p-4 hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-110 active:scale-95"
      >
        <div className="relative">
          <FireIcon className="h-8 w-8" />
          {totalPendingItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
              {totalPendingItems}
            </span>
          )}
        </div>
      </button>

      {/* Sheet Drawer */}
      <Sheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`☕ Bếp / Bar (${ordersWithPendingItems.length} đơn)`}
      >
        <div className="p-4 space-y-4">
          {ordersWithPendingItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">☕</div>
              <p className="text-lg">Không có đơn nào đang chờ</p>
              <p className="text-sm mt-2">Nghỉ ngơi một chút! ☕</p>
            </div>
          ) : (
            ordersWithPendingItems.map((order) => {
              const allDone = isOrderReady(order);

              return (
                <div
                  key={order.id}
                  className={`rounded-xl overflow-hidden border-2 ${
                    allDone ? 'border-green-500 bg-green-50' : 'border-orange-300 bg-white'
                  } shadow-sm`}
                >
                  {/* Order Header */}
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

                  {/* Items List - ONLY PENDING */}
                  <div className="p-4 space-y-2">
                    {order.pendingItems.map((item) => (
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
                        isLoading={isLoading}
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
                </div>
              );
            })
          )}
        </div>

        <SheetFooter>
          <Button variant="secondary" className="w-full" onClick={() => setIsOpen(false)}>
            <XCircleIcon className="h-5 w-5 mr-2" />
            Đóng
          </Button>
        </SheetFooter>
      </Sheet>

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
                      <p className="font-semibold text-gray-900">{ing.ingredient.name}</p>
                      <p className="text-sm text-gray-600">{ing.quantity} {ing.ingredient.unit}</p>
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
    </>
  );
}
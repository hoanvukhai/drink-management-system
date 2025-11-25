import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI, ordersAPI, tablesAPI, Product, Category, Order, Table } from '../../../lib/api';
import { formatCurrency, getInitials } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Select } from '../../../components/ui/Input';
import toast from 'react-hot-toast';
import {
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftIcon,
  MapPinIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface POSModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null; // null = takeaway
  isTakeaway: boolean;
}

interface CartItem extends Product {
  tempId: string; // Unique ID cho từng món (bao gồm note)
  quantity: number;
  note?: string;
}

export default function POSModal({ isOpen, onClose, tableId, isTakeaway }: POSModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [table, setTable] = useState<Table | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Note modal
  const [noteItemId, setNoteItemId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Takeaway info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Move table
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [allTables, setAllTables] = useState<Table[]>([]);
  const [newTableId, setNewTableId] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, tableId]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);

      // Load table info
      if (!isTakeaway && tableId) {
        const tablesRes = await tablesAPI.getAll();
        setAllTables(tablesRes.data);
        const foundTable = tablesRes.data.find((t) => t.id === tableId);
        setTable(foundTable || null);

        // Load active order
        const orderRes = await ordersAPI.getActiveOrderByTable(tableId);
        if (orderRes.data) {
          setActiveOrder(orderRes.data);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu');
    }
  };

  // Thêm món vào cart
  const addToCart = (product: Product) => {
    const tempId = `${product.id}-${Date.now()}`;
    setCart((prev) => [
      ...prev,
      {
        ...product,
        tempId,
        quantity: 1,
        note: '',
      },
    ]);
    toast.success(`Đã thêm ${product.name}`);
  };

  const updateQuantity = (tempId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.tempId === tempId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (tempId: string) => {
    setCart((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const openNoteModal = (item: CartItem) => {
    setNoteItemId(item.tempId);
    setNoteText(item.note || '');
  };

  const saveNote = () => {
    if (noteItemId) {
      setCart((prev) =>
        prev.map((item) =>
          item.tempId === noteItemId
            ? { ...item, note: noteText.trim() || undefined }
            : item
        )
      );
      setNoteItemId(null);
      setNoteText('');
      toast.success('Đã lưu ghi chú');
    }
  };

  // Gửi món (Tạo mới hoặc gọi thêm)
  const handleSendOrder = async () => {
    if (cart.length === 0) {
      toast.error('Chưa có món nào!');
      return;
    }

    setIsLoading(true);
    try {
      const items = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        note: item.note,
      }));

      if (activeOrder) {
        // Gọi thêm món vào order hiện tại
        await ordersAPI.addItems(activeOrder.id, items);
        toast.success('Đã gọi thêm món!');
      } else {
        // Tạo order mới
        await ordersAPI.create({
          items,
          tableId: isTakeaway ? null : tableId,
          type: isTakeaway ? 'TAKEAWAY' : 'DINE_IN',
          customerName: isTakeaway ? customerName : undefined,
          customerPhone: isTakeaway ? customerPhone : undefined,
        });
        toast.success('Đã tạo đơn hàng!');
      }

      setCart([]);
      await fetchData(); // Reload order
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  // Thanh toán
  const handlePayment = async () => {
    if (!activeOrder) return;

    if (!confirm(`Thanh toán ${formatCurrency(activeOrder.totalAmount)}?`)) return;

    setIsLoading(true);
    try {
      await ordersAPI.complete(activeOrder.id);
      toast.success('Đã thanh toán thành công!');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  // Chuyển bàn
  const handleMoveTable = async () => {
    if (!activeOrder || !newTableId) return;

    try {
      await ordersAPI.moveTable(activeOrder.id, Number(newTableId));
      toast.success('Đã chuyển bàn!');
      setShowMoveModal(false);
      onClose(); // Close modal và refresh
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Không thể chuyển bàn');
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderTotal = activeOrder?.totalAmount || 0;
  const grandTotal = cartTotal + orderTotal;

  const availableTables = allTables.filter(
    (t) => t.status === 'AVAILABLE' || t.id === tableId
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative w-full max-w-7xl bg-white rounded-xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                {isTakeaway ? (
                  <>
                    <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Đơn mang về</h2>
                      {activeOrder && (
                        <p className="text-sm text-gray-600">{activeOrder.orderNumber}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <MapPinIcon className="h-6 w-6 text-indigo-600" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {table?.name || `Bàn ${tableId}`}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {table?.zone?.name} {activeOrder && `• ${activeOrder.orderNumber}`}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeOrder && !isTakeaway && (
                  <Button size="sm" variant="secondary" onClick={() => setShowMoveModal(true)}>
                    🔄 Chuyển bàn
                  </Button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex h-[calc(100vh-200px)]">
              {/* Left: Menu */}
              <div className="flex-1 flex flex-col border-r border-gray-200">
                {/* Category Tabs */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex overflow-x-auto gap-2 scrollbar-hide">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === null
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-200'
                      }`}
                    >
                      Tất cả
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-gray-400">
                              {getInitials(product.name)}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                          {product.name}
                        </p>
                        <p className="text-indigo-600 font-bold text-sm">
                          {formatCurrency(product.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Order Summary */}
              <div className="w-96 flex flex-col bg-gray-50">
                {/* Customer info (takeaway only) */}
                {isTakeaway && !activeOrder && (
                  <div className="px-4 py-3 border-b border-gray-200 bg-white space-y-2">
                    <Input
                      placeholder="Tên khách hàng (tùy chọn)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <Input
                      placeholder="Số điện thoại (tùy chọn)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                )}

                {/* Active Order Items */}
                {activeOrder && (
                  <div className="px-4 py-3 border-b border-gray-200 bg-yellow-50">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">
                      ✓ Đã gọi ({activeOrder.items.length} món)
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {activeOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700">
                            {item.quantity}x {item.product.name}
                            {item.note && ` (${item.note})`}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-yellow-200 flex justify-between text-sm font-bold">
                      <span>Tạm tính:</span>
                      <span className="text-yellow-800">{formatCurrency(orderTotal)}</span>
                    </div>
                  </div>
                )}

                {/* New Cart Items */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <ShoppingBagIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Chưa có món nào</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Món mới ({cart.length})
                      </p>
                      {cart.map((item) => (
                        <div key={item.tempId} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900">{item.name}</p>
                              {item.note && (
                                <p className="text-xs text-indigo-600 mt-0.5">📝 {item.note}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openNoteModal(item)}
                                className="p-1 text-gray-500 hover:text-indigo-600"
                              >
                                <ChatBubbleLeftIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => removeItem(item.tempId)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.tempId, -1)}
                                className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                              >
                                <MinusIcon className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.tempId, 1)}
                                className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </button>
                            </div>
                            <span className="font-bold text-gray-900">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer: Total + Actions */}
                <div className="px-4 py-4 border-t border-gray-200 bg-white space-y-3">
                  <div className="space-y-1">
                    {activeOrder && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Đã gọi:</span>
                        <span>{formatCurrency(orderTotal)}</span>
                      </div>
                    )}
                    {cart.length > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Món mới:</span>
                        <span>{formatCurrency(cartTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold pt-2 border-t">
                      <span>Tổng cộng:</span>
                      <span className="text-indigo-600">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {cart.length > 0 && (
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onClick={handleSendOrder}
                        isLoading={isLoading}
                      >
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        {activeOrder ? 'Gọi thêm món' : 'Gửi thực đơn'}
                      </Button>
                    )}
                    {activeOrder && (
                      <Button
                        variant="success"
                        size="lg"
                        className="w-full"
                        onClick={handlePayment}
                        isLoading={isLoading}
                        disabled={cart.length > 0}
                      >
                        <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                        Thanh toán
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {noteItemId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setNoteItemId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Ghi chú món</h3>
            <Input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="VD: Ít đá, không đường..."
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setNoteItemId(null)}>
                Hủy
              </Button>
              <Button variant="primary" onClick={saveNote}>
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Move Table Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMoveModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Chuyển bàn</h3>
            <p className="text-gray-600 mb-4">
              Chuyển đơn từ <span className="font-semibold">{table?.name}</span> sang:
            </p>
            <Select
              label="Chọn bàn mới"
              value={newTableId}
              onChange={(e) => setNewTableId(e.target.value)}
              options={[
                { value: '', label: '-- Chọn bàn --' },
                ...availableTables
                  .filter((t) => t.id !== tableId)
                  .map((t) => ({
                    value: t.id.toString(),
                    label: `${t.name} (${t.zone?.name || ''})`,
                  })),
              ]}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setShowMoveModal(false)}>
                Hủy
              </Button>
              <Button variant="primary" onClick={handleMoveTable} disabled={!newTableId}>
                Chuyển bàn
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
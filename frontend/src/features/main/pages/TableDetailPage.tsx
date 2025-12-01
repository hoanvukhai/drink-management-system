import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI, ordersAPI, tablesAPI, Product, Category, Table, Order } from '../../../lib/api';
import { formatCurrency, getInitials } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { Sheet, SheetFooter } from '../../../components/ui/Sheet';
import toast from 'react-hot-toast';
import EditOrderItemModal from '../components/EditOrderItemModal';
import {
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ShoppingCartIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

interface CartItem extends Product {
  tempId: string;
  quantity: number;
  note?: string;
}

export default function TableDetailPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [table, setTable] = useState<Table | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 👇 NEW: Mobile cart state
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Note modal
  const [noteItemId, setNoteItemId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  
  // Edit modal
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  // Move table
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [allTables, setAllTables] = useState<Table[]>([]);
  const [newTableId, setNewTableId] = useState('');

  useEffect(() => {
    fetchData();
  }, [tableId]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, tablesRes] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
        tablesAPI.getAll(),
      ]);
      
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setAllTables(tablesRes.data);
      
      const foundTable = tablesRes.data.find((t) => t.id === Number(tableId));
      setTable(foundTable || null);
      
      if (tableId) {
        try {
          const orderRes = await ordersAPI.getActiveOrderByTable(Number(tableId));
          if (orderRes.data) {
            setActiveOrder(orderRes.data);
          }
        } catch (error) {
          console.log('No active order');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu');
    }
  };

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

  // ✅ FIXED: Send order with proper reload
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
        // ✅ Gọi thêm món
        await ordersAPI.addItems(activeOrder.id, items);
        toast.success('Đã gọi thêm món!');
      } else {
        // ✅ Tạo order mới
        await ordersAPI.create({
          items,
          tableId: Number(tableId),
          type: 'DINE_IN',
        });
        toast.success('Đã tạo đơn hàng!');
      }

      // ✅ CRITICAL: Clear cart & reload
      setCart([]);
      await fetchData();
      setIsCartOpen(false); // Close mobile cart
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditExistingItem = (item: any) => {
    setEditingItem(item);
  };

  const handleSaveEdit = async (action: string, data: any, reason: string) => {
    if (!editingItem || !activeOrder) return;

    try {
      await ordersAPI.editItem(activeOrder.id, editingItem.id, {
        action,
        ...data,
        reason,
      });

      toast.success(
        action === 'DELETE'
          ? 'Đã xóa món'
          : action === 'UPDATE_QUANTITY'
          ? 'Đã cập nhật số lượng'
          : 'Đã cập nhật ghi chú'
      );

      await fetchData();
      setEditingItem(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handlePayment = async () => {
    if (!activeOrder) return;
    if (!confirm(`Thanh toán ${formatCurrency(activeOrder.totalAmount)}?`)) return;

    setIsLoading(true);
    try {
      await ordersAPI.complete(activeOrder.id);
      toast.success('Đã thanh toán thành công!');
      navigate('/main');
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveTable = async () => {
    if (!activeOrder || !newTableId) return;

    try {
      await ordersAPI.moveTable(activeOrder.id, Number(newTableId));
      toast.success('Đã chuyển bàn!');
      setShowMoveModal(false);
      navigate(`/table/${newTableId}`);
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
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const availableTables = allTables.filter(
    (t) => t.status === 'AVAILABLE' || t.id === Number(tableId)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/main')}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-6 w-6 text-indigo-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {table?.name || `Bàn ${tableId}`}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {table?.zone?.name} {activeOrder && `• ${activeOrder.orderNumber}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeOrder && (
                <Button size="sm" variant="secondary" onClick={() => setShowMoveModal(true)}>
                  🔄 Chuyển bàn
                </Button>
              )}
              <div className="text-right hidden md:block">
                <p className="text-sm text-gray-600">Tổng cộng</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(grandTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6 lg:pr-96">
        {/* Category Tabs */}
        <div className="mb-6">
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 pb-20 lg:pb-0">
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

      {/* 🎯 Floating Cart Button - Mobile */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-indigo-600 text-white rounded-full shadow-2xl p-4 flex items-center gap-3 hover:bg-indigo-700 transition-all transform active:scale-95"
      >
        <ShoppingCartIcon className="h-6 w-6" />
        {(cartItemCount > 0 || activeOrder) && (
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium">
              {cartItemCount + (activeOrder?.items.reduce((s, i) => s + i.quantity, 0) || 0)} món
            </span>
            <span className="text-sm font-bold">{formatCurrency(grandTotal)}</span>
          </div>
        )}
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
            {cartItemCount}
          </span>
        )}
      </button>

      {/* 🎯 Cart Sheet - Mobile */}
      <Sheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="Đơn hàng">
        <div className="space-y-4">
          {/* Active Order */}
          {activeOrder && (
            <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-200">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                ✓ Đã gọi ({activeOrder.items.length} món)
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {activeOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-white rounded p-2">
                    <div className="flex-1">
                      <span className="text-gray-700">
                        {item.quantity}x {item.product.name}
                        {item.note && ` (${item.note})`}
                      </span>
                      {item.isServed && <span className="ml-2 text-green-600">✓</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                      <button
                        onClick={() => handleEditExistingItem(item)}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-yellow-200 flex justify-between text-sm font-bold">
                <span>Tạm tính:</span>
                <span className="text-yellow-800">{formatCurrency(orderTotal)}</span>
              </div>
            </div>
          )}

          {/* New Cart */}
          <div className="px-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCartIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Chưa có món mới</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-700">Món mới ({cart.length})</p>
                {cart.map((item) => (
                  <div key={item.tempId} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        {item.note && <p className="text-xs text-indigo-600 mt-1">📝 {item.note}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openNoteModal(item)} className="p-1 text-gray-500">
                          <ChatBubbleLeftIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => removeItem(item.tempId)} className="p-1 text-red-600">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.tempId, -1)} className="p-1 bg-white rounded border">
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.tempId, 1)} className="p-1 bg-white rounded border">
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <SheetFooter className="flex-col gap-3">
          <div className="flex justify-between w-full text-xl font-bold border-t pt-3">
            <span>Tổng cộng:</span>
            <span className="text-indigo-600">{formatCurrency(grandTotal)}</span>
          </div>
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
        </SheetFooter>
      </Sheet>

      {/* Cart Sidebar - Desktop */}
      <div className="hidden lg:block fixed right-0 top-0 w-96 h-screen bg-white border-l border-gray-200 shadow-xl z-30">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCartIcon className="h-6 w-6" />
              Đơn hàng
            </h2>
          </div>

          {activeOrder && (
            <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50 max-h-64 overflow-y-auto">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                ✓ Đã gọi ({activeOrder.items.length} món)
              </p>
              <div className="space-y-2">
                {activeOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-white rounded p-2">
                    <div className="flex-1">
                      <span className="text-gray-700">
                        {item.quantity}x {item.product.name}
                        {item.note && ` (${item.note})`}
                      </span>
                      {item.isServed && <span className="ml-2 text-green-600">✓</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                      <button
                        onClick={() => handleEditExistingItem(item)}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-yellow-200 flex justify-between text-sm font-bold">
                <span>Tạm tính:</span>
                <span className="text-yellow-800">{formatCurrency(orderTotal)}</span>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCartIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Chưa có món mới</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Món mới ({cart.length})</p>
                {cart.map((item) => (
                  <div key={item.tempId} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        {item.note && <p className="text-xs text-indigo-600 mt-1">📝 {item.note}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openNoteModal(item)} className="p-1 text-gray-500">
                          <ChatBubbleLeftIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => removeItem(item.tempId)} className="p-1 text-red-600">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.tempId, -1)} className="p-1 bg-white rounded border">
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.tempId, 1)} className="p-1 bg-white rounded border">
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 space-y-3">
            <div className="flex justify-between text-xl font-bold">
              <span>Tổng cộng:</span>
              <span className="text-indigo-600">{formatCurrency(grandTotal)}</span>
            </div>
            {cart.length > 0 && (
              <Button variant="primary" size="lg" className="w-full" onClick={handleSendOrder} isLoading={isLoading}>
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

      {/* Note Modal */}
      {noteItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              <Button variant="secondary" onClick={() => setNoteItemId(null)}>Hủy</Button>
              <Button variant="primary" onClick={saveNote}>Lưu</Button>
            </div>
          </div>
        </div>
      )}

      <EditOrderItemModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />

      {showMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                  .filter((t) => t.id !== Number(tableId))
                  .map((t) => ({
                    value: t.id.toString(),
                    label: `${t.name} (${t.zone?.name || ''})`,
                  })),
              ]}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setShowMoveModal(false)}>Hủy</Button>
              <Button variant="primary" onClick={handleMoveTable} disabled={!newTableId}>Chuyển bàn</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
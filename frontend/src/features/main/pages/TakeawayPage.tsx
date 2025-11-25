// frontend/src/features/main/pages/TakeawayPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI, ordersAPI, Product, Category } from '../../../lib/api';
import { formatCurrency, getInitials } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import toast from 'react-hot-toast';
import {
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';

interface CartItem extends Product {
  tempId: string;
  quantity: number;
  note?: string;
}

export default function TakeawayPage() {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Note modal
  const [noteItemId, setNoteItemId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
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

  const handleCreateOrder = async () => {
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

      await ordersAPI.create({
        items,
        tableId: null,
        type: 'TAKEAWAY',
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
      });

      toast.success('Đã tạo đơn mang về!');
      navigate('/main');
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Đơn mang về</h1>
                  <p className="text-sm text-gray-600">Takeaway</p>
                </div>
              </div>
            </div>

            <div className="text-right hidden md:block">
              <p className="text-sm text-gray-600">Tổng cộng</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(total)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6 lg:pr-96">
        {/* Customer Info */}
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng (tùy chọn)</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Tên khách hàng"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              placeholder="Số điện thoại"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6">
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
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
              <p className="text-blue-600 font-bold text-sm">
                {formatCurrency(product.price)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Sidebar - Desktop */}
      <div className="hidden lg:block fixed right-0 top-0 w-96 h-screen bg-white border-l border-gray-200 shadow-xl z-30">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCartIcon className="h-6 w-6" />
              Giỏ hàng
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCartIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Chưa có món nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.tempId} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900">{item.name}</p>
                        {item.note && (
                          <p className="text-xs text-blue-600 mt-0.5">📝 {item.note}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openNoteModal(item)}
                          className="p-1 text-gray-500 hover:text-blue-600"
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
                          className="p-1 rounded bg-white hover:bg-gray-200"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.tempId, 1)}
                          className="p-1 rounded bg-white hover:bg-gray-200"
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

          <div className="px-6 py-4 border-t border-gray-200 space-y-3">
            <div className="flex justify-between text-xl font-bold">
              <span>Tổng cộng:</span>
              <span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleCreateOrder}
              isLoading={isLoading}
              disabled={cart.length === 0}
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Tạo đơn mang về
            </Button>
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
    </div>
  );
}
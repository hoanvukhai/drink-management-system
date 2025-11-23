// frontend/src/features/pos/pages/POSPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI, ordersAPI, tablesAPI, Product, Category, Table } from '../../../lib/api';
import { formatCurrency, getInitials } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Sheet, SheetFooter } from '../../../components/ui/Sheet';
import { Input } from '../../../components/ui/Input';
import toast from 'react-hot-toast';
import {
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  XMarkIcon,
  ArrowLeftIcon,
  MapPinIcon,
  ShoppingBagIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';

interface CartItem extends Product {
  quantity: number;
  note?: string;
}

export default function POSPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [table, setTable] = useState<Table | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Note modal
  const [noteItemId, setNoteItemId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  const isTakeaway = tableId === 'takeaway';

  useEffect(() => {
    fetchData();
  }, [tableId]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);

      // Fetch table info if not takeaway
      if (!isTakeaway && tableId) {
        const tablesRes = await tablesAPI.getAll();
        const foundTable = tablesRes.data.find((t) => t.id === Number(tableId));
        setTable(foundTable || null);
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu menu');
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`Đã thêm ${product.name}`);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Đã xóa giỏ hàng');
  };

  const openNoteModal = (item: CartItem) => {
    setNoteItemId(item.id);
    setNoteText(item.note || '');
  };

  const saveNote = () => {
    if (noteItemId) {
      setCart((prev) =>
        prev.map((item) => (item.id === noteItemId ? { ...item, note: noteText.trim() || undefined } : item))
      );
      setNoteItemId(null);
      setNoteText('');
      toast.success('Đã lưu ghi chú');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống!');
      return;
    }

    setIsLoading(true);
    try {
      await ordersAPI.create({
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          note: item.note,
        })),
        tableId: isTakeaway ? null : Number(tableId),
      });

      // Update table status to OCCUPIED if not takeaway
      if (!isTakeaway && tableId) {
        await tablesAPI.updateStatus(Number(tableId), 'OCCUPIED');
      }

      toast.success('Tạo đơn hàng thành công!');
      setCart([]);
      setIsCartOpen(false);
      
      // Navigate back to table page
      navigate('/tables');
    } catch (error) {
      console.error(error);
      toast.error('Tạo đơn hàng thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/tables')}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              {isTakeaway ? (
                <>
                  <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Mang về</h1>
                    <p className="text-xs text-gray-500">Takeaway</p>
                  </div>
                </>
              ) : (
                <>
                  <MapPinIcon className="h-6 w-6 text-indigo-600" />
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">{table?.name || `Bàn ${tableId}`}</h1>
                    <p className="text-xs text-gray-500">{table?.zone?.name || 'Đang tải...'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Desktop cart summary */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">{itemCount} món</p>
              <p className="text-lg font-bold text-indigo-600">{formatCurrency(total)}</p>
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
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
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
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 pb-24 lg:pb-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              padding="none"
              hover
              className="overflow-hidden cursor-pointer group relative"
              onClick={() => addToCart(product)}
            >
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-3xl font-bold text-gray-400">{getInitials(product.name)}</div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
                <p className="text-indigo-600 font-bold text-sm">{formatCurrency(product.price)}</p>
              </div>
              <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Cart Button - Mobile */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-indigo-600 text-white rounded-full shadow-lg p-4 flex items-center gap-2 hover:bg-indigo-700 transition-colors"
      >
        <ShoppingCartIcon className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="bg-white text-indigo-600 rounded-full px-2 py-0.5 text-sm font-bold">{itemCount}</span>
        )}
      </button>

      {/* Cart Sheet - Mobile */}
      <Sheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="Giỏ hàng">
        <div className="p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <ShoppingCartIcon className="h-16 w-16 mx-auto mb-3 text-gray-300" />
              <p>Giỏ hàng trống</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                    {item.note && (
                      <p className="text-xs text-indigo-600 mt-1 italic">📝 {item.note}</p>
                    )}
                  </div>
                  <button onClick={() => openNoteModal(item)} className="p-1 text-gray-500 hover:text-indigo-600">
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-md bg-white border hover:bg-gray-50">
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-md bg-white border hover:bg-gray-50">
                      <PlusIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="p-1 rounded-md text-red-600 hover:bg-red-50">
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <SheetFooter className="flex-col gap-3">
          <div className="flex justify-between items-center w-full text-lg font-bold">
            <span>Tổng cộng:</span>
            <span className="text-indigo-600">{formatCurrency(total)}</span>
          </div>
          <div className="flex gap-2 w-full">
            <Button variant="secondary" onClick={clearCart} className="flex-1">
              <TrashIcon className="h-5 w-5" />
            </Button>
            <Button variant="primary" onClick={handleCheckout} isLoading={isLoading} disabled={cart.length === 0} className="flex-[2]">
              Thanh toán
            </Button>
          </div>
        </SheetFooter>
      </Sheet>

      {/* Cart Sidebar - Desktop */}
      <div className="hidden lg:block fixed right-0 top-0 w-96 h-screen bg-white border-l border-gray-200 shadow-xl z-30">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Đơn hàng</h2>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingCartIcon className="h-20 w-20 mb-4 text-gray-300" />
                <p className="text-lg">Giỏ hàng trống</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                      {item.note && (
                        <p className="text-xs text-indigo-600 mt-1 italic">📝 {item.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openNoteModal(item)} className="p-1 text-gray-500 hover:text-indigo-600 rounded">
                        <ChatBubbleLeftIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-2 rounded-md bg-white border hover:bg-gray-50">
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-2 rounded-md bg-white border hover:bg-gray-50">
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-gray-200 space-y-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Tổng cộng:</span>
              <span className="text-indigo-600">{formatCurrency(total)}</span>
            </div>
            <Button variant="primary" size="lg" onClick={handleCheckout} isLoading={isLoading} disabled={cart.length === 0} className="w-full">
              Thanh toán ({itemCount} món)
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
              placeholder="VD: Ít đá, không đường, ít ngọt..."
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setNoteItemId(null)}>Hủy</Button>
              <Button variant="primary" onClick={saveNote}>Lưu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
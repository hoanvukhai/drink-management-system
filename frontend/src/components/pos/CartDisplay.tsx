// File: src/components/pos/CartDisplay.tsx
import type { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import { ShoppingCartIcon, TrashIcon, PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';

// Định nghĩa Types (Nhận từ cha)
interface Product {
  id: number;
  name: string;
  price: number;
}
interface CartItem extends Product {
  quantity: number;
}
type CartDisplayProps = {
  cart: CartItem[];
  isLoading: boolean;
  onSubmitOrder: () => void;
  onClearCart: () => void; // Hàm mới để xóa giỏ hàng
  onIncrease?: (id: number) => void;
  onDecrease?: (id: number) => void;
  onRemove?: (id: number) => void;
};

export function CartDisplay({
  cart,
  isLoading,
  onSubmitOrder,
  onClearCart,
  onIncrease,
  onDecrease,
  onRemove,
}: Readonly<CartDisplayProps>): ReactElement {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // close sheet on escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsSheetOpen(false);
    }
    globalThis.addEventListener('keydown', onKey);
    return () => globalThis.removeEventListener('keydown', onKey);
  }, []);

  // Logic tính tổng tiền (nằm nội bộ trong component này)
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  const total = calculateTotal();
  return (
    <>
      {/* Desktop / large screens: original card (visible at lg and up) */}
      <div className="hidden lg:block bg-white shadow-lg rounded-lg lg:sticky lg:top-20 w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold">Giỏ hàng</h2>
          <button
            onClick={onClearCart}
            disabled={cart.length === 0}
            className="text-sm text-red-500 hover:text-red-700 disabled:text-gray-400"
          >
            <TrashIcon className="h-5 w-5 inline mr-1" />
            Xóa
          </button>
        </div>

        <div className="p-4 flex-grow overflow-y-auto h-64 lg:h-auto lg:max-h-96">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCartIcon className="h-16 w-16" />
              <p>Giỏ hàng của bạn đang trống.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded">
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.price.toLocaleString()} đ</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button aria-label="decrease" onClick={() => onDecrease?.(item.id)} className="p-1 rounded-md text-gray-600 hover:bg-gray-100">
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <div className="px-3 py-1 border rounded-md">{item.quantity}</div>
                    <button aria-label="increase" onClick={() => onIncrease?.(item.id)} className="p-1 rounded-md text-gray-600 hover:bg-gray-100">
                      <PlusIcon className="h-4 w-4" />
                    </button>
                    <button aria-label="remove" onClick={() => onRemove?.(item.id)} className="p-1 rounded-md text-red-600 hover:bg-red-50">
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="flex justify-between text-xl font-bold mb-4">
            <span>Tổng tiền:</span>
            <span>{total.toLocaleString()} đ</span>
          </div>
          <Button
            onClick={onSubmitOrder}
            disabled={isLoading || cart.length === 0}
            variant="primary"
            className="w-full"
          >
            {isLoading ? 'Đang xử lý...' : 'Tạo Đơn Hàng'}
          </Button>
        </div>
      </div>

      {/* Mobile: floating button + bottom-sheet */}
      <div className="lg:hidden">
        {/* Floating mini button to open sheet */}
        <div className="fixed bottom-6 right-4 z-50">
          <button
            onClick={() => setIsSheetOpen(true)}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-3 py-2 rounded-full shadow-lg"
            aria-label="Open cart"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span className="font-medium">{cart.length}</span>
          </button>
        </div>

        {/* Sheet */}
        <div className={`fixed inset-x-0 bottom-0 z-40 transition-transform ${isSheetOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-t-xl shadow-xl overflow-hidden" style={{ maxHeight: '80vh' }}>
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="text-lg font-semibold">Giỏ hàng</h3>
                <div className="flex items-center space-x-2">
                  <button onClick={() => { onClearCart(); }} className="text-sm text-red-500 hover:text-red-700">
                    <TrashIcon className="h-5 w-5 inline" />
                  </button>
                  <button onClick={() => setIsSheetOpen(false)} aria-label="Close cart" className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                    <ShoppingCartIcon className="h-12 w-12" />
                    <p>Giỏ hàng của bạn đang trống.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded">
                        <div className="flex-1">
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.price.toLocaleString()} đ</div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button aria-label="decrease" onClick={() => onDecrease?.(item.id)} className="p-1 rounded-md text-gray-600 hover:bg-gray-100">
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <div className="px-3 py-1 border rounded-md">{item.quantity}</div>
                          <button aria-label="increase" onClick={() => onIncrease?.(item.id)} className="p-1 rounded-md text-gray-600 hover:bg-gray-100">
                            <PlusIcon className="h-4 w-4" />
                          </button>
                          <button aria-label="remove" onClick={() => onRemove?.(item.id)} className="p-1 rounded-md text-red-600 hover:bg-red-50">
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t p-4">
                <div className="flex justify-between text-lg font-bold mb-3">
                  <span>Tổng tiền:</span>
                  <span>{total.toLocaleString()} đ</span>
                </div>
                <Button onClick={() => { onSubmitOrder(); setIsSheetOpen(false); }} disabled={isLoading || cart.length === 0} variant="primary" className="w-full">
                  {isLoading ? 'Đang xử lý...' : 'Tạo Đơn Hàng'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
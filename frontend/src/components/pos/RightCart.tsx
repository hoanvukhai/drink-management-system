import type { ReactElement } from 'react';
import React, { useState, useEffect } from 'react';
import { ShoppingCartIcon, TrashIcon, PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

interface Product {
  id: number;
  name: string;
  price: number;
}
interface CartItem extends Product {
  quantity: number;
}

type RightCartProps = Readonly<{
  cart: CartItem[];
  isLoading: boolean;
  onSubmitOrder: () => void;
  onClearCart: () => void;
  onIncrease?: (id: number) => void;
  onDecrease?: (id: number) => void;
  onRemove?: (id: number) => void;
}>;

export function RightCart({ cart, isLoading, onSubmitOrder, onClearCart, onIncrease, onDecrease, onRemove }: RightCartProps): ReactElement {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsSheetOpen(false);
    }
    globalThis.addEventListener('keydown', onKey);
    return () => globalThis.removeEventListener('keydown', onKey);
  }, []);

  const total = cart.reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <>
      {/* Desktop / large screens: right vertical panel (fixed to viewport like left sidebar) */}
      <aside className="hidden lg:flex flex-col w-80 h-screen fixed right-0 top-0 bg-white shadow-inner z-40">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Đơn hàng</h3>
          <button onClick={onClearCart} className="text-red-500 hover:text-red-700 p-1 rounded">
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center text-gray-500 py-12">
              <ShoppingCartIcon className="h-12 w-12" />
              <p className="mt-2">Giỏ hàng của bạn đang trống.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-white border rounded">
                <div className="flex-1 pr-2">
                  <div className="font-medium text-gray-800 truncate">{item.name}</div>
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
            ))
          )}
        </div>

        <div className="border-t p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-medium">Tổng tiền:</div>
            <div className="text-lg font-bold">{total.toLocaleString()} đ</div>
          </div>
          <Button onClick={onSubmitOrder} disabled={isLoading || cart.length === 0} variant="primary" className="w-full">
            {isLoading ? 'Đang xử lý...' : 'Tạo Đơn Hàng'}
          </Button>
        </div>
      </aside>

      {/* Mobile: floating button + sheet (for small screens) */}
      <div className="lg:hidden">
        <div className="fixed bottom-6 right-4 z-50">
          <button onClick={() => setIsSheetOpen(true)} className="flex items-center space-x-2 bg-indigo-600 text-white px-3 py-2 rounded-full shadow-lg" aria-label="Open order">
            <ShoppingCartIcon className="h-5 w-5" />
            <span>{cart.length}</span>
          </button>
        </div>

        <div className={`fixed inset-x-0 bottom-0 z-40 transition-transform ${isSheetOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="bg-white rounded-t-xl shadow-lg overflow-hidden" style={{ maxHeight: '80vh' }}>
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="text-lg font-semibold">Đơn hàng</h3>
              <div className="flex items-center space-x-2">
                <button onClick={() => onClearCart()} className="text-red-500 p-1 rounded"><TrashIcon className="h-5 w-5" /></button>
                <button onClick={() => setIsSheetOpen(false)} className="p-2 rounded text-gray-600"><XMarkIcon className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center text-gray-500 py-8">
                  <ShoppingCartIcon className="h-12 w-12" />
                  <p className="mt-2">Giỏ hàng của bạn đang trống.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-white border rounded">
                      <div className="flex-1 pr-2">
                        <div className="font-medium truncate">{item.name}</div>
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
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-medium">Tổng tiền:</div>
                <div className="text-lg font-bold">{total.toLocaleString()} đ</div>
              </div>
              <Button onClick={() => { onSubmitOrder(); setIsSheetOpen(false); }} disabled={isLoading || cart.length === 0} variant="primary" className="w-full">
                {isLoading ? 'Đang xử lý...' : 'Tạo Đơn Hàng'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RightCart;

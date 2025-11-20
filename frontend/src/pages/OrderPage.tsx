// File: src/pages/OrderPage.tsx
import React, { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MenuDisplay } from '../components/pos/MenuDisplay';
import RightCart from '../components/pos/RightCart';

// API client
const apiClient = axios.create({ baseURL: 'http://localhost:3000' });

// Types
interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
}
interface Category {
  id: number;
  name: string;
}
interface CartItem extends Product {
  quantity: number;
}

export function OrderPage(): ReactElement {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get('/products'),
        apiClient.get('/categories'),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to fetch menu', error);
      toast.error('Tải menu thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((p) => p.id === product.id);
      if (existing) return prevCart.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleIncrease = (id: number) => setCart((prev) => prev.map((it) => (it.id === id ? { ...it, quantity: it.quantity + 1 } : it)));
  const handleDecrease = (id: number) => setCart((prev) => prev.map((it) => (it.id === id ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it)));
  const handleRemove = (id: number) => setCart((prev) => prev.filter((it) => it.id !== id));

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống!');
      return;
    }
    setIsLoading(true);
    const loading = toast.loading('Đang xử lý đơn hàng...');
    try {
      const orderData = { items: cart.map((c) => ({ productId: c.id, quantity: c.quantity })) };
      await apiClient.post('/orders', orderData);
      toast.success('Tạo đơn hàng thành công!');
      setCart([]);
    } catch (error) {
      console.error('Failed to create order', error);
      toast.error('Tạo đơn hàng thất bại!');
    } finally {
      toast.dismiss(loading);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Trang Bán Hàng (POS)</h1>

      {/* Responsive layout: single column for small screens; at lg show menu + right cart */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Main content: stretch to fill available space between sidebar and cart. Reserve right padding for fixed cart on lg */}
        <main className="flex-1 min-w-0 pr-4 lg:pr-80">
          <div className="w-full">
            <MenuDisplay categories={categories} products={products} onAddToCart={handleAddToCart} />
          </div>
        </main>

        {/* Right-side cart: vertical panel on desktop, bottom-sheet on mobile */}
        <RightCart
          cart={cart}
          isLoading={isLoading}
          onSubmitOrder={handleSubmitOrder}
          onClearCart={() => setCart([])}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
          onRemove={handleRemove}
        />
      </div>
    </div>
  );
}

export default OrderPage;
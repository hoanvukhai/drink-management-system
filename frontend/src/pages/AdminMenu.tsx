// src/pages/AdminMenu.tsx (CODE HOÀN CHỈNH ĐỂ THAY THẾ)

// src/pages/AdminMenu.tsx — rewritten clean layout
import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import axios from 'axios';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { CategoryForm } from '../components/admin/CategoryForm';
import { ProductForm } from '../components/admin/ProductForm';
import type { ProductFormData } from '../components/admin/ProductForm';
import { ProductList } from '../components/admin/ProductList';
import type { Product } from '../components/admin/ProductList';
import type { Category } from '../components/admin/CategoryList';
import RightCategoryPanel from '../components/admin/RightCategoryPanel';

// apiClient
const apiClient = axios.create({ baseURL: 'http://localhost:3000' });

export function AdminMenu(): ReactElement {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get('/products'),
        apiClient.get('/categories'),
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setIsLoading(false);
    }
  }

  // --- Category handlers ---
  async function handleCategoryCreate(name: string) {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      await apiClient.post('/categories', { name }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      await fetchData();
      setShowCategoryModal(false);
    } catch (err) {
      console.error(err);
      alert('Thêm danh mục thất bại!');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCategoryUpdate(name: string) {
    if (!editingCategory) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      await apiClient.patch(`/categories/${editingCategory.id}`, { name }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      await fetchData();
      setEditingCategory(null);
      setShowCategoryModal(false);
    } catch (err) {
      console.error(err);
      alert('Cập nhật danh mục thất bại!');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCategoryDelete(id: number) {
    if (!globalThis.confirm('Xóa danh mục này cũng có thể xóa các sản phẩm bên trong. Bạn có chắc?')) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      await apiClient.delete(`/categories/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Xóa danh mục thất bại!');
    } finally {
      setIsLoading(false);
    }
  }

  function handleCategoryEditClick(category: Category) {
    setEditingCategory(category);
    setShowCategoryModal(true);
  }

  function handleCategorySelect(category: Category) {
    if (category.id === -1) return setSelectedCategoryId(null);
    setSelectedCategoryId((prev) => (prev === category.id ? null : category.id));
  }

  // --- Product handlers ---
  async function handleProductCreate(data: ProductFormData) {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      await apiClient.post('/products', data, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      await fetchData();
      setShowProductModal(false);
    } catch (err) {
      console.error(err);
      alert('Thêm sản phẩm thất bại!');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleProductUpdate(data: ProductFormData) {
    if (!editingProduct) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      await apiClient.patch(`/products/${editingProduct.id}`, data, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      await fetchData();
      setEditingProduct(null);
      setShowProductModal(false);
    } catch (err) {
      console.error(err);
      alert('Cập nhật sản phẩm thất bại!');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleProductDelete(id: number) {
    if (!globalThis.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      await apiClient.delete(`/products/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Xóa sản phẩm thất bại!');
    } finally {
      setIsLoading(false);
    }
  }

  function handleEditClick(product: Product) {
    setEditingProduct(product);
    setShowProductModal(true);
  }

  // --- RENDER ---
  return (
    <div className="w-full max-w-none p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Quản lý Menu</h1>

      <div className="flex gap-6">
        {/* Main product area — flex-1 so it expands to fill the space */}
        <div className="flex-1 min-w-0 space-y-6">
          <div className="overflow-x-auto w-full min-w-0">
            <ProductList
              products={selectedCategoryId ? products.filter((p) => p.categoryId === selectedCategoryId) : products}
              onEdit={handleEditClick}
              onDelete={handleProductDelete}
              onAdd={() => { setEditingProduct(null); setShowProductModal(true); }}
            />
          </div>
        </div>

        {/* Desktop spacer to reserve space for the fixed right panel so the flex area can expand correctly */}
        <div className="hidden lg:block w-80" aria-hidden />

        {/* Mobile floating open for categories */}
        <button
          onClick={() => setShowCategoryPicker(true)}
          className="lg:hidden fixed bottom-4 right-4 z-50 bg-indigo-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
          aria-label="Mở danh mục"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
      </div>

      {/* Right-side panel component is fixed; render outside of the flex row so it doesn't participate in layout */}
      <RightCategoryPanel
        categories={categories}
        onEdit={handleCategoryEditClick}
        onDelete={handleCategoryDelete}
        onSelect={handleCategorySelect}
        onAdd={() => { setEditingCategory(null); setShowCategoryModal(true); }}
      />

      {/* Product modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowProductModal(false)} />
          <div className="relative w-full max-w-lg mx-4">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <ProductForm
                categories={categories}
                onSubmit={editingProduct ? async (d) => { await handleProductUpdate(d); } : async (d) => { await handleProductCreate(d); }}
                isLoading={isLoading}
                productToEdit={editingProduct}
                onCancel={() => { setEditingProduct(null); setShowProductModal(false); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Category modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCategoryModal(false)} />
          <div className="relative w-full max-w-md mx-4">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <CategoryForm
                onSubmit={async (name) => {
                  if (editingCategory) await handleCategoryUpdate(name);
                  else await handleCategoryCreate(name);
                }}
                isLoading={isLoading}
                categoryToEdit={editingCategory}
                onCancel={() => { setEditingCategory(null); setShowCategoryModal(false); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Category picker modal (mobile) */}
      {showCategoryPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCategoryPicker(false)} />
          <div className="relative w-full max-w-md mx-4">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Chọn danh mục</h3>
              <div className="space-y-2">
                <button onClick={() => { setSelectedCategoryId(null); setShowCategoryPicker(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100">Tất cả</button>
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => { setSelectedCategoryId(cat.id); setShowCategoryPicker(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100">{cat.name}</button>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button onClick={() => { setEditingCategory(null); setShowCategoryPicker(false); setShowCategoryModal(true); }} className="px-3 py-1 rounded bg-indigo-600 text-white">+ Thêm danh mục</button>
                <button onClick={() => setShowCategoryPicker(false)} className="px-3 py-1 rounded bg-gray-200">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
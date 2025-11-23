// frontend/src/features/menu/pages/MenuManagementPage.tsx
import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI, Product, Category } from '../../../lib/api';
import { formatCurrency, getInitials } from '../../../lib/utils';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Input, Select } from '../../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

type ModalMode = 'product' | 'category' | null;
type EditingItem = Product | Category | null;

export default function MenuManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingItem, setEditingItem] = useState<EditingItem>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [categoryName, setCategoryName] = useState('');

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

  // Helper function to check if item is Product
  const isProduct = (item: EditingItem): item is Product => {
    return item !== null && 'price' in item;
  };

  // === PRODUCT HANDLERS ===
  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingItem(product);
      setProductName(product.name);
      setProductPrice(product.price.toString());
      setProductCategoryId(product.categoryId.toString());
      setProductImageUrl(product.imageUrl || '');
    } else {
      setEditingItem(null);
      setProductName('');
      setProductPrice('');
      setProductCategoryId(categories[0]?.id.toString() || '');
      setProductImageUrl('');
    }
    setModalMode('product');
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        name: productName,
        price: parseFloat(productPrice),
        categoryId: parseInt(productCategoryId),
        imageUrl: productImageUrl || null,
      };

      if (isProduct(editingItem)) {
        await productsAPI.update(editingItem.id, data);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await productsAPI.create(data);
        toast.success('Thêm sản phẩm thành công');
      }

      await fetchData();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return;

    try {
      await productsAPI.delete(id);
      toast.success('Xóa sản phẩm thành công');
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Xóa sản phẩm thất bại');
    }
  };

  // === CATEGORY HANDLERS ===
  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingItem(category);
      setCategoryName(category.name);
    } else {
      setEditingItem(null);
      setCategoryName('');
    }
    setModalMode('category');
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingItem && !isProduct(editingItem)) {
        await categoriesAPI.update(editingItem.id, categoryName);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await categoriesAPI.create(categoryName);
        toast.success('Thêm danh mục thành công');
      }

      await fetchData();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Xóa danh mục "${name}"?`)) return;

    try {
      await categoriesAPI.delete(id);
      toast.success('Xóa danh mục thành công');
      await fetchData();
      if (selectedCategory === id) setSelectedCategory(null);
    } catch (error) {
      console.error(error);
      toast.error('Xóa danh mục thất bại');
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingItem(null);
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  const categoryOptions = categories.map((c) => ({ value: c.id.toString(), label: c.name }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        <div className="page-header">
          <h1 className="page-title">Quản lý Menu</h1>
          <p className="text-gray-600 mt-2">Quản lý danh mục và sản phẩm</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card padding="none">
              <CardHeader
                title="Danh mục"
                action={
                  <Button size="sm" variant="primary" onClick={() => openCategoryModal()}>
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                }
              />
              <div className="divide-y divide-gray-200">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full px-6 py-3 text-left transition-colors flex items-center justify-between ${
                    selectedCategory === null
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FolderIcon className="h-5 w-5" />
                    Tất cả
                  </span>
                  <Badge variant="neutral">{products.length}</Badge>
                </button>

                {categories.map((category) => {
                  const count = products.filter((p) => p.categoryId === category.id).length;
                  return (
                    <div
                      key={category.id}
                      className={`flex items-center justify-between px-6 py-3 group ${
                        selectedCategory === category.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex-1 text-left flex items-center justify-between ${
                          selectedCategory === category.id
                            ? 'text-indigo-700 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <FolderIcon className="h-5 w-5" />
                          {category.name}
                        </span>
                        <Badge variant="neutral">{count}</Badge>
                      </button>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button
                          onClick={() => openCategoryModal(category)}
                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Products Table */}
          <div className="lg:col-span-3">
            <Card padding="none">
              <CardHeader
                title={
                  selectedCategory
                    ? `Sản phẩm - ${categories.find((c) => c.id === selectedCategory)?.name}`
                    : 'Tất cả sản phẩm'
                }
                subtitle={`${filteredProducts.length} sản phẩm`}
                action={
                  <Button variant="primary" onClick={() => openProductModal()} leftIcon={<PlusIcon className="h-5 w-5" />}>
                    Thêm sản phẩm
                  </Button>
                }
              />

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hình ảnh</TableHead>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableEmpty message="Chưa có sản phẩm nào" icon={<PhotoIcon className="h-12 w-12 text-gray-300" />} />
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-medium text-gray-400">{getInitials(product.name)}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{product.name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="primary">
                            {categories.find((c) => c.id === product.categoryId)?.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-indigo-600">{formatCurrency(product.price)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openProductModal(product)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id, product.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <Modal isOpen={modalMode === 'product'} onClose={closeModal} title={isProduct(editingItem) ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} size="md">
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <Input label="Tên sản phẩm" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="VD: Trà sữa truyền thống" required />
          <Input label="Giá (VNĐ)" type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="25000" required min="0" step="1000" />
          <Select label="Danh mục" value={productCategoryId} onChange={(e) => setProductCategoryId(e.target.value)} options={categoryOptions} required />
          <Input label="URL hình ảnh (tùy chọn)" type="url" value={productImageUrl} onChange={(e) => setProductImageUrl(e.target.value)} placeholder="https://..." />
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={closeModal}>Hủy</Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>{isProduct(editingItem) ? 'Cập nhật' : 'Thêm'}</Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={modalMode === 'category'} onClose={closeModal} title={editingItem && !isProduct(editingItem) ? 'Sửa danh mục' : 'Thêm danh mục'} size="sm">
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <Input label="Tên danh mục" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="VD: Trà sữa" required />
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={closeModal}>Hủy</Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>{editingItem && !isProduct(editingItem) ? 'Cập nhật' : 'Thêm'}</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { ingredientsAPI, Ingredient } from '../../../lib/api';
import { formatCurrency } from '../../../lib/utils';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Input, Textarea } from '../../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';

type ModalMode = 'create' | 'import' | 'audit' | 'damage' | null;

export default function InventoryManagementPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [minStock, setMinStock] = useState('0');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [actualStock, setActualStock] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await ingredientsAPI.getAll();
      setIngredients(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách kho');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (mode: ModalMode, ingredient?: Ingredient) => {
    setModalMode(mode);
    setSelectedIngredient(ingredient || null);
    
    if (mode === 'create') {
      setName('');
      setUnit('');
      setMinStock('0');
    } else if (mode === 'import') {
      setQuantity('');
      setPrice('');
      setReason('');
    } else if (mode === 'audit' && ingredient) {
      setActualStock(ingredient.currentStock.toString());
      setReason('');
    } else if (mode === 'damage') {
      setQuantity('');
      setReason('');
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedIngredient(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await ingredientsAPI.create({
        name,
        unit,
        minStock: parseFloat(minStock),
      });
      toast.success('Thêm nguyên liệu thành công');
      await fetchIngredients();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient) return;
    
    setIsLoading(true);
    try {
      await ingredientsAPI.import(
        selectedIngredient.id,
        parseFloat(quantity),
        parseFloat(price),
        reason
      );
      toast.success('Nhập kho thành công');
      await fetchIngredients();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient) return;
    
    setIsLoading(true);
    try {
      await ingredientsAPI.stocktake(
        selectedIngredient.id,
        parseFloat(actualStock),
        reason
      );
      toast.success('Kiểm kê thành công');
      await fetchIngredients();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDamage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient) return;
    
    setIsLoading(true);
    try {
      await ingredientsAPI.damage(
        selectedIngredient.id,
        parseFloat(quantity),
        reason
      );
      toast.success('Đã ghi nhận hao hụt');
      await fetchIngredients();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const getStockStatus = (ingredient: Ingredient) => {
    if (ingredient.currentStock === 0) {
      return <Badge variant="danger">Hết hàng</Badge>;
    }
    if (ingredient.currentStock <= ingredient.minStock) {
      return <Badge variant="warning">Sắp hết</Badge>;
    }
    return <Badge variant="success">Còn hàng</Badge>;
  };

  const lowStockItems = ingredients.filter(i => i.currentStock <= i.minStock && i.currentStock > 0);
  const outOfStockItems = ingredients.filter(i => i.currentStock === 0);
  const totalValue = ingredients.reduce((sum, i) => sum + (i.currentStock * i.costPrice), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <BeakerIcon className="h-8 w-8 text-blue-600" />
                Quản lý Kho
              </h1>
              <p className="text-gray-600 mt-2">Quản lý nguyên liệu, nhập xuất kho</p>
            </div>
            <Button
              variant="primary"
              onClick={() => openModal('create')}
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              Thêm nguyên liệu
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng nguyên liệu</p>
              <p className="text-3xl font-bold text-gray-900">{ingredients.length}</p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Giá trị kho</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalValue)}</p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Sắp hết</p>
              <p className="text-3xl font-bold text-yellow-600">{lowStockItems.length}</p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Hết hàng</p>
              <p className="text-3xl font-bold text-red-600">{outOfStockItems.length}</p>
            </div>
          </Card>
        </div>

        {/* Alerts */}
        {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
          <Card padding="md" className="mb-6 border-yellow-300 bg-yellow-50">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900 mb-2">Cảnh báo tồn kho</p>
                {outOfStockItems.length > 0 && (
                  <p className="text-sm text-yellow-800 mb-1">
                    🔴 <strong>{outOfStockItems.length}</strong> nguyên liệu đã hết: {outOfStockItems.map(i => i.name).join(', ')}
                  </p>
                )}
                {lowStockItems.length > 0 && (
                  <p className="text-sm text-yellow-800">
                    🟡 <strong>{lowStockItems.length}</strong> nguyên liệu sắp hết: {lowStockItems.map(i => i.name).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Inventory Table */}
        <Card padding="none">
          <CardHeader
            title="Danh sách nguyên liệu"
            subtitle={`${ingredients.length} mặt hàng`}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên nguyên liệu</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Giá vốn TB</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.length === 0 ? (
                <TableEmpty message="Chưa có nguyên liệu nào" />
              ) : (
                ingredients.map((ingredient) => (
                  <TableRow key={ingredient.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{ingredient.name}</div>
                      <div className="text-xs text-gray-500">
                        Tối thiểu: {ingredient.minStock} {ingredient.unit}
                      </div>
                    </TableCell>
                    <TableCell>{ingredient.unit}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${
                        ingredient.currentStock === 0 ? 'text-red-600' :
                        ingredient.currentStock <= ingredient.minStock ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {ingredient.currentStock}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(ingredient.costPrice)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(ingredient.currentStock * ingredient.costPrice)}
                    </TableCell>
                    <TableCell>{getStockStatus(ingredient)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal('import', ingredient)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Nhập kho"
                        >
                          <ArrowUpTrayIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openModal('audit', ingredient)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Kiểm kê"
                        >
                          <ClipboardDocumentListIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openModal('damage', ingredient)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Báo hỏng"
                        >
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

      {/* Create Modal */}
      <Modal
        isOpen={modalMode === 'create'}
        onClose={closeModal}
        title="Thêm nguyên liệu mới"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Tên nguyên liệu *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Sữa đặc, Trà xanh..."
            required
          />
          <Input
            label="Đơn vị *"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="VD: kg, lít, hộp..."
            required
          />
          <Input
            label="Mức tồn kho tối thiểu"
            type="number"
            step="0.01"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            placeholder="0"
          />
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={closeModal}>Hủy</Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>Thêm</Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={modalMode === 'import'}
        onClose={closeModal}
        title="Nhập kho"
        size="md"
      >
        {selectedIngredient && (
          <form onSubmit={handleImport} className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-blue-900">{selectedIngredient.name}</p>
              <p className="text-sm text-blue-700">
                Tồn kho hiện tại: {selectedIngredient.currentStock} {selectedIngredient.unit}
              </p>
            </div>
            
            <Input
              label="Số lượng nhập *"
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="VD: 10"
              required
            />
            <Input
              label="Tổng tiền *"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="VD: 200000"
              required
            />
            <Textarea
              label="Ghi chú (tùy chọn)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Nhập từ nhà cung cấp ABC..."
              rows={2}
            />
            
            <ModalFooter>
              <Button type="button" variant="secondary" onClick={closeModal}>Hủy</Button>
              <Button type="submit" variant="primary" isLoading={isLoading}>Nhập kho</Button>
            </ModalFooter>
          </form>
        )}
      </Modal>

      {/* Audit Modal */}
      <Modal
        isOpen={modalMode === 'audit'}
        onClose={closeModal}
        title="Kiểm kê"
        size="md"
      >
        {selectedIngredient && (
          <form onSubmit={handleAudit} className="space-y-4">
            <div className="bg-yellow-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-yellow-900">{selectedIngredient.name}</p>
              <p className="text-sm text-yellow-700">
                Tồn kho hệ thống: {selectedIngredient.currentStock} {selectedIngredient.unit}
              </p>
            </div>
            
            <Input
              label="Số lượng thực tế *"
              type="number"
              step="0.01"
              value={actualStock}
              onChange={(e) => setActualStock(e.target.value)}
              placeholder="VD: 8.5"
              required
            />
            
            {actualStock && (
              <div className={`p-3 rounded-lg ${
                parseFloat(actualStock) === selectedIngredient.currentStock
                  ? 'bg-green-50 text-green-900'
                  : 'bg-red-50 text-red-900'
              }`}>
                <p className="text-sm font-medium">
                  Chênh lệch: {(parseFloat(actualStock) - selectedIngredient.currentStock).toFixed(2)} {selectedIngredient.unit}
                </p>
              </div>
            )}
            
            <Textarea
              label="Lý do *"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Kiểm kê định kỳ tháng 12..."
              rows={2}
              required
            />
            
            <ModalFooter>
              <Button type="button" variant="secondary" onClick={closeModal}>Hủy</Button>
              <Button type="submit" variant="primary" isLoading={isLoading}>Xác nhận</Button>
            </ModalFooter>
          </form>
        )}
      </Modal>

      {/* Damage Modal */}
      <Modal
        isOpen={modalMode === 'damage'}
        onClose={closeModal}
        title="Báo hỏng / Hao hụt"
        size="md"
      >
        {selectedIngredient && (
          <form onSubmit={handleDamage} className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-red-900">{selectedIngredient.name}</p>
              <p className="text-sm text-red-700">
                Tồn kho: {selectedIngredient.currentStock} {selectedIngredient.unit}
              </p>
            </div>
            
            <Input
              label="Số lượng hỏng *"
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="VD: 2"
              required
            />
            <Textarea
              label="Lý do *"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Hết hạn sử dụng, rơi vỡ..."
              rows={2}
              required
            />
            
            <ModalFooter>
              <Button type="button" variant="secondary" onClick={closeModal}>Hủy</Button>
              <Button type="submit" variant="danger" isLoading={isLoading}>Xác nhận</Button>
            </ModalFooter>
          </form>
        )}
      </Modal>
    </div>
  );
}
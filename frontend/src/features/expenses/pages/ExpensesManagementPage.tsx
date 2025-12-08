import { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Input, Textarea, Select } from '../../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface Expense {
  id: number;
  name: string;
  amount: number;
  type: string;
  note?: string;
  date: string;
}

const EXPENSE_TYPES = [
  { value: 'UTILITY', label: '💡 Điện nước', color: 'bg-blue-100 text-blue-800' },
  { value: 'RENT', label: '🏠 Tiền thuê', color: 'bg-purple-100 text-purple-800' },
  { value: 'SALARY', label: '💰 Lương', color: 'bg-green-100 text-green-800' },
  { value: 'MARKETING', label: '📢 Marketing', color: 'bg-pink-100 text-pink-800' },
  { value: 'EQUIPMENT', label: '🔧 Thiết bị', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'OTHER', label: '📦 Khác', color: 'bg-gray-100 text-gray-800' },
];

export default function ExpensesManagementPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('OTHER');
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [startDate, endDate]);

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const [expensesRes, summaryRes] = await Promise.all([
        apiClient.get(`/expenses?${params}`),
        apiClient.get(`/expenses/summary?${params}`),
      ]);

      setExpenses(expensesRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu');
    }
  };

  const openModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setName(expense.name);
      setAmount(expense.amount.toString());
      setType(expense.type);
      setNote(expense.note || '');
    } else {
      setEditingExpense(null);
      setName('');
      setAmount('');
      setType('OTHER');
      setNote('');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExpense(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        name,
        amount: parseFloat(amount),
        type,
        note: note || undefined,
      };

      if (editingExpense) {
        await apiClient.patch(`/expenses/${editingExpense.id}`, data);
        toast.success('Cập nhật chi phí thành công');
      } else {
        await apiClient.post('/expenses', data);
        toast.success('Thêm chi phí thành công');
      }

      await fetchExpenses();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa chi phí "${name}"?`)) return;

    try {
      await apiClient.delete(`/expenses/${id}`);
      toast.success('Xóa chi phí thành công');
      await fetchExpenses();
    } catch (error) {
      console.error(error);
      toast.error('Xóa chi phí thất bại');
    }
  };

  const getTypeBadge = (type: string) => {
    const config = EXPENSE_TYPES.find(t => t.value === type);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        {config?.label || type}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <BanknotesIcon className="h-8 w-8 text-red-600" />
                Quản lý Chi phí
              </h1>
              <p className="text-gray-600 mt-2">Theo dõi và quản lý các khoản chi</p>
            </div>
            <Button
              variant="primary"
              onClick={() => openModal()}
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              Thêm chi phí
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card padding="md" className="mb-6">
          <div className="flex items-center gap-4">
            <Input
              label="Từ ngày"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Đến ngày"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            {(startDate || endDate) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="mt-6"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </Card>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card padding="md">
              <div className="text-center">
                <p className="text-sm text-gray-600">Tổng chi phí</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.total)}</p>
              </div>
            </Card>
            <Card padding="md">
              <div className="text-center">
                <p className="text-sm text-gray-600">Số khoản chi</p>
                <p className="text-2xl font-bold text-gray-900">{summary.count}</p>
              </div>
            </Card>
            <Card padding="md">
              <div className="text-center">
                <p className="text-sm text-gray-600">Trung bình/khoản</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(summary.count > 0 ? summary.total / summary.count : 0)}
                </p>
              </div>
            </Card>
            <Card padding="md">
              <div className="text-center">
                <p className="text-sm text-gray-600">Loại chi phí</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(summary.byType).length}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* By Type Chart */}
        {summary && Object.keys(summary.byType).length > 0 && (
          <Card padding="md" className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ChartBarIcon className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Chi phí theo loại</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(summary.byType).map(([type, amount]: [string, any]) => {
                const percentage = (amount / summary.total) * 100;
                const config = EXPENSE_TYPES.find(t => t.value === type);
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {config?.label || type}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Expenses Table */}
        <Card padding="none">
          <CardHeader
            title="Danh sách chi phí"
            subtitle={`${expenses.length} khoản chi`}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên chi phí</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableEmpty message="Chưa có chi phí nào" />
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{expense.name}</div>
                    </TableCell>
                    <TableCell>{getTypeBadge(expense.type)}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(expense.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(expense.date)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {expense.note || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(expense)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id, expense.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingExpense ? 'Sửa chi phí' : 'Thêm chi phí'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên chi phí *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Tiền điện tháng 12"
            required
          />

          <Input
            label="Số tiền *"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500000"
            required
          />

          <Select
            label="Loại chi phí *"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={EXPENSE_TYPES.map(t => ({ value: t.value, label: t.label }))}
            required
          />

          <Textarea
            label="Ghi chú (tùy chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Thêm ghi chú..."
            rows={3}
          />

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {editingExpense ? 'Cập nhật' : 'Thêm'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
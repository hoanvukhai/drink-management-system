import { useState, useEffect } from 'react';
import { apiClient, ingredientsAPI, Ingredient } from '../../../lib/api';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Select } from '../../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../../components/ui/Table';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ScaleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface Transaction {
  id: number;
  ingredientId: number;
  change: number;
  price: number;
  type: 'IMPORT' | 'EXPORT_SALES' | 'EXPORT_DAMAGE' | 'AUDIT';
  note?: string;
  createdAt: string;
  ingredient: {
    name: string;
    unit: string;
  };
  createdBy?: {
    name?: string;
    username: string;
  };
}

const TRANSACTION_TYPES = [
  { value: '', label: 'Tất cả loại' },
  { value: 'IMPORT', label: 'Nhập kho' },
  { value: 'EXPORT_SALES', label: 'Xuất bán' },
  { value: 'EXPORT_DAMAGE', label: 'Hao hụt' },
  { value: 'AUDIT', label: 'Kiểm kê' },
];

export default function InventoryHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [selectedIngredient, selectedType]);

  const fetchIngredients = async () => {
    try {
      const response = await ingredientsAPI.getAll();
      setIngredients(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedIngredient) params.append('ingredientId', selectedIngredient);
      if (selectedType) params.append('type', selectedType);
      params.append('limit', '100');

      const response = await apiClient.get(`/inventory/transactions?${params}`);
      setTransactions(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải lịch sử');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'IMPORT':
        return {
          icon: <ArrowUpIcon className="h-4 w-4" />,
          label: 'Nhập kho',
          variant: 'success' as const,
        };
      case 'EXPORT_SALES':
        return {
          icon: <ArrowDownIcon className="h-4 w-4" />,
          label: 'Xuất bán',
          variant: 'primary' as const,
        };
      case 'EXPORT_DAMAGE':
        return {
          icon: <TrashIcon className="h-4 w-4" />,
          label: 'Hao hụt',
          variant: 'danger' as const,
        };
      case 'AUDIT':
        return {
          icon: <ScaleIcon className="h-4 w-4" />,
          label: 'Kiểm kê',
          variant: 'warning' as const,
        };
      default:
        return {
          icon: null,
          label: type,
          variant: 'neutral' as const,
        };
    }
  };

  const ingredientOptions = [
    { value: '', label: 'Tất cả nguyên liệu' },
    ...ingredients.map(ing => ({
      value: ing.id.toString(),
      label: `${ing.name} (${ing.unit})`,
    })),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <ClockIcon className="h-8 w-8 text-blue-600" />
            Lịch sử Xuất Nhập Kho
          </h1>
          <p className="text-gray-600 mt-2">Xem lại tất cả giao dịch kho</p>
        </div>

        {/* Filters */}
        <Card padding="md" className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Nguyên liệu"
              value={selectedIngredient}
              onChange={(e) => setSelectedIngredient(e.target.value)}
              options={ingredientOptions}
            />
            <Select
              label="Loại giao dịch"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={TRANSACTION_TYPES}
            />
          </div>
        </Card>

        {/* Transactions Table */}
        <Card padding="none">
          <CardHeader
            title="Lịch sử giao dịch"
            subtitle={`${transactions.length} giao dịch`}
          />

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Nguyên liệu</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Giá trị</TableHead>
                  <TableHead>Người thực hiện</TableHead>
                  <TableHead>Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableEmpty message="Chưa có giao dịch nào" />
                ) : (
                  transactions.map((tx) => {
                    const config = getTypeConfig(tx.type);
                    const isPositive = tx.change > 0;

                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(tx.createdAt)}
                        </TableCell>
                        
                        <TableCell>
                          <div className="font-medium text-gray-900">{tx.ingredient.name}</div>
                          <div className="text-xs text-gray-500">{tx.ingredient.unit}</div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={config.variant} className="inline-flex items-center gap-1">
                            {config.icon}
                            {config.label}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <span className={`font-bold ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isPositive ? '+' : ''}{tx.change.toFixed(2)}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          {tx.price > 0 ? (
                            <span className="font-semibold">{formatCurrency(tx.price)}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        
                        <TableCell className="text-sm text-gray-600">
                          {tx.createdBy?.name || tx.createdBy?.username || 'Hệ thống'}
                        </TableCell>
                        
                        <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                          {tx.note || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
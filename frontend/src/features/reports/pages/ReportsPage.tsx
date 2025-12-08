import { useState, useEffect } from 'react';
import { apiClient, ordersAPI } from '../../../lib/api';
import { formatCurrency } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  BeakerIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of month
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [revenue, setRevenue] = useState(0);
  const [cogs, setCogs] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      // Get all orders to calculate revenue
      const ordersRes = await ordersAPI.getAll();
      const filteredOrders = ordersRes.data.filter(order => {
        const orderDate = new Date(order.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && orderDate < start) return false;
        if (end && orderDate > end) return false;
        return order.status === 'COMPLETED';
      });

      const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      setRevenue(totalRevenue);
      setOrderCount(filteredOrders.length);

      // Get COGS
      try {
        const cogsRes = await apiClient.get(`/inventory/cogs?${params}`);
        setCogs(cogsRes.data.totalCOGS || 0);
      } catch (error) {
        console.log('COGS not available');
        setCogs(0);
      }

      // Get expenses
      try {
        const expensesRes = await apiClient.get(`/expenses/summary?${params}`);
        setExpenses(expensesRes.data.total || 0);
      } catch (error) {
        console.log('Expenses not available');
        setExpenses(0);
      }

    } catch (error) {
      console.error(error);
      toast.error('Không thể tải báo cáo');
    } finally {
      setIsLoading(false);
    }
  };

  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - expenses;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <ChartBarIcon className="h-8 w-8 text-indigo-600" />
            Báo cáo Tài chính
          </h1>
          <p className="text-gray-600 mt-2">Tổng quan doanh thu và lợi nhuận</p>
        </div>

        {/* Date Filter */}
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
          </div>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải báo cáo...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Revenue & Orders */}
            <div className="grid grid-cols-2 gap-4">
              <Card padding="md">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-100">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Doanh thu</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(revenue)}</p>
                  </div>
                </div>
              </Card>

              <Card padding="md">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số đơn hàng</p>
                    <p className="text-2xl font-bold text-blue-600">{orderCount}</p>
                    {orderCount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        TB: {formatCurrency(revenue / orderCount)}/đơn
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* COGS & Expenses */}
            <div className="grid grid-cols-2 gap-4">
              <Card padding="md">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-orange-100">
                    <BeakerIcon className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Giá vốn hàng bán (COGS)</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(cogs)}</p>
                    {revenue > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {((cogs / revenue) * 100).toFixed(1)}% doanh thu
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              <Card padding="md">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-red-100">
                    <BanknotesIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chi phí vận hành</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(expenses)}</p>
                    {revenue > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {((expenses / revenue) * 100).toFixed(1)}% doanh thu
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Profit Summary */}
            <Card padding="md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Tổng hợp Lợi nhuận</h3>
              
              <div className="space-y-4">
                {/* Gross Profit */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Lợi nhuận gộp (Doanh thu - Giá vốn)</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(grossProfit)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Biên lợi nhuận gộp</p>
                    <p className="text-2xl font-bold text-blue-600">{grossMargin.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Net Profit */}
                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Lợi nhuận ròng (Lợi nhuận gộp - Chi phí)
                    </p>
                    <p className={`text-3xl font-bold ${
                      netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(netProfit)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Biên lợi nhuận ròng</p>
                    <p className={`text-3xl font-bold ${
                      netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {netMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Breakdown */}
            <Card padding="md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Phân tích Chi tiết</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700">Doanh thu thuần</span>
                  <span className="font-bold text-green-600">{formatCurrency(revenue)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700">(-) Giá vốn hàng bán</span>
                  <span className="font-bold text-orange-600">-{formatCurrency(cogs)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b bg-blue-50 px-2">
                  <span className="text-gray-900 font-semibold">= Lợi nhuận gộp</span>
                  <span className="font-bold text-blue-600">{formatCurrency(grossProfit)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700">(-) Chi phí vận hành</span>
                  <span className="font-bold text-red-600">-{formatCurrency(expenses)}</span>
                </div>
                
                <div className={`flex justify-between py-3 px-2 rounded-lg ${
                  netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <span className="text-gray-900 font-bold text-lg">= LỢI NHUẬN RÒNG</span>
                  <span className={`font-bold text-2xl ${
                    netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(netProfit)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card padding="md" className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <h3 className="text-lg font-bold text-indigo-900 mb-3">💡 Gợi ý</h3>
              <ul className="space-y-2 text-sm text-indigo-800">
                <li>✓ Biên lợi nhuận gộp tốt: &gt; 60%</li>
                <li>✓ Biên lợi nhuận ròng tốt: &gt; 15%</li>
                <li>✓ Chi phí vận hành lý tưởng: &lt; 30% doanh thu</li>
                <li>✓ Giá vốn lý tưởng: 30-40% doanh thu</li>
              </ul>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
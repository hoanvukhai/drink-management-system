// frontend/src/features/main/pages/MainPage.tsx - SỬA ROUTING
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zonesAPI, ordersAPI, Zone, Order } from '../../../lib/api';
import { formatCurrency } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';
import {
  MapPinIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function MainPage() {
  const navigate = useNavigate();
  const [zones, setZones] = useState<Zone[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [zonesRes, ordersRes] = await Promise.all([
        zonesAPI.getAll(),
        ordersAPI.getForServer(),
      ]);
      setZones(zonesRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  // 👇 SỬA: Đúng route là /table/:id
  const handleTableClick = (tableId: number) => {
    navigate(`/table/${tableId}`);
  };

  const handleTakeawayClick = () => {
    navigate('/takeaway');
  };

  const getDuration = (createdAt: string) => {
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const minutes = Math.floor((now - start) / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h${mins}p`;
    }
    return `${mins}p`;
  };

  const getTableOrder = (tableId: number) => {
    return orders.find((o) => o.tableId === tableId && o.status !== 'COMPLETED');
  };

  const getTakeawayOrders = () => {
    return orders.filter((o) => o.type === 'TAKEAWAY' && o.status !== 'COMPLETED');
  };

  const allTables = zones.flatMap((z) => z.tables);
  const filteredTables = selectedZoneId
    ? zones.find((z) => z.id === selectedZoneId)?.tables || []
    : allTables;

  const getTableColor = (tableId: number) => {
    const order = getTableOrder(tableId);
    if (!order) {
      return {
        bg: 'bg-gradient-to-br from-green-50 to-green-100',
        border: 'border-green-300 hover:border-green-500',
        text: 'text-green-700',
        badge: 'bg-green-100 text-green-800',
      };
    }
    return {
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      border: 'border-orange-300 hover:border-orange-500',
      text: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-800',
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title flex items-center gap-2">
              🍽️ Phục vụ & Thu ngân
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý bàn, gọi món và thanh toán
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchData}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng bàn</p>
              <p className="text-3xl font-bold text-gray-900">{allTables.length}</p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Có khách</p>
              <p className="text-3xl font-bold text-orange-600">
                {allTables.filter((t) => getTableOrder(t.id)).length}
              </p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Mang về</p>
              <p className="text-3xl font-bold text-blue-600">
                {getTakeawayOrders().length}
              </p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng đơn</p>
              <p className="text-3xl font-bold text-indigo-600">{orders.length}</p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedZoneId(null)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              selectedZoneId === null
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Tất cả
          </button>
          
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedZoneId(zone.id)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedZoneId === zone.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {zone.name} ({zone.tables.length})
            </button>
          ))}

          <button
            onClick={() => setSelectedZoneId(-1)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              selectedZoneId === -1
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
            }`}
          >
            🛍️ Mang về ({getTakeawayOrders().length})
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8">
          
          {/* Zones */}
          {zones.map((zone) => {
            if (selectedZoneId === -1) return null;
            if (selectedZoneId !== null && selectedZoneId !== zone.id) return null;

            return (
              <div key={zone.id}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPinIcon className="h-6 w-6 text-indigo-600" />
                    {zone.name}
                  </h2>
                  <span className="text-sm text-gray-600">
                    {zone.tables.length} bàn
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {zone.tables.map((table) => {
                    const order = getTableOrder(table.id);
                    const colors = getTableColor(table.id);
                    return (
                      <button
                        key={table.id}
                        onClick={() => handleTableClick(table.id)}
                        className={`h-32 rounded-xl flex flex-col items-center justify-center shadow-sm border-2 transition-all transform hover:scale-105 hover:shadow-md ${colors.bg} ${colors.border} relative`}
                      >
                        <UserGroupIcon className={`h-6 w-6 mb-2 ${colors.text}`} />
                        <span className={`text-lg font-bold ${colors.text}`}>
                          {table.name}
                        </span>
                        {order ? (
                          <>
                            <span className={`text-sm font-semibold ${colors.text} mt-1`}>
                              {formatCurrency(order.totalAmount)}
                            </span>
                            <span className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {getDuration(order.createdAt)}
                            </span>
                            <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                          </>
                        ) : (
                          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${colors.badge}`}>
                            Trống
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Takeaway */}
          {(selectedZoneId === null || selectedZoneId === -1) && (
            <div>
              <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                  Đơn mang về
                </h2>
                <Button variant="primary" onClick={handleTakeawayClick}>
                  <ShoppingBagIcon className="h-5 w-5 mr-2" />
                  Tạo đơn mới
                </Button>
              </div>

              {getTakeawayOrders().length === 0 ? (
                <Card padding="md">
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingBagIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có đơn mang về nào</p>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {getTakeawayOrders().map((order) => (
                    <Card
                      key={order.id}
                      padding="none"
                      hover
                      className="cursor-pointer"
                      onClick={handleTakeawayClick}
                    >
                      <div className="px-4 py-3 bg-blue-500 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShoppingBagIcon className="h-5 w-5" />
                            <span className="font-bold">{order.orderNumber}</span>
                          </div>
                          <span className="text-xs">
                            <ClockIcon className="h-3 w-3 mr-1 inline" />
                            {getDuration(order.createdAt)}
                          </span>
                        </div>
                        {order.customerName && (
                          <p className="text-sm mt-1">👤 {order.customerName}</p>
                        )}
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-sm text-gray-600 mb-2">
                          {order.items.length} món
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
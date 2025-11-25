import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zonesAPI, Zone, Table, tablesAPI } from '../../../lib/api';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { formatCurrency } from '../../../lib/utils';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  MapPinIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  TrashIcon,
  Cog6ToothIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function TablePage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [activeZoneId, setActiveZoneId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isManageMode, setIsManageMode] = useState(false);
  
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [tableName, setTableName] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setIsLoading(true);
    try {
      const response = await zonesAPI.getAll();
      setZones(response.data);
      if (response.data.length > 0 && !activeZoneId) {
        setActiveZoneId(response.data[0].id);
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải sơ đồ bàn');
    } finally {
      setIsLoading(false);
    }
  };

  const currentZone = zones.find((z) => z.id === activeZoneId);
  const currentTables = currentZone?.tables || [];

  const handleTableClick = (table: Table) => {
    if (isManageMode) return;
    navigate(`/pos/${table.id}`);
  };

  const handleTakeaway = () => {
    navigate('/pos/takeaway');
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await zonesAPI.create(zoneName);
      toast.success('Tạo khu vực thành công');
      setShowZoneModal(false);
      setZoneName('');
      await fetchZones();
    } catch (error) {
      console.error(error);
      toast.error('Tạo khu vực thất bại');
    }
  };

  const handleDeleteZone = async (zoneId: number) => {
    if (!confirm('Xóa khu vực này?')) return;
    try {
      await zonesAPI.delete(zoneId);
      toast.success('Xóa khu vực thành công');
      await fetchZones();
      if (activeZoneId === zoneId) {
        setActiveZoneId(zones[0]?.id || null);
      }
    } catch (error) {
      console.error(error);
      toast.error('Xóa khu vực thất bại');
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeZoneId) {
      toast.error('Vui lòng chọn khu vực trước');
      return;
    }
    try {
      await tablesAPI.create({ name: tableName, zoneId: activeZoneId });
      toast.success('Tạo bàn thành công');
      setShowTableModal(false);
      setTableName('');
      await fetchZones();
    } catch (error) {
      console.error(error);
      toast.error('Tạo bàn thất bại');
    }
  };

  const handleDeleteTable = async (tableId: number) => {
    if (!confirm('Xóa bàn này?')) return;
    try {
      await tablesAPI.delete(tableId);
      toast.success('Xóa bàn thành công');
      await fetchZones();
    } catch (error) {
      console.error(error);
      toast.error('Xóa bàn thất bại');
    }
  };

  // 👇 Helper: Tính thời gian ngồi
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

  const getTableColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          bg: 'bg-gradient-to-br from-green-50 to-green-100',
          border: 'border-green-300 hover:border-green-500',
          text: 'text-green-700',
          badge: 'bg-green-100 text-green-800',
        };
      case 'OCCUPIED':
        return {
          bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
          border: 'border-orange-300 hover:border-orange-500',
          text: 'text-orange-700',
          badge: 'bg-orange-100 text-orange-800',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải sơ đồ bàn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <MapPinIcon className="h-8 w-8 text-indigo-600" />
              Sơ đồ bàn
            </h1>
            <p className="text-gray-600 mt-1">Chọn bàn để bắt đầu gọi món</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isManageMode ? 'primary' : 'secondary'}
              onClick={() => setIsManageMode(!isManageMode)}
              leftIcon={<Cog6ToothIcon className="h-5 w-5" />}
            >
              {isManageMode ? 'Xong' : 'Quản lý'}
            </Button>
          </div>
        </div>

        {/* Zone Tabs */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {zones.map((zone) => (
            <div key={zone.id} className="relative group">
              <button
                onClick={() => setActiveZoneId(zone.id)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all whitespace-nowrap ${
                  activeZoneId === zone.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {zone.name}
                <span className="ml-2 text-sm opacity-75">({zone.tables.length})</span>
              </button>
              
              {isManageMode && (
                <button
                  onClick={() => handleDeleteZone(zone.id)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <TrashIcon className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          
          {isManageMode && (
            <button
              onClick={() => setShowZoneModal(true)}
              className="px-4 py-2.5 rounded-full border-2 border-dashed border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors whitespace-nowrap"
            >
              <PlusIcon className="h-5 w-5 inline mr-1" />
              Thêm khu vực
            </button>
          )}
        </div>

        {/* Tables Grid */}
        {zones.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-12">
              <MapPinIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có khu vực nào</h3>
              <p className="text-gray-600 mb-4">Bắt đầu bằng cách tạo khu vực đầu tiên</p>
              <Button variant="primary" onClick={() => { setIsManageMode(true); setShowZoneModal(true); }}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Tạo khu vực
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {currentTables.map((table) => {
              const activeOrder = table.orders && table.orders.length > 0 ? table.orders[0] : null;
              const isOccupied = activeOrder !== null;
              const colors = getTableColor(isOccupied ? 'OCCUPIED' : 'AVAILABLE');

              return (
                <div key={table.id} className="relative group">
                  <button
                    onClick={() => handleTableClick(table)}
                    disabled={isManageMode}
                    className={`w-full h-32 rounded-xl flex flex-col items-center justify-center shadow-sm border-2 transition-all transform hover:scale-105 hover:shadow-md ${colors.bg} ${colors.border} ${isManageMode ? 'cursor-default' : ''}`}
                  >
                    <UserGroupIcon className={`h-6 w-6 mb-2 ${colors.text}`} />
                    <span className={`text-lg font-bold ${colors.text}`}>{table.name}</span>
                    
                    {activeOrder ? (
                      <>
                        <span className={`text-sm font-semibold ${colors.text} mt-1`}>
                          {formatCurrency(activeOrder.totalAmount)}
                        </span>
                        <span className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          {getDuration(activeOrder.createdAt)}
                        </span>
                        <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                      </>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${colors.badge}`}>
                        Trống
                      </span>
                    )}
                  </button>

                  {isManageMode && (
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}

            {isManageMode && activeZoneId && (
              <button
                onClick={() => setShowTableModal(true)}
                className="h-32 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                <PlusIcon className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Thêm bàn</span>
              </button>
            )}

            {!isManageMode && (
              <button
                onClick={handleTakeaway}
                className="h-32 rounded-xl flex flex-col items-center justify-center shadow-sm border-2 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 hover:border-blue-500 transition-all transform hover:scale-105 hover:shadow-md"
              >
                <ShoppingBagIcon className="h-8 w-8 mb-2 text-blue-600" />
                <span className="text-lg font-bold text-blue-700">Mang về</span>
                <span className="text-xs px-2 py-0.5 rounded-full mt-1 bg-blue-100 text-blue-800">
                  Takeaway
                </span>
              </button>
            )}
          </div>
        )}

        {!isManageMode && zones.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-400" />
              <span>Trống</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-400" />
              <span>Có khách</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-400" />
              <span>Mang về</span>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={showZoneModal} onClose={() => setShowZoneModal(false)} title="Thêm khu vực mới" size="sm">
        <form onSubmit={handleCreateZone} className="space-y-4">
          <Input
            label="Tên khu vực"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            placeholder="VD: Tầng 1, Sân vườn..."
            required
            autoFocus
          />
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setShowZoneModal(false)}>Hủy</Button>
            <Button type="submit" variant="primary">Tạo khu vực</Button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal isOpen={showTableModal} onClose={() => setShowTableModal(false)} title="Thêm bàn mới" size="sm">
        <form onSubmit={handleCreateTable} className="space-y-4">
          <Input
            label="Tên bàn"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="VD: Bàn 01, Bàn VIP..."
            required
            autoFocus
          />
          <p className="text-sm text-gray-500">
            Khu vực: <span className="font-medium text-gray-900">{currentZone?.name}</span>
          </p>
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setShowTableModal(false)}>Hủy</Button>
            <Button type="submit" variant="primary">Tạo bàn</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
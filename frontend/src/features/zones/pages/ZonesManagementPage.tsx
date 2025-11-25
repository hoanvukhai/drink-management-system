import { useState, useEffect } from 'react';
import { zonesAPI, tablesAPI, Zone, Table } from '../../../lib/api';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function ZonesManagementPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  
  // Zone Modal
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [zoneName, setZoneName] = useState('');
  
  // Table Modal
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableName, setTableName] = useState('');
  const [tableCapacity, setTableCapacity] = useState('4');
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await zonesAPI.getAll();
      setZones(response.data);
      if (response.data.length > 0 && !selectedZoneId) {
        setSelectedZoneId(response.data[0].id);
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu');
    }
  };

  // === ZONE HANDLERS ===
  const openZoneModal = (zone?: Zone) => {
    if (zone) {
      setEditingZone(zone);
      setZoneName(zone.name);
    } else {
      setEditingZone(null);
      setZoneName('');
    }
    setShowZoneModal(true);
  };

  const handleZoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingZone) {
        await zonesAPI.update(editingZone.id, zoneName);
        toast.success('Cập nhật khu vực thành công');
      } else {
        await zonesAPI.create(zoneName);
        toast.success('Thêm khu vực thành công');
      }
      await fetchZones();
      setShowZoneModal(false);
      setZoneName('');
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteZone = async (id: number, name: string) => {
    if (!confirm(`Xóa khu vực "${name}"? Tất cả bàn trong khu vực sẽ bị xóa.`)) return;
    try {
      await zonesAPI.delete(id);
      toast.success('Xóa khu vực thành công');
      await fetchZones();
      if (selectedZoneId === id) {
        setSelectedZoneId(zones[0]?.id || null);
      }
    } catch (error) {
      console.error(error);
      toast.error('Xóa khu vực thất bại');
    }
  };

  // === TABLE HANDLERS ===
  const openTableModal = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setTableName(table.name);
      setTableCapacity(table.capacity.toString());
    } else {
      setEditingTable(null);
      setTableName('');
      setTableCapacity('4');
    }
    setShowTableModal(true);
  };

  const handleTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZoneId) {
      toast.error('Vui lòng chọn khu vực');
      return;
    }

    setIsLoading(true);
    try {
      if (editingTable) {
        await tablesAPI.update(editingTable.id, {
          name: tableName,
          capacity: parseInt(tableCapacity),
        });
        toast.success('Cập nhật bàn thành công');
      } else {
        await tablesAPI.create({
          name: tableName,
          capacity: parseInt(tableCapacity),
          zoneId: selectedZoneId,
        });
        toast.success('Thêm bàn thành công');
      }
      await fetchZones();
      setShowTableModal(false);
      setTableName('');
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTable = async (id: number, name: string) => {
    if (!confirm(`Xóa "${name}"?`)) return;
    try {
      await tablesAPI.delete(id);
      toast.success('Xóa bàn thành công');
      await fetchZones();
    } catch (error) {
      console.error(error);
      toast.error('Xóa bàn thất bại');
    }
  };

  const currentZone = zones.find((z) => z.id === selectedZoneId);
  const currentTables = currentZone?.tables || [];

  const totalTables = zones.reduce((sum, z) => sum + z.tables.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Quản lý Khu vực & Bàn</h1>
          <p className="text-gray-600 mt-2">Tạo và quản lý khu vực, bàn ăn</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-indigo-100">
                <MapPinIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng khu vực</p>
                <p className="text-2xl font-bold text-gray-900">{zones.length}</p>
              </div>
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng bàn</p>
                <p className="text-2xl font-bold text-gray-900">{totalTables}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Zones Sidebar */}
          <div className="lg:col-span-1">
            <Card padding="none">
              <CardHeader
                title="Khu vực"
                action={
                  <Button size="sm" variant="primary" onClick={() => openZoneModal()}>
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                }
              />
              <div className="divide-y divide-gray-200">
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className={`flex items-center justify-between px-6 py-3 group ${
                      selectedZoneId === zone.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`flex-1 text-left flex items-center justify-between ${
                        selectedZoneId === zone.id
                          ? 'text-indigo-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <MapPinIcon className="h-5 w-5" />
                        {zone.name}
                      </span>
                      <Badge variant="neutral">{zone.tables.length}</Badge>
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button
                        onClick={() => openZoneModal(zone)}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteZone(zone.id, zone.name)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {zones.length === 0 && (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <MapPinIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Chưa có khu vực nào</p>
                    <Button
                      size="sm"
                      variant="primary"
                      className="mt-3"
                      onClick={() => openZoneModal()}
                    >
                      Tạo khu vực đầu tiên
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Tables Grid */}
          <div className="lg:col-span-3">
            <Card padding="none">
              <CardHeader
                title={currentZone ? `Bàn - ${currentZone.name}` : 'Bàn'}
                subtitle={`${currentTables.length} bàn`}
                action={
                  <Button
                    variant="primary"
                    onClick={() => openTableModal()}
                    disabled={!selectedZoneId}
                    leftIcon={<PlusIcon className="h-5 w-5" />}
                  >
                    Thêm bàn
                  </Button>
                }
              />
              {!selectedZoneId ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  <MapPinIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Chọn khu vực để xem bàn</p>
                </div>
              ) : currentTables.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  <UserGroupIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Chưa có bàn nào</p>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => openTableModal()}
                  >
                    Thêm bàn đầu tiên
                  </Button>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {currentTables.map((table) => (
                      <div
                        key={table.id}
                        className="relative group bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-400 transition-all"
                      >
                        <div className="text-center">
                          <UserGroupIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="font-bold text-gray-900">{table.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Sức chứa: {table.capacity} người
                          </p>
                          <Badge
                            variant={table.status === 'AVAILABLE' ? 'success' : 'warning'}
                            className="mt-2"
                          >
                            {table.status === 'AVAILABLE' ? 'Trống' : 'Có khách'}
                          </Badge>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openTableModal(table)}
                            className="p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTable(table.id, table.name)}
                            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            disabled={table.status === 'OCCUPIED'}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Zone Modal */}
      <Modal
        isOpen={showZoneModal}
        onClose={() => setShowZoneModal(false)}
        title={editingZone ? 'Sửa khu vực' : 'Thêm khu vực mới'}
        size="sm"
      >
        <form onSubmit={handleZoneSubmit} className="space-y-4">
          <Input
            label="Tên khu vực"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            placeholder="VD: Tầng 1, Tầng 2, Sân vườn..."
            required
            autoFocus
          />
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setShowZoneModal(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {editingZone ? 'Cập nhật' : 'Thêm'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Table Modal */}
      <Modal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        title={editingTable ? 'Sửa bàn' : 'Thêm bàn mới'}
        size="sm"
      >
        <form onSubmit={handleTableSubmit} className="space-y-4">
          <Input
            label="Tên bàn"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="VD: Bàn 01, Bàn VIP..."
            required
            autoFocus
          />
          <Input
            label="Sức chứa (số người)"
            type="number"
            value={tableCapacity}
            onChange={(e) => setTableCapacity(e.target.value)}
            placeholder="4"
            required
            min="1"
            max="20"
          />
          {currentZone && (
            <p className="text-sm text-gray-500">
              Khu vực: <span className="font-medium text-gray-900">{currentZone.name}</span>
            </p>
          )}
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setShowTableModal(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {editingTable ? 'Cập nhật' : 'Thêm'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
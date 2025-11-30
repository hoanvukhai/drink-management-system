// frontend/src/features/main/components/EditOrderItemModal.tsx
import { useState, useEffect } from 'react';
import { OrderItem } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import { Modal, ModalFooter } from '../../../components/ui/Modal';

type EditAction = 'DELETE' | 'UPDATE_QUANTITY' | 'UPDATE_NOTE';
type ReasonType = 'CUSTOMER' | 'STAFF_ERROR' | 'OTHER';

interface EditOrderItemModalProps {
  item: OrderItem | null; // 👈 THÊM | null
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: EditAction, data: any, reason: string) => Promise<void>;
}

export default function EditOrderItemModal({ item, isOpen, onClose, onSave }: EditOrderItemModalProps) {
  const [action, setAction] = useState<EditAction>('UPDATE_QUANTITY');
  const [newQuantity, setNewQuantity] = useState('1'); // 👈 DEFAULT VALUE
  const [newNote, setNewNote] = useState(''); // 👈 DEFAULT VALUE
  const [reason, setReason] = useState('');
  const [reasonType, setReasonType] = useState<ReasonType>('CUSTOMER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 👇 THÊM useEffect để reset khi item thay đổi
  useEffect(() => {
    if (item) {
      setNewQuantity(item.quantity.toString());
      setNewNote(item.note || '');
      setAction('UPDATE_QUANTITY');
      setReason('');
      setReasonType('CUSTOMER');
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do!');
      return;
    }

    setIsSubmitting(true);
    
    const reasonLabel = {
      CUSTOMER: 'Khách yêu cầu',
      STAFF_ERROR: 'Nhân viên nhập sai',
      OTHER: 'Khác'
    }[reasonType];
    
    const fullReason = `[${reasonLabel}] ${reason}`;
    
    try {
      const data = action === 'UPDATE_QUANTITY' 
        ? { newQuantity: parseInt(newQuantity) }
        : action === 'UPDATE_NOTE'
        ? { newNote }
        : null;

      await onSave(action, data, fullReason);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 👇 THÊM early return nếu item null
  if (!isOpen || !item) return null;

  const canEdit = !item.isServed;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✏️ Chỉnh sửa món"
      size="md"
    >
      {!canEdit ? (
        <div>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
            <div className="text-4xl mb-3">🚫</div>
            <p className="font-semibold text-red-900 mb-2">Không thể chỉnh sửa</p>
            <p className="text-sm text-red-700">
              Món đã được mang ra cho khách. Không thể sửa hoặc xóa.
            </p>
          </div>
          <Button
            variant="secondary"
            className="w-full mt-4"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Info */}
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
            <p className="font-bold text-gray-900 text-lg">{item.product.name}</p>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
              <span>Số lượng hiện tại: {item.quantity}</span>
              <span>{(item.price * item.quantity).toLocaleString()}đ</span>
            </div>
            {item.note && (
              <p className="text-sm text-indigo-600 mt-2">📝 {item.note}</p>
            )}
          </div>

          {/* Action Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn hành động
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAction('UPDATE_QUANTITY')}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  action === 'UPDATE_QUANTITY'
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Số lượng
              </button>
              <button
                type="button"
                onClick={() => setAction('UPDATE_NOTE')}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  action === 'UPDATE_NOTE'
                    ? 'bg-purple-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📝 Ghi chú
              </button>
              <button
                type="button"
                onClick={() => setAction('DELETE')}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  action === 'DELETE'
                    ? 'bg-red-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🗑️ Xóa
              </button>
            </div>
          </div>

          {/* Action Input */}
          {action === 'UPDATE_QUANTITY' && (
            <Input
              label="Số lượng mới"
              type="number"
              min="1"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              required
              className="text-center text-lg font-semibold"
            />
          )}

          {action === 'UPDATE_NOTE' && (
            <Textarea
              label="Ghi chú mới"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="VD: Ít đá, nhiều đường..."
              rows={3}
            />
          )}

          {action === 'DELETE' && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-900 font-semibold">⚠️ Xác nhận xóa món?</p>
              <p className="text-sm text-red-700 mt-1">
                Món này sẽ bị xóa khỏi đơn hàng. Hành động không thể hoàn tác.
              </p>
            </div>
          )}

          {/* Reason Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lý do chỉnh sửa
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { value: 'CUSTOMER' as const, label: '👤 Khách', color: 'blue' },
                { value: 'STAFF_ERROR' as const, label: '⚠️ Sai', color: 'orange' },
                { value: 'OTHER' as const, label: '📌 Khác', color: 'gray' },
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setReasonType(value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    reasonType === value
                      ? `bg-${color}-500 text-white shadow-md scale-105`
                      : `bg-${color}-100 text-${color}-700 hover:bg-${color}-200`
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                reasonType === 'CUSTOMER'
                  ? 'VD: Khách muốn đổi từ 2 ly sang 3 ly'
                  : reasonType === 'STAFF_ERROR'
                  ? 'VD: Nhân viên nhập nhầm số lượng'
                  : 'Nhập lý do cụ thể...'
              }
              rows={3}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              ⚠️ Lý do này sẽ được lưu vào lịch sử chỉnh sửa để kiểm tra
            </p>
          </div>

          {/* Actions */}
          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant={action === 'DELETE' ? 'danger' : 'primary'}
              isLoading={isSubmitting}
            >
              {action === 'DELETE' ? '🗑️ Xác nhận xóa' : '✅ Lưu thay đổi'}
            </Button>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
}
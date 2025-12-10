import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { mockBookings } from '@/lib/mockData';

interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  campus: 'campus1' | 'campus2';
  equipment?: string;
  status?: string;
  floors?: number;
}

interface RoomDetailModalProps {
  room: Room;
  onClose: () => void;
  onBooking: () => void;
  slots: any[];
  minDate: string;
  maxDate: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedSlotId: number;
  setSelectedSlotId: (id: number) => void;
  setSelectedStartTime: (time: string) => void;
  setSelectedEndTime: (time: string) => void;
  purpose: string;
  setPurpose: (purpose: string) => void;
  isBooking: boolean;
  user: any;
  toast: any;
  onBookingComplete: () => void;
}

const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  onClose,
  onBooking,
  slots,
  minDate,
  maxDate,
  selectedDate,
  setSelectedDate,
  selectedSlotId,
  setSelectedSlotId,
  setSelectedStartTime,
  setSelectedEndTime,
  purpose,
  setPurpose,
  isBooking,
  user,
  toast,
  onBookingComplete,
}) => {
  const [isInBookingMode, setIsInBookingMode] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailSlotsData, setDetailSlotsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [numberOfMember, setNumberOfMember] = useState<number>(room.capacity || 0);
  const [unavailableSlotIds, setUnavailableSlotIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/Faciliti/Detail/${room.id}`);
        if (res.ok) {
          const data = await res.json();
          setDetailData(data);
          setDetailSlotsData(data.slots || []);
        } else {
          console.warn('Failed to fetch room detail');
        }
      } catch (err) {
        console.warn('Error fetching room detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoomDetail();
  }, [room.id]);

  // Fetch bookings for selected date + facility and mark slots that are already Approved
  useEffect(() => {
    const fetchBookingsAndMark = async () => {
      try {
        const res = await fetch('/api/Booking/List');
        if (!res.ok) return;
        const data = await res.json();

        const facilityCode = detailData?.facilityCode || room.name;
        if (!facilityCode) return setUnavailableSlotIds([]);

        const approved = Array.isArray(data)
          ? data.filter((b: any) =>
              b.bookingDate === selectedDate &&
              b.status && String(b.status).toLowerCase() === 'approved' &&
              (b.facilityCode === facilityCode || b.facilityCode === String(facilityCode))
            )
          : [];

        const ids: number[] = [];
        approved.forEach((b: any) => {
          const matched = (slots || []).find((s: any) => s.startTime === b.startTime);
          if (matched && !ids.includes(matched.slotId)) ids.push(matched.slotId);
        });

        setUnavailableSlotIds(ids);
      } catch (err) {
        console.warn('Error fetching bookings for disabled slots:', err);
        setUnavailableSlotIds([]);
      }
    };

    // Only fetch after detailData is loaded
    if (detailData) fetchBookingsAndMark();
    else setUnavailableSlotIds([]);
  }, [selectedDate, detailData, slots, room.name]);

  const handleBooking = async () => {
    const payload = {
      bookingDate: selectedDate,
      purpose: purpose || '',
      numberOfMember: numberOfMember,
      userId: (user as any)?.userId ?? 0,
      facilityId: Number(room.id),
      slotNumber: selectedSlotId,
    };

    try {
      const res = await fetch('/api/Booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        toast({ title: 'Thành công', description: 'Đặt phòng thành công.' });
        if (data && data.id) mockBookings.push(data);
        onBookingComplete();
      } else {
        const text = await res.text();
        toast({ title: 'Lỗi', description: text, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Lỗi mạng', description: String(err), variant: 'destructive' });
    }
  };

  if (isInBookingMode) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Đặt phòng - {room.name}</h3>
        <p className="text-sm text-muted-foreground">Hoàn tất thông tin đặt phòng</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="booking-date">Chọn ngày</Label>
            <input
              id="booking-date"
              type="date"
              className="w-full px-3 py-2 border border-input rounded-md"
              min={minDate}
              max={maxDate}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Chọn ngày đặt phòng"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfMember">Số lượng người tham gia</Label>
            <input
              id="numberOfMember"
              type="number"
              min="1"
              max={room.capacity}
              className="w-full px-3 py-2 border border-input rounded-md"
              value={numberOfMember}
              onChange={(e) => setNumberOfMember(parseInt(e.target.value) || 0)}
              aria-label="Số lượng người tham gia"
            />
          </div>

          <div className="space-y-2">
            <Label>Chọn khung giờ:</Label>
            <div className="grid grid-cols-1 gap-2">
              {(slots && slots.length > 0 ? slots : [{ slotId: 1, startTime: '07:30:00', endTime: '09:00:00' }]).map((slot: any) => {
                const startLabel = slot.startTime.substring(0, 5);
                const endLabel = slot.endTime.substring(0, 5);
                const isUnavailable = unavailableSlotIds.includes(slot.slotId);
                return (
                  <Button
                    key={slot.slotId}
                    className="w-full"
                    variant={selectedSlotId === slot.slotId ? 'default' : 'outline'}
                    size="sm"
                    disabled={isBooking || isUnavailable}
                    onClick={() => {
                      if (isUnavailable) return;
                      setSelectedSlotId(slot.slotId);
                      setSelectedStartTime(slot.startTime);
                      setSelectedEndTime(slot.endTime);
                    }}
                    title={isUnavailable ? 'Đã có đặt thành công cho khung giờ này' : ''}
                  >
                    Slot {slot.slotNumber || slot.slotId}: {startLabel} - {endLabel}
                    {/* {isUnavailable && <span className="ml-2 text-xs text-destructive"> (Có người xử dụng)</span>} */}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mục đích sử dụng</Label>
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md min-h-[80px]"
              placeholder="Nhập mục đích sử dụng..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="w-full" onClick={() => setIsInBookingMode(false)}>
              Quay lại
            </Button>
            <Button className="w-full" disabled={isBooking} onClick={handleBooking}>
              {isBooking ? 'Đang gửi...' : 'Xác nhận đặt phòng'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{room.name}</h3>
        <p className="text-sm text-muted-foreground">
          {room.type} - Sức chứa: {room.capacity} người
          <br />
          Cơ sở: {room.campus === 'campus1' ? 'Khu Công nghệ cao' : 'Nhà văn hóa'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <p className="text-muted-foreground">Đang tải thông tin...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Sức chứa</p>
              <p className="text-lg font-semibold">{detailData?.capacity || room.capacity} chỗ</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Tầng</p>
              <p className="text-lg font-semibold">{detailData?.floor || room.floors || 'N/A'}</p>
            </div>
          </div>

          {detailData?.equipment && (
            <div>
              <p className="text-sm font-semibold mb-2">Thiết bị</p>
              <div className="flex flex-wrap gap-2">
                {detailData.equipment.split(',').map((item: string, idx: number) => (
                  <Badge key={idx} variant="secondary">
                    {item.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {detailData?.campusAddress && (
            <div>
              <p className="text-sm font-semibold mb-2">Địa chỉ</p>
              <p className="text-sm text-muted-foreground">{detailData.campusAddress}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${detailData?.status === 'Available' ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
            <span className="text-sm text-muted-foreground">{detailData?.status === 'Available' ? 'Sẵn sàng' : 'Bảo trì/Đã đầy'}</span>
          </div>

          {detailSlotsData && detailSlotsData.length > 0 ? (
            <div>
              <p className="text-sm font-semibold mb-2">Danh sách các slot</p>
              <div className="space-y-2">
                {detailSlotsData.map((slot: any) => {
                  const startLabel = slot.startTime.substring(0, 5);
                  const endLabel = slot.endTime.substring(0, 5);
                  return (
                    <div key={slot.slotId || slot.slotNumber} className="flex items-center justify-between bg-muted p-2 rounded-lg text-sm">
                      <span>Slot {slot.slotNumber || slot.slotId}</span>
                      <span className="font-semibold">{startLabel} - {endLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">Không có ca nào khả dụng cho phòng này</p>
            </div>
          )}

          {detailData?.averageRating !== null && detailData?.averageRating !== undefined ? (
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Đánh giá</p>
              <div className="bg-muted p-3 rounded-lg mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">⭐ {detailData.averageRating}</span>
                  <span className="text-xs text-muted-foreground">({detailData.totalFeedback || 0} đánh giá)</span>
                </div>
              </div>

              {detailData?.recentFeedback && detailData.recentFeedback.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground">Nhận xét gần đây</p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {detailData.recentFeedback.map((feedback: any, idx: number) => (
                      <div key={idx} className="bg-muted p-2 rounded-lg text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs">{feedback.userName}</span>
                          <span>{'⭐'.repeat(feedback.rating)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{feedback.comment}</p>
                        <p className="text-xs text-muted-foreground/50 mt-1">{new Date(feedback.createAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-2 text-muted-foreground">Đánh giá</p>
              <p className="text-xs text-muted-foreground">Chưa có đánh giá cho phòng này</p>
            </div>
          )}

          <div className="flex gap-2 border-t pt-4">
            <Button variant="outline" className="w-full" onClick={onClose}>Đóng</Button>
            <Button
              className="w-full"
              onClick={() => setIsInBookingMode(true)}
              disabled={detailData?.status !== 'Available' || !slots || slots.length === 0}
              title={!slots || slots.length === 0 ? 'Không có ca nào khả dụng' : ''}
            >
              {detailData?.status !== 'Available' ? 'Không khả dụng' : !slots || slots.length === 0 ? 'Không có ca nào' : 'Đặt phòng'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetailModal;

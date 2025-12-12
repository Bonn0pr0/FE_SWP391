import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { mockBookings } from '@/lib/mockData';
import { 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  Layers, 
  Star, 
  CheckCircle2, 
  Armchair, 
  ArrowLeft, 
  Send,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  // onBooking removed - logic handled internally
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
  isBooking: boolean; // Dùng để xác định loading từ parent (nếu có)
  initialMode?: 'details' | 'booking'; // Prop mới để xác định mode ban đầu
  user: any;
  toast: any;
  onBookingComplete: () => void;
}

const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  onClose,
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
  isBooking: parentIsBooking, // Đổi tên để tránh trùng
  initialMode = 'details',
  user,
  toast,
  onBookingComplete,
}) => {
  // Logic khởi tạo state dựa trên initialMode
  const [isInBookingMode, setIsInBookingMode] = useState(initialMode === 'booking');
  
  // State mới: Quản lý loading khi submit form
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [detailData, setDetailData] = useState<any>(null);
  const [detailSlotsData, setDetailSlotsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [numberOfMember, setNumberOfMember] = useState<number>(room.capacity || 0);
  const [unavailableSlotIds, setUnavailableSlotIds] = useState<number[]>([]);

  // Cập nhật state khi props thay đổi (để đồng bộ với nút "Đặt ngay" ở ngoài)
  useEffect(() => {
    setIsInBookingMode(initialMode === 'booking');
  }, [initialMode, room.id]); // Reset khi đổi phòng

  // Fetch Room Detail
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

  // Fetch Bookings (Unavailable Slots)
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

    if (detailData) fetchBookingsAndMark();
    else setUnavailableSlotIds([]);
  }, [selectedDate, detailData, slots, room.name]);

  // --- HÀM XỬ LÝ ĐẶT PHÒNG (ĐÃ SỬA) ---
  const handleBooking = async () => {
    // 1. Validate User ID
    const userId = (user as any)?.userId || (user as any)?.id;
    if (!userId) {
        toast({ 
            title: 'Lỗi xác thực', 
            description: 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.', 
            variant: 'destructive' 
        });
        return;
    }

    // 2. Validate Slot
    if (!selectedSlotId) {
        toast({ 
            title: 'Chưa chọn giờ', 
            description: 'Vui lòng chọn khung giờ bạn muốn đặt.', 
            variant: 'destructive' 
        });
        return;
    }

    setIsSubmitting(true); // Bắt đầu loading

    const payload = {
      bookingDate: selectedDate,
      purpose: purpose || 'Studying', // Default purpose nếu rỗng
      numberOfMember: numberOfMember,
      userId: Number(userId), // Đảm bảo là số
      facilityId: Number(room.id),
      slotNumber: selectedSlotId, // API thường cần slotId thực tế
    };

    console.log("Submitting Payload:", payload); // Debug log

    try {
      const res = await fetch('/api/Booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        toast({ 
          title: '🎉 Thành công!', 
          description: 'Yêu cầu đặt phòng của bạn đã được gửi.',
          className: "bg-emerald-50 border-emerald-200 text-emerald-800"
        });
        
        // Cập nhật UI giả lập nếu cần
        if (data && data.id) mockBookings.push(data);
        
        onBookingComplete(); // Đóng modal hoặc refresh data
      } else {
        const text = await res.text();
        console.error("API Error:", text);
        toast({ 
            title: 'Đặt phòng thất bại', 
            description: text || "Server trả về lỗi không xác định", 
            variant: 'destructive' 
        });
      }
    } catch (err) {
      console.error("Network Error:", err);
      toast({ title: 'Lỗi mạng', description: "Không thể kết nối đến server.", variant: 'destructive' });
    } finally {
        setIsSubmitting(false); // Kết thúc loading dù thành công hay thất bại
    }
  };

  // --- RENDER: BOOKING FORM ---
  if (isInBookingMode) {
    return (
      <div className="relative overflow-hidden rounded-xl">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-orange-200 blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-blue-200 blur-3xl opacity-20 pointer-events-none" />

        <div className="p-6 space-y-6 relative z-10">
          <div className="flex items-center gap-3 border-b border-dashed border-slate-200 pb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-200">
                <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                    Đặt phòng {room.name}
                </h3>
                <p className="text-sm text-slate-500">Điền thông tin để hoàn tất</p>
            </div>
          </div>

          <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="booking-date" className="text-slate-700 font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> Chọn ngày
              </Label>
              <input
                id="booking-date"
                type="date"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all shadow-sm hover:border-blue-300"
                min={minDate}
                max={maxDate}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Member Count */}
            <div className="space-y-2">
              <Label htmlFor="member-count" className="text-slate-700 font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" /> Số lượng người
              </Label>
              <div className="relative">
                <input
                    id="member-count"
                    type="number"
                    min="1"
                    max={room.capacity}
                    className="w-full px-4 py-2.5 pl-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all shadow-sm"
                    value={numberOfMember}
                    onChange={(e) => setNumberOfMember(parseInt(e.target.value) || 0)}
                />
                <span className="absolute right-4 top-2.5 text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                    Max: {room.capacity}
                </span>
              </div>
            </div>

            {/* Slots Grid */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" /> Chọn khung giờ
              </Label>
              <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                {(slots && slots.length > 0 ? slots : [{ slotId: 1, startTime: '07:30:00', endTime: '09:00:00' }]).map((slot: any) => {
                  const startLabel = slot.startTime.substring(0, 5);
                  const endLabel = slot.endTime.substring(0, 5);
                  const isUnavailable = unavailableSlotIds.includes(slot.slotId);
                  const isSelected = selectedSlotId === slot.slotId;

                  return (
                    <button
                      key={slot.slotId}
                      disabled={isSubmitting || isUnavailable}
                      onClick={() => {
                        if (isUnavailable) return;
                        setSelectedSlotId(slot.slotId);
                        setSelectedStartTime(slot.startTime);
                        setSelectedEndTime(slot.endTime);
                      }}
                      className={cn(
                        "relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all duration-300",
                        isUnavailable 
                            ? "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed grayscale" 
                            : isSelected 
                                ? "bg-gradient-to-br from-orange-500 to-pink-500 border-transparent text-white shadow-lg shadow-orange-200 scale-[1.02]" 
                                : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-orange-50 hover:shadow-md"
                      )}
                    >
                      <span className="text-xs font-medium uppercase tracking-wider opacity-90">Slot {slot.slotNumber || slot.slotId}</span>
                      <span className="text-sm font-bold mt-0.5">{startLabel} - {endLabel}</span>
                      {isSelected && <CheckCircle2 className="absolute top-1 right-1 w-3 h-3 text-white/80" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="booking-purpose" className="text-slate-700 font-semibold">Mục đích sử dụng</Label>
              <textarea
                id="booking-purpose"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all shadow-sm min-h-[80px] resize-none"
                placeholder="VD: Họp nhóm đồ án, training câu lạc bộ..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 h-11" 
                onClick={() => setIsInBookingMode(false)}
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
              </Button>
              <Button 
                className="flex-[2] rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 h-11 font-semibold"
                disabled={isSubmitting} 
                onClick={handleBooking}
              >
                {isSubmitting ? 'Đang gửi...' : (
                    <>
                        Xác nhận đặt phòng <Send className="w-4 h-4 ml-2" />
                    </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: DETAIL VIEW ---
  return (
    <div className="relative overflow-hidden rounded-xl bg-white">
        {/* Header Banner - Gradient Background */}
        <div className="h-32 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-full p-6 text-white transform translate-y-8">
                <div className="flex items-center justify-between">
                    <div className="bg-white p-1 rounded-2xl shadow-xl">
                        <div className="h-16 w-16 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                             <Layers className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <div className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border",
                        detailData?.status === 'Available' 
                            ? "bg-emerald-400/20 border-emerald-300 text-emerald-50 backdrop-blur-md" 
                            : "bg-red-400/20 border-red-300 text-red-50 backdrop-blur-md"
                    )}>
                        {detailData?.status === 'Available' ? 'Sẵn sàng' : 'Bảo trì'}
                    </div>
                </div>
            </div>
        </div>

      <div className="pt-10 px-6 pb-6 space-y-6">
        {/* Title Section */}
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            {room.name}
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                {room.type}
            </Badge>
          </h3>
          <p className="text-slate-500 flex items-center gap-1 mt-1 text-sm font-medium">
             <MapPin className="w-4 h-4 text-orange-500" /> 
             {room.campus === 'campus1' ? 'Khu Công nghệ cao (CNC)' : 'Nhà văn hóa (NVH)'}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Đang tải thông tin chi tiết...</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4 group hover:bg-blue-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-blue-400 font-semibold uppercase">Sức chứa</p>
                  <p className="text-lg font-bold text-slate-700">{detailData?.capacity || room.capacity} chỗ</p>
                </div>
              </div>
              
              <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl flex items-center gap-4 group hover:bg-orange-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-orange-400 font-semibold uppercase">Tầng</p>
                  <p className="text-lg font-bold text-slate-700">{detailData?.floor || room.floors || 'Trệt'}</p>
                </div>
              </div>
            </div>

            {/* Equipment Tags */}
            {detailData?.equipment && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-purple-500" /> Thiết bị có sẵn
                </p>
                <div className="flex flex-wrap gap-2">
                  {detailData.equipment.split(',').map((item: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200 rounded-lg">
                      {item.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Slots List */}
            {detailSlotsData && detailSlotsData.length > 0 ? (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-500" /> Ca học trong ngày
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {detailSlotsData.map((slot: any) => {
                    const startLabel = slot.startTime.substring(0, 5);
                    const endLabel = slot.endTime.substring(0, 5);
                    return (
                      <div key={slot.slotId || slot.slotNumber} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-100 text-sm shadow-sm">
                        <span className="text-slate-500 font-medium">Slot {slot.slotNumber || slot.slotId}</span>
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{startLabel} - {endLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800 font-medium">Không có ca nào khả dụng.</p>
                </div>
            )}

            {/* Reviews */}
            <div className="border-t border-slate-100 pt-4">
               <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Đánh giá
                  </p>
                  {detailData?.averageRating !== null && (
                      <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-slate-900">{detailData.averageRating}</span>
                          <span className="text-xs text-slate-400">/ 5 ({detailData.totalFeedback || 0})</span>
                      </div>
                  )}
               </div>

              {detailData?.recentFeedback && detailData.recentFeedback.length > 0 ? (
                  <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                    {detailData.recentFeedback.map((feedback: any, idx: number) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-700">{feedback.userName}</span>
                          <div className="flex text-yellow-400 text-[10px]">
                            {'★'.repeat(feedback.rating)}
                            <span className="text-slate-200">{'★'.repeat(5 - feedback.rating)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{feedback.comment}</p>
                      </div>
                    ))}
                  </div>
              ) : (
                 <p className="text-xs text-slate-400 italic text-center py-2">Chưa có đánh giá nào gần đây.</p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl h-11 border-slate-200 hover:bg-slate-50 hover:text-slate-900" onClick={onClose}>
                Đóng
              </Button>
              <Button
                className={cn(
                    "flex-[2] rounded-xl h-11 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5",
                    detailData?.status !== 'Available' || !slots || slots.length === 0
                        ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 shadow-orange-200"
                )}
                onClick={() => setIsInBookingMode(true)}
                disabled={detailData?.status !== 'Available' || !slots || slots.length === 0}
              >
                {detailData?.status !== 'Available' ? 'Đang bảo trì' : !slots || slots.length === 0 ? 'Hết chỗ' : 'Đặt phòng ngay'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetailModal;
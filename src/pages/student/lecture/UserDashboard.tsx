import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Đảm bảo bạn đã có component này hoặc dùng thẻ input thường
import { mockRooms, mockBookings } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, MapPin, Search } from 'lucide-react';

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

const UserDashboard = () => {
  const { user, updateCampus } = useAuth();
  const [facilities, setFacilities] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // --- MỚI: State cho thanh tìm kiếm ---
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedSlotId, setSelectedSlotId] = useState<number>(1);
  const [selectedStartTime, setSelectedStartTime] = useState<string>('07:30:00');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('09:00:00');
  const [purpose, setPurpose] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  const userBookings = mockBookings.filter(b => b.userEmail === user?.email);

  const handleCampusChange = (campus: 'campus1' | 'campus2') => {
    updateCampus(campus);
  };

  useEffect(() => {
    const fetchFacilities = async () => {
      const proxyUrl = '/api/Faciliti/List';
      const directUrl = 'https://localhost:44338/api/Faciliti/List';

      try {
        let res = await fetch(proxyUrl);
        if (!res.ok) {
          res = await fetch(directUrl, { mode: 'cors' });
        }

        if (res.ok) {
          const data = await res.json();
          setFacilities(Array.isArray(data) ? data : []);
        } else {
          console.warn('Facilities fetch failed:', res.statusText);
          toast?.({ title: 'Cảnh báo', description: 'Không lấy được danh sách phòng từ server.' });
        }
      } catch (err) {
        console.warn('Facilities fetch error:', err);
        setFacilities([]); // Reset về rỗng để fallback sang mockRooms
      }
    };

    fetchFacilities();
  }, [user?.campus]); // Re-fetch khi user đổi campus

  useEffect(() => {
    const fetchSlots = async () => {
      // ... (Giữ nguyên logic fetch slots)
      const proxyUrl = '/api/Slot';
      try {
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const data = await res.json();
          setSlots(Array.isArray(data) ? data : []);
          if (Array.isArray(data) && data.length > 0) {
            setSelectedSlotId(data[0].slotId);
            setSelectedStartTime(data[0].startTime);
            setSelectedEndTime(data[0].endTime);
          }
        }
      } catch (err) { console.warn(err); }
    };
    fetchSlots();
  }, []);

  // --- MỚI: Logic Filter và Chuẩn hóa dữ liệu ---
  // Sử dụng useMemo để tối ưu hiệu năng, tránh tính toán lại mỗi lần render không cần thiết
  const filteredFacilities = useMemo(() => {
    // 1. Xác định nguồn dữ liệu (API hay Mock)
    const sourceData = facilities.length > 0 ? facilities : mockRooms;

    // 2. Map dữ liệu về chuẩn chung (Interface Room)
    const normalizedData: Room[] = sourceData.map((item: any) => {
      // Logic xác định campus từ dữ liệu API (thường trả về tên tiếng Việt)
      const isCampus1 = item.campusName 
        ? item.campusName.toLowerCase().includes('công nghệ cao') 
        : item.campus === 'campus1';
      
      return {
        id: String(item.facilityId || item.id),
        name: item.facilityCode || item.name,
        type: item.typeName || item.type || '', // Quan trọng cho việc search
        capacity: item.capacity || 0,
        campus: isCampus1 ? 'campus1' : 'campus2',
        equipment: item.equipment,
        status: item.status || 'Available',
        floors: item.floors
      };
    });

    // 3. Thực hiện Filter
    return normalizedData.filter(room => {
      // Filter theo Campus hiện tại của user
      const matchCampus = room.campus === user?.campus;

      // Filter theo Search Term (TypeName)
      // Tìm kiếm không phân biệt hoa thường
      const matchSearch = room.type.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCampus && matchSearch;
    });

  }, [facilities, user?.campus, searchTerm]); // Chạy lại khi 3 biến này thay đổi

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8 animate-fade-in">
        {/* Welcome & Campus Selection Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Chào mừng, {user?.email.split('@')[0]}</h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'student' ? 'Sinh viên' : 'Giảng viên'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="campus" className="text-sm">Chọn Campus</Label>
              <Select value={user?.campus || 'campus1'} onValueChange={(value: 'campus1' | 'campus2') => handleCampusChange(value)}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campus1">Campus 1 - Cơ sở khu công nghệ cao</SelectItem>
                  <SelectItem value="campus2">Campus 2 - Cơ sở nhà văn hóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid gap-4 md:grid-cols-3">
           {/* ... (Giữ nguyên phần Stats Card) */}
          <Card className="gradient-purple text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đặt phòng đang hoạt động</CardTitle>
              <Calendar className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userBookings.filter(b => b.status === 'Approved' || b.status === 'Pending').length}</div>
            </CardContent>
          </Card>

          <Card className="gradient-blue text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng giờ đã đặt</CardTitle>
              <Clock className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {userBookings.reduce((acc, b) => acc + (b.endTime - b.startTime), 0)} giờ
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-pink text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Phòng khả dụng</CardTitle>
              <MapPin className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {/* Hiển thị số lượng sau khi đã filter */}
                {filteredFacilities.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room List Section with Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Phòng khả dụng hôm nay</CardTitle>
                <CardDescription>
                  Campus {user?.campus === 'campus1' ? '1 - Công nghệ cao' : '2 - Nhà văn hóa'}
                </CardDescription>
              </div>
              
              {/* --- MỚI: Thanh Search --- */}
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm theo loại phòng (VD: Classroom)..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* ------------------------- */}
            </div>
          </CardHeader>
          <CardContent>
            {filteredFacilities.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                Không tìm thấy phòng nào phù hợp với từ khóa "{searchTerm}" tại Campus này.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Render danh sách đã filter */}
                {filteredFacilities.map((roomObj, idx) => {
                  const gradients = ['gradient-purple', 'gradient-blue', 'gradient-pink', 'gradient-orange', 'gradient-green'];
                  const gradient = gradients[idx % gradients.length];

                  return (
                    <Card key={roomObj.id} className="overflow-hidden hover:shadow-lg transition-all hover:scale-105">
                      <div className={`h-2 ${gradient}`} />
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{roomObj.name}</CardTitle>
                            <CardDescription>{roomObj.type}</CardDescription>
                          </div>
                          <Badge variant="secondary" className="font-semibold">{roomObj.capacity} chỗ</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {roomObj.equipment && (
                            <div className="text-xs text-muted-foreground mb-2 truncate" title={roomObj.equipment}>
                              🔧 {roomObj.equipment}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <div className={`h-3 w-3 rounded-full ${roomObj.status === 'Available' ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
                            <span className="text-muted-foreground">
                              {roomObj.status === 'Available' ? 'Sẵn sàng' : 'Bảo trì/Đã đầy'}
                            </span>
                          </div>
                          {roomObj.floors && (
                            <div className="text-xs text-muted-foreground">
                              📍 Tầng {roomObj.floors}
                            </div>
                          )}
                          
                          {/* Dialog Booking */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => setSelectedRoom(roomObj)}
                                disabled={roomObj.status !== 'Available'}
                              >
                                {roomObj.status === 'Available' ? 'Đặt phòng' : 'Không khả dụng'}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>{roomObj.name}</DialogTitle>
                                <DialogDescription>
                                  {roomObj.type} - Sức chứa: {roomObj.capacity} người
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                {/* Form đặt phòng (Giữ nguyên) */}
                                <div className="space-y-2">
                                  <Label htmlFor="booking-date">Chọn ngày</Label>
                                  <input 
                                    id="booking-date"
                                    type="date" 
                                    className="w-full px-3 py-2 border border-input rounded-md"
                                    defaultValue={selectedDate}
                                    aria-label="Chọn ngày đặt phòng"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Chọn khung giờ: </Label>
                                  <div className="grid grid-cols-1 gap-2">
                                    {(slots.length > 0 ? slots : [
                                      { slotId: 1, startTime: '07:30:00', endTime: '09:00:00' },
                                      // ... các slot mặc định khác
                                    ]).map((slot: any) => {
                                      const startLabel = slot.startTime.substring(0, 5);
                                      const endLabel = slot.endTime.substring(0, 5);
                                      return (
                                        <Button
                                          key={slot.slotId}
                                          className="w-full"
                                          variant={selectedSlotId === slot.slotId ? 'default' : 'outline'}
                                          size="sm"
                                          onClick={() => {
                                            setSelectedSlotId(slot.slotId);
                                            setSelectedStartTime(slot.startTime);
                                            setSelectedEndTime(slot.endTime);
                                          }}
                                        >
                                          {startLabel} - {endLabel}
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
                                <Button className="w-full" disabled={!selectedRoom || isBooking}
                                  onClick={async () => {
                                    if (!selectedRoom) return;
                                    setIsBooking(true);
                                    // Payload sử dụng dữ liệu từ selectedRoom (đã chuẩn hóa)
                                    const payload = {
                                      bookingCode: `BK-${Date.now()}`,
                                      bookingDate: selectedDate, 
                                      purpose: purpose || 'Đặt phòng',
                                      numberOfMember: selectedRoom.capacity || 0,
                                      userId: (user as any)?.userId ?? 0,
                                      // Lưu ý: selectedRoom.id đã convert sang string, cần parse lại nếu API cần số
                                      facilityId: Number(selectedRoom.id), 
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
                                      } else {
                                        const text = await res.text();
                                        toast({ title: 'Lỗi', description: text, variant: 'destructive' });
                                      }
                                    } catch (err) {
                                      toast({ title: 'Lỗi mạng', description: String(err), variant: 'destructive' });
                                    } finally {
                                      setIsBooking(false);
                                    }
                                  }}
                                >
                                  {isBooking ? 'Đang gửi...' : 'Xác nhận đặt phòng'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserDashboard;
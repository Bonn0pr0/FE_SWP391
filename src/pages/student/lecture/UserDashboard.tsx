import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { mockRooms, mockBookings } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, MapPin, TrendingUp } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  campus: 'campus1' | 'campus2';
}

const UserDashboard = () => {
  const { user, updateCampus } = useAuth();
  const [facilityTypes, setFacilityTypes] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [selectedSlotId, setSelectedSlotId] = useState<number>(1);
  const [selectedStartTime, setSelectedStartTime] = useState<string>('07:30:00');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('09:00:00');
  const [purpose, setPurpose] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  // Filter bookings for current user
  const userBookings = mockBookings.filter(b => b.userEmail === user?.email);

  const handleCampusChange = (campus: 'campus1' | 'campus2') => {
    // Update campus in auth context so selection persists
    updateCampus(campus);
  };

  // timeSlots replaced by predefinedSlots (fixed ranges)

  useEffect(() => {
    const fetchFacilityTypes = async () => {
      // Try proxy first, fallback to direct https if needed
      const proxyUrl = '/api/FacilityType';
      const directUrl = '/api/FacilityType';

      try {
        let res = await fetch(proxyUrl);
        if (!res.ok) {
          // try direct
          res = await fetch(directUrl, { mode: 'cors' });
        }

        if (res.ok) {
          const data = await res.json();
          setFacilityTypes(Array.isArray(data) ? data : []);
        } else {
          console.warn('FacilityType fetch failed:', res.statusText);
          toast?.({ title: 'Không lấy được loại phòng', description: 'Server trả về lỗi khi lấy thông tin loại phòng.' });
        }
      } catch (err) {
        console.warn('FacilityType fetch error:', err);
        toast?.({ title: 'Lỗi mạng', description: 'Không thể kết nối tới API loại phòng.' });
      }
    };

    fetchFacilityTypes();
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      const proxyUrl = '/api/Slot';
      const directUrl = '/api/Slot';

      try {
        let res = await fetch(proxyUrl);
        if (!res.ok) {
          res = await fetch(directUrl, { mode: 'cors' });
        }

        if (res.ok) {
          const data = await res.json();
          setSlots(Array.isArray(data) ? data : []);
          // Set first slot as default if available
          if (Array.isArray(data) && data.length > 0) {
            setSelectedSlotId(data[0].slotId);
            setSelectedStartTime(data[0].startTime);
            setSelectedEndTime(data[0].endTime);
          }
        } else {
          console.warn('Slot fetch failed:', res.statusText);
        }
      } catch (err) {
        console.warn('Slot fetch error:', err);
      }
    };

    fetchSlots();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8 animate-fade-in">
        {/* Welcome Section */}
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
                  <SelectItem value="campus1">Campus 1 - Công nghệ cao</SelectItem>
                  <SelectItem value="campus2">Campus 2 - Nhà văn hóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
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
                {mockRooms.filter(r => r.campus === user?.campus).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room Availability Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Phòng khả dụng hôm nay</CardTitle>
            <CardDescription>Campus {user?.campus === 'campus1' ? '1 - Công nghệ cao' : '2 - Nhà văn hóa'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(
                facilityTypes.length
                  ? facilityTypes.filter((_: any, i: number) => true) // we'll show all facility types
                  : mockRooms.filter(room => room.campus === user?.campus)
              ).map((room: any, idx: number) => {
                  const gradients = ['gradient-purple', 'gradient-blue', 'gradient-pink', 'gradient-orange', 'gradient-green'];
                  const gradient = gradients[idx % gradients.length];
                  
                  // normalize room object when facilityTypes is used
                  const roomObj = facilityTypes.length
                    ? { id: String(room.typeId ?? idx), name: room.typeName ?? `Loại ${idx+1}`, type: room.description ?? room.typeName, capacity: 0, campus: 'campus1' }
                    : room;

                  return (
                    <Card key={roomObj.id} className="overflow-hidden hover:shadow-lg transition-all hover:scale-105">
                      <div className={`h-2 ${gradient}`} />
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{roomObj.name}</CardTitle>
                            <CardDescription>{roomObj.type}</CardDescription>
                          </div>
                          <Badge variant="secondary" className="font-semibold">{roomObj.capacity ?? 0} chỗ</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                            <span className="text-muted-foreground">Khả dụng: 8h-12h, 14h-17h</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-3 w-3 rounded-full bg-destructive" />
                            <span className="text-muted-foreground">Đã đặt: 9h-11h, 15h-16h</span>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => setSelectedRoom(roomObj)}
                              >
                                Xem chi tiết
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>{roomObj.name}</DialogTitle>
                                <DialogDescription>
                                  {roomObj.type} - Sức chứa: {roomObj.capacity ?? 0} người
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
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
                                      { slotId: 2, startTime: '09:10:00', endTime: '10:40:00' },
                                      { slotId: 3, startTime: '10:50:00', endTime: '12:20:00' },
                                      { slotId: 4, startTime: '13:00:00', endTime: '14:30:00' },
                                      { slotId: 5, startTime: '14:40:00', endTime: '16:10:00' },
                                    ]).map(slot => {
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
                                    placeholder="Nhập mục đích sử dụng phòng..."
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                  />
                                </div>
                                <Button className="w-full" disabled={!selectedRoom || isBooking}
                                  onClick={async () => {
                                    if (!selectedRoom) return;
                                    setIsBooking(true);
                                    const payload = {
                                      bookingCode: `BK-${Date.now()}`,
                                      bookingDate: selectedDate,
                                      purpose: purpose || 'Đặt phòng',
                                      numberOfMember: selectedRoom.capacity || 0,
                                      userId: (/* eslint-disable @typescript-eslint/no-explicit-any */ (user as any)?.userId) ?? 0,
                                      facilityId: selectedRoom.id,
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
                                        toast({ title: 'Đặt phòng thành công', description: 'Yêu cầu đặt phòng đã được gửi.' });
                                        // Optionally add to local mock list
                                        // add returned booking if provided
                                        if (data && data.id) {
                                          mockBookings.push(data);
                                        }
                                      } else {
                                        const text = await res.text();
                                        toast({ title: 'Lỗi đặt phòng', description: text, variant: 'destructive' });
                                      }
                                    } catch (err) {
                                      toast({ title: 'Lỗi mạng', description: String(err), variant: 'destructive' });
                                    } finally {
                                      setIsBooking(false);
                                    }
                                  }}
                                >
                                  {isBooking ? 'Đang gửi...' : 'Đặt phòng'}
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
          </CardContent>
        </Card>

        
      </main>
    </div>
  );
};

export default UserDashboard;

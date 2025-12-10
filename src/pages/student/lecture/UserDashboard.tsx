import { useState, useEffect, useMemo, FC } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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

import RoomDetailModal from '@/components/RoomDetailModal';


const UserDashboard = () => {
  const { user, updateCampus } = useAuth();
  const [facilities, setFacilities] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  
  // --- THAY ĐỔI 1: Thêm hàm setSelectedDate để cập nhật state ---
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // --- THAY ĐỔI 2: Tính toán ngày Min và Max ---
  const today = new Date();
  const minDate = today.toISOString().split('T')[0]; // Ngày hiện tại

  const maxDateObj = new Date(today);
  maxDateObj.setDate(today.getDate() + 31 ); // Cộng thêm 3 ngày
  const maxDate = maxDateObj.toISOString().split('T')[0];
  // -------------------------------------------------------------

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [selectedSlotId, setSelectedSlotId] = useState<number>(1);
  const [selectedStartTime, setSelectedStartTime] = useState<string>('07:30:00');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('09:00:00');
  const [purpose, setPurpose] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  const userBookings = mockBookings.filter(b => b.userEmail === user?.email);

  const handleCampusChange = (campus: 'campus1' | 'campus2' | 'all') => {
    updateCampus(campus as any);
  };

  useEffect(() => {
    const fetchFacilities = async () => {
      const proxyUrl = '/api/Faciliti/List';
      const directUrl = '/api/Faciliti/List';

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
        setFacilities([]);
      }
    };
    fetchFacilities();
  }, [user?.campus]); 

  useEffect(() => {
    const fetchSlots = async () => {
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

  const filteredFacilities = useMemo(() => {
    const sourceData = facilities.length > 0 ? facilities : mockRooms;

    const normalizedData: Room[] = sourceData.map((item: any) => {
      const isCampus1 = item.campusName 
        ? item.campusName.toLowerCase().includes('công nghệ cao') 
        : item.campus === 'campus1';
      
      return {
        id: String(item.facilityId || item.id),
        name: item.facilityCode || item.name,
        type: item.typeName || item.type || '',
        capacity: item.capacity || 0,
        campus: isCampus1 ? 'campus1' : 'campus2',
        equipment: item.equipment,
        status: item.status || 'Available',
        floors: item.floors
      };
    });

    return normalizedData.filter(room => {
      const currentCampus = (user as any)?.campus; 
      const matchCampus = currentCampus === 'all' || room.campus === currentCampus;
      const matchSearch = room.type.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCampus && matchSearch;
    });

  }, [facilities, user?.campus, searchTerm]);

  const getCampusLabel = () => {
    const c = (user as any)?.campus;
    if (c === 'all') return 'Tất cả cơ sở';
    if (c === 'campus1') return 'Cơ sở 1 - Công nghệ cao';
    return 'Cơ sở 2 - Nhà văn hóa';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8 animate-fade-in">
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
              <Select 
                value={(user as any)?.campus || 'campus1'} 
                onValueChange={(value: 'campus1' | 'campus2' | 'all') => handleCampusChange(value)}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Xem tất cả</SelectItem>
                  <SelectItem value="campus1">Campus 1 - Cơ sở khu công nghệ cao</SelectItem>
                  <SelectItem value="campus2">Campus 2 - Cơ sở nhà văn hóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* <Card className="gradient-purple text-white border-0">
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
          </Card> */}

          <Card className="gradient-pink text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Danh sách phòng</CardTitle>
              <MapPin className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
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
                <CardTitle>Danh sách phòng</CardTitle>
                <CardDescription>
                  {getCampusLabel()}
                </CardDescription>
              </div>
              
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
            </div>
          </CardHeader>
          <CardContent>
            {filteredFacilities.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                Không tìm thấy phòng nào phù hợp với từ khóa "{searchTerm}" 
                {(user as any)?.campus !== 'all' ? ' tại Campus này.' : '.'}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                          {(user as any)?.campus === 'all' && (
                            <Badge variant="outline" className="mb-2 mr-2">
                              {roomObj.campus === 'campus1' ? 'Khu CNC' : 'Nhà VH'}
                            </Badge>
                          )}
                          
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
                          
                          <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => {
                                  setSelectedRoom(roomObj);
                                  setShowDetailModal(true);
                                }}
                                disabled={roomObj.status !== 'Available'}
                              >
                                {roomObj.status === 'Available' ? 'Xem chi tiết' : 'Không khả dụng'}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                              {selectedRoom && (
                                <RoomDetailModal 
                                  room={selectedRoom} 
                                  onClose={() => setShowDetailModal(false)}
                                  onBooking={() => {
                                    setShowDetailModal(false);
                                    setShowBookingModal(true);
                                  }}
                                  slots={slots}
                                  minDate={minDate}
                                  maxDate={maxDate}
                                  selectedDate={selectedDate}
                                  setSelectedDate={setSelectedDate}
                                  selectedSlotId={selectedSlotId}
                                  setSelectedSlotId={setSelectedSlotId}
                                  setSelectedStartTime={setSelectedStartTime}
                                  setSelectedEndTime={setSelectedEndTime}
                                  purpose={purpose}
                                  setPurpose={setPurpose}
                                  isBooking={isBooking}
                                  user={user}
                                  toast={toast}
                                  onBookingComplete={() => setShowDetailModal(false)}
                                />
                              )}
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
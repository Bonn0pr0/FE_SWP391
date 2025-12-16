import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { mockRooms, mockBookings } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  MapPin, 
  Search, 
  Building2, 
  Users, 
  Zap, 
  Clock,
  Info,
  CalendarCheck,
  Filter 
} from 'lucide-react';
import RoomDetailModal from '@/components/RoomDetailModal';

// Interface cho loại phòng từ API
interface FacilityType {
  typeId: number;
  typeName: string;
  description: string;
  createAt: string;
}

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
  
  // State quản lý danh sách loại phòng và loại đang chọn
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('All'); 

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDateObj = new Date(today);
  maxDateObj.setDate(today.getDate() + 31);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [selectedSlotId, setSelectedSlotId] = useState<number>(1);
  const [selectedStartTime, setSelectedStartTime] = useState<string>('07:30:00');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('09:00:00');
  const [purpose, setPurpose] = useState<string>('');
  const { toast } = useToast();

  const handleCampusChange = (campus: 'campus1' | 'campus2' | 'all') => {
    updateCampus(campus as any);
  };

  // 1. Gọi API lấy danh sách Facility Type (TypeName)
  useEffect(() => {
    const fetchFacilityTypes = async () => {
      try {
        const res = await fetch('/api/FacilityType');
        if (res.ok) {
          const data = await res.json();
          setFacilityTypes(data);
        }
      } catch (err) {
        console.error("Failed to fetch facility types:", err);
      }
    };
    fetchFacilityTypes();
  }, []);

  // Gọi API lấy danh sách phòng
  useEffect(() => {
    const fetchFacilities = async () => {
      const proxyUrl = '/api/Faciliti/List';
      const directUrl = '/api/Faciliti/List';
      try {
        let res = await fetch(proxyUrl);
        if (!res.ok) res = await fetch(directUrl, { mode: 'cors' });
        if (res.ok) {
          const data = await res.json();
          setFacilities(Array.isArray(data) ? data : []);
        } else {
          toast?.({ title: 'Cảnh báo', description: 'Không lấy được danh sách phòng.' });
        }
      } catch (err) { setFacilities([]); }
    };
    fetchFacilities();
  }, [user?.campus]); 

  // Gọi API lấy Slot
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch('/api/Slot');
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

  // 2. Logic Lọc (useMemo) - Đã tối ưu hóa so sánh chuỗi
  const filteredFacilities = useMemo(() => {
    const sourceData = facilities.length > 0 ? facilities : mockRooms;
    const normalizedData: Room[] = sourceData.map((item: any) => {
      const isCampus1 = item.campusName 
        ? item.campusName.toLowerCase().includes('công nghệ cao') 
        : item.campus === 'campus1';
      return {
        id: String(item.facilityId || item.id),
        name: item.facilityCode || item.name,
        // Mapping quan trọng: Lấy typeName từ API Facilities để khớp với nút lọc
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
      
      const matchSearch = room.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          room.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // LOGIC LỌC THEO TYPE NAME (Bảo vệ case-insensitive)
      const matchType = selectedType === 'All' || 
                        room.type.toLowerCase() === selectedType.toLowerCase();

      return matchCampus && matchSearch && matchType;
    });
  }, [facilities, user?.campus, searchTerm, selectedType]);

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room);
    setShowDetailModal(true);
  };

  const handleBookNow = (room: Room) => {
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-100 via-white to-orange-50 -z-10 rounded-b-[4rem]" />
      
      <Header />
      
      <main className="container py-10 space-y-10 animate-fade-in">
        
        {/* Header Greeting & Campus Select */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Xin chào, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{user?.email.split('@')[0]}</span> 👋
            </h1>
            <p className="text-lg text-slate-500 font-medium">
              {user?.role === 'student' ? 'Sinh viên' : 'Giảng viên'} • Quản lý đặt phòng
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-slate-200 flex items-center">
             <div className="px-4 text-sm font-semibold text-slate-500">Khu vực:</div>
             <Select value={(user as any)?.campus || 'campus1'} onValueChange={(value: 'campus1' | 'campus2' | 'all') => handleCampusChange(value)}>
                <SelectTrigger className="w-[260px] border-0 bg-transparent focus:ring-0 text-base font-bold text-blue-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌍 Tất cả cơ sở</SelectItem>
                  <SelectItem value="campus1">🏢 Campus 1 - CNC</SelectItem>
                  <SelectItem value="campus2">🏛️ Campus 2 - NVH</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </div>

        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sticky top-4 z-30 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-md border border-white/50">
             <div className="flex items-center gap-2">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                    <Building2 className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Danh sách</h3>
                    <p className="text-xs text-slate-500 hidden md:block">Chọn phòng phù hợp để đặt lịch</p>
                </div>
             </div>
             <div className="relative w-full md:w-[400px] group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="search"
                  placeholder="Tìm theo tên phòng hoặc loại phòng..." 
                  className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          {/* 3. KHU VỰC LỌC NHANH (QUICK FILTER) */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 mr-2 shrink-0">
                <Filter className="h-4 w-4" />
                Lọc nhanh:
            </div> */}
            
            {/* Nút "Tất cả" */}
            <Button 
                variant={selectedType === 'All' ? 'default' : 'outline'}
                onClick={() => setSelectedType('All')}
                className={`rounded-full px-6 transition-all shrink-0 
                  ${selectedType === 'All' 
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-md' 
                    : 'border-slate-300 hover:border-blue-500 hover:text-blue-600 bg-white'}`}
            >
                Tất cả
            </Button>

            {/* Các nút Loại phòng từ Database */}
            {facilityTypes.map((type) => (
                <Button
                    key={type.typeId}
                    variant={selectedType === type.typeName ? 'default' : 'outline'}
                    onClick={() => setSelectedType(type.typeName)}
                    className={`rounded-full px-6 transition-all shrink-0 
                        ${selectedType === type.typeName 
                            ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-md' 
                            : 'border-slate-300 hover:border-blue-500 hover:text-blue-600 bg-white'}`}
                >
                    {type.typeName}
                </Button>
            ))}
          </div>

          {/* Danh sách phòng (Grid) */}
          <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="p-0">
              {filteredFacilities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                  <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-medium text-slate-600">Không tìm thấy phòng nào phù hợp</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredFacilities.map((roomObj) => {
                    const statusColor = roomObj.status === 'Available' ? 'text-emerald-600 bg-emerald-50' : 'text-orange-600 bg-orange-50';
                    const borderColor = roomObj.status === 'Available' ? 'group-hover:border-emerald-200' : 'group-hover:border-orange-200';

                    return (
                      <Card key={roomObj.id} className={`group overflow-hidden border border-slate-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl ${borderColor}`}>
                        <div className={`h-2 w-full ${roomObj.status === 'Available' ? 'bg-gradient-to-r from-emerald-400 to-green-300' : 'bg-gradient-to-r from-orange-400 to-red-300'}`} />
                        
                        <CardHeader className="pb-3 pt-5">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <Badge variant="outline" className="mb-1 text-[10px] text-slate-400 border-slate-200">
                                    {roomObj.campus === 'campus1' ? 'CNC' : 'NVH'}
                                </Badge>
                                <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                    {roomObj.name}
                                </CardTitle>
                                <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                    {roomObj.type}
                                </CardDescription>
                            </div>
                            <div className={`p-2 rounded-lg ${statusColor}`}>
                                {roomObj.status === 'Available' ? <Zap className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                             <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                                <Users className="h-4 w-4 text-blue-400" />
                                <span className="font-semibold">{roomObj.capacity}</span> <span className="text-xs">chỗ</span>
                             </div>
                             <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                                <MapPin className="h-4 w-4 text-red-400" />
                                <span className="text-xs truncate" title={`Tầng ${roomObj.floors}`}>Tầng {roomObj.floors || 'Trệt'}</span>
                             </div>
                          </div>

                          {roomObj.equipment && (
                             <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                <span className="truncate" title={roomObj.equipment}>{roomObj.equipment}</span>
                             </div>
                          )}

                          <div className="flex gap-2 mt-2">
                              <Button 
                                variant="outline"
                                className="flex-1 font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-blue-600 h-10 rounded-xl transition-all"
                                onClick={() => handleViewDetails(roomObj)}
                              >
                                <Info className="h-4 w-4 mr-1" />
                                Chi tiết
                              </Button>

                              <Button 
                                className={`flex-1 font-semibold shadow-md transition-all duration-300 h-10 rounded-xl
                                    ${roomObj.status === 'Available' 
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-blue-200 hover:-translate-y-0.5' 
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100'
                                    }`}
                                onClick={() => handleBookNow(roomObj)}
                                disabled={roomObj.status !== 'Available'}
                              >
                                {roomObj.status === 'Available' ? (
                                    <>
                                        <CalendarCheck className="h-4 w-4 mr-1" />
                                        Đặt ngay
                                    </>
                                ) : 'Bảo trì'}
                              </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal Chi tiết */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-0 rounded-2xl shadow-2xl">
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
                initialMode="details"
                user={user}
                toast={toast}
                onBookingComplete={() => setShowDetailModal(false)}
            />
            )}
        </DialogContent>
      </Dialog>

      {/* Modal Đặt phòng */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-0 rounded-2xl shadow-2xl">
            {selectedRoom && (
            <RoomDetailModal 
                room={selectedRoom} 
                onClose={() => setShowBookingModal(false)}
                onBooking={() => {}}
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
                initialMode="booking"
                user={user}
                toast={toast}
                onBookingComplete={() => setShowBookingModal(false)}
            />
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
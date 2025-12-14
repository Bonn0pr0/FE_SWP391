import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
    Plus, Pencil, Trash2, Search, RefreshCw, 
    Monitor, Presentation, Dumbbell, LayoutGrid 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// --- DATA TYPES & MOCK DATA ---
interface ManagedRoom {
  id: string;
  name: string;
  type: 'Meeting Room' | 'Computer Lab' | 'Sport Field' | 'Lecture Hall';
  campus: 'campus1' | 'campus2';
  capacity: number;
  floor: number;
  equipment: string[];
  status: 'available' | 'maintenance' | 'occupied';
  createdAt: string; // Thêm trường này để giống hình
}

const initialRooms: ManagedRoom[] = [
  {
    id: 'r1',
    name: 'Meeting Room A101',
    type: 'Meeting Room',
    campus: 'campus1',
    capacity: 20,
    floor: 1,
    equipment: ['Máy chiếu', 'Bảng trắng'],
    status: 'available',
    createdAt: '11/12/2025'
  },
  {
    id: 'r2',
    name: 'Computer Lab B201',
    type: 'Computer Lab',
    campus: 'campus1',
    capacity: 40,
    floor: 2,
    equipment: ['PC', 'Máy chiếu'],
    status: 'available',
    createdAt: '11/12/2025'
  },
  {
    id: 'r3',
    name: 'Sân bóng đá C1',
    type: 'Sport Field',
    campus: 'campus2',
    capacity: 100,
    floor: 0,
    equipment: ['Khung thành'],
    status: 'available',
    createdAt: '10/12/2025'
  },
  {
    id: 'r4',
    name: 'Lecture Hall D301',
    type: 'Lecture Hall',
    campus: 'campus2',
    capacity: 150,
    floor: 3,
    equipment: ['Âm thanh'],
    status: 'maintenance',
    createdAt: '09/12/2025'
  },
];

const roomTypes = ['Meeting Room', 'Computer Lab', 'Sport Field', 'Lecture Hall'] as const;
const campuses = [
  { value: 'campus1', label: 'Campus 1 - HCM' },
  { value: 'campus2', label: 'Campus 2 - HN' },
];

const emptyRoom: Omit<ManagedRoom, 'id' | 'createdAt'> = {
  name: '',
  type: 'Meeting Room',
  campus: 'campus1',
  capacity: 10,
  floor: 1,
  equipment: [],
  status: 'available',
};

// Helper để lấy Icon và màu nền dựa trên loại phòng (Giống hình)
const getTypeStyle = (type: string) => {
    switch (type) {
        case 'Computer Lab':
            return { icon: <Monitor className="w-5 h-5" />, color: 'bg-green-500 shadow-green-200' };
        case 'Meeting Room':
            return { icon: <Presentation className="w-5 h-5" />, color: 'bg-blue-500 shadow-blue-200' };
        case 'Sport Field':
            return { icon: <Dumbbell className="w-5 h-5" />, color: 'bg-orange-500 shadow-orange-200' };
        default:
            return { icon: <LayoutGrid className="w-5 h-5" />, color: 'bg-slate-500 shadow-slate-200' };
    }
};

export const AdminRoomManagement = () => {
  const [rooms, setRooms] = useState<ManagedRoom[]>(initialRooms);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<ManagedRoom | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<ManagedRoom | null>(null);
  const [formData, setFormData] = useState<Omit<ManagedRoom, 'id' | 'createdAt'>>(emptyRoom);
  const [equipmentInput, setEquipmentInput] = useState('');

  // ... (Logic Filter, Create, Edit, Delete giữ nguyên như cũ) ...
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || room.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setFormData(emptyRoom);
    setEquipmentInput('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (room: ManagedRoom) => {
    setEditingRoom(room);
    setFormData({
      name: room.name, type: room.type, campus: room.campus,
      capacity: room.capacity, floor: room.floor, equipment: room.equipment, status: room.status,
    });
    setEquipmentInput(room.equipment.join(', '));
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const equipmentList = equipmentInput.split(',').map((e) => e.trim()).filter((e) => e.length > 0);
    if (!formData.name.trim()) return toast({ title: 'Lỗi', description: 'Nhập tên phòng', variant: 'destructive' });

    if (editingRoom) {
      setRooms((prev) => prev.map((room) => room.id === editingRoom.id ? { ...formData, id: editingRoom.id, createdAt: room.createdAt, equipment: equipmentList } : room));
      toast({ title: 'Thành công', description: 'Đã cập nhật' });
    } else {
      const newRoom: ManagedRoom = { ...formData, id: `r${Date.now()}`, createdAt: new Date().toLocaleDateString('en-GB'), equipment: equipmentList };
      setRooms((prev) => [...prev, newRoom]);
      toast({ title: 'Thành công', description: 'Đã thêm mới' });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (roomToDelete) {
      setRooms((prev) => prev.filter((room) => room.id !== roomToDelete.id));
      toast({ title: 'Đã xóa', description: 'Xóa phòng thành công' });
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      
      {/* --- HEADER SECTION (Giống hình 1) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            {/* Title Gradient */}
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
                Quản Lý Phòng
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Danh sách các phòng học tập FPT University</p>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Nút Refresh tròn */}
            <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full border-slate-200 hover:bg-slate-100 w-10 h-10 text-slate-500"
                onClick={() => {}} 
            >
                <RefreshCw className="h-4 w-4" />
            </Button>

            {/* Nút Thêm mới: Gradient Cam, Pill-shape */}
            <Button 
                onClick={handleOpenCreate} 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full px-6 shadow-lg shadow-orange-200 transition-all border-none"
            >
                <Plus className="mr-2 h-4 w-4" /> Thêm phòng mới
            </Button>
        </div>
      </div>

      {/* --- MAIN CONTENT CARD --- */}
      <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden">
        
        {/* Toolbar: Search & Filter */}
        <div className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-100">
            <div className="relative w-full md:w-[400px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Tìm kiếm theo tên hoặc mô tả..." 
                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-lg h-10"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
            
            <div className="w-full md:w-[200px]">
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg h-10">
                        <SelectValue placeholder="Tất cả loại phòng" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả loại phòng</SelectItem>
                        {roomTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                <TableHead className="pl-6 py-4 font-semibold text-slate-600">Icon</TableHead>
                <TableHead className="font-semibold text-slate-600">Tên & Mô tả</TableHead>
                <TableHead className="font-semibold text-slate-600">Sức chứa</TableHead>
                <TableHead className="font-semibold text-slate-600">Ngày tạo</TableHead>
                <TableHead className="font-semibold text-slate-600">Trạng thái</TableHead>
                <TableHead className="text-right pr-6 font-semibold text-slate-600">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Không tìm thấy dữ liệu</TableCell></TableRow>
              ) : (
                filteredRooms.map((room) => {
                    const style = getTypeStyle(room.type);
                    return (
                    <TableRow key={room.id} className="hover:bg-slate-50 border-b border-slate-100 group transition-colors">
                        {/* Cột 1: Icon (Giống hình) */}
                        <TableCell className="pl-6 py-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white shadow-md ${style.color}`}>
                                {style.icon}
                            </div>
                        </TableCell>

                        {/* Cột 2: Tên & Campus (Mô tả) */}
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-700 text-sm">{room.name}</span>
                                <span className="text-xs text-slate-400 mt-0.5">
                                    {campuses.find(c => c.value === room.campus)?.label} • Tầng {room.floor}
                                </span>
                            </div>
                        </TableCell>

                        {/* Cột 3: Sức chứa (Badge Pastel giống hình) */}
                        <TableCell>
                             <Badge 
                                variant="secondary" 
                                className={`
                                    font-medium px-3 py-1 rounded-md border-none
                                    ${room.capacity >= 100 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}
                                `}
                             >
                                {room.capacity} chỗ
                            </Badge>
                        </TableCell>

                        {/* Cột 4: Ngày tạo */}
                        <TableCell className="text-slate-500 text-sm font-medium">
                            {room.createdAt}
                        </TableCell>

                        {/* Cột 5: Trạng thái (Dot Indicator giống hình) */}
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${
                                    room.status === 'available' ? 'bg-green-500' : 
                                    room.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></span>
                                <span className={`text-sm font-semibold ${
                                    room.status === 'available' ? 'text-green-600' : 
                                    room.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                    {room.status === 'available' ? 'Active' : room.status === 'maintenance' ? 'Maintenance' : 'Occupied'}
                                </span>
                            </div>
                        </TableCell>

                        {/* Cột 6: Hành động */}
                        <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost" size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                    onClick={() => handleOpenEdit(room)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost" size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                    onClick={() => { setRoomToDelete(room); setIsDeleteDialogOpen(true); }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                )})
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- DIALOGS (Giữ nguyên logic, chỉnh nhẹ style) --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Cập nhật phòng' : 'Thêm phòng mới'}</DialogTitle>
            <DialogDescription>Điền thông tin chi tiết vào biểu mẫu dưới đây.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên phòng</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="VD: Meeting Room A101" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại phòng</Label>
                <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{roomTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Campus</Label>
                <Select value={formData.campus} onValueChange={(v: any) => setFormData({ ...formData, campus: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{campuses.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {/* ... Các input khác giữ nguyên ... */}
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Tầng</Label>
                    <Input type="number" value={formData.floor} onChange={(e) => setFormData({...formData, floor: +e.target.value})}/>
                 </div>
                 <div className="space-y-2">
                    <Label>Sức chứa</Label>
                    <Input type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: +e.target.value})}/>
                 </div>
            </div>
             <div className="space-y-2">
              <Label>Trạng thái</Label>
                <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="available">Sẵn sàng</SelectItem>
                      <SelectItem value="maintenance">Bảo trì</SelectItem>
                      <SelectItem value="occupied">Đang sử dụng</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Thiết bị</Label>
                <Input value={equipmentInput} onChange={(e) => setEquipmentInput(e.target.value)} placeholder="VD: Máy chiếu, Loa..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">{editingRoom ? 'Cập nhật' : 'Thêm mới'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa phòng <strong>{roomToDelete?.name}</strong>? Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Xóa vĩnh viễn</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react'; // Thêm icon Loader
import { toast } from '@/hooks/use-toast';

// --- 1. ĐỊNH NGHĨA TYPE ---

// Type cho dữ liệu trả về từ API Backend (.NET)
interface ApiFacility {
  facilityId: number;
  facilityCode: string;
  capacity: number;
  floor: number;
  equipment: string | null;
  status: string;
  campusName: string;
  typeName: string;
}

// Type cho dữ liệu dùng trong React Component (UI)
interface ManagedRoom {
  id: string; // Map từ facilityId
  name: string; // Map từ facilityCode
  type: string; // Map từ typeName
  campus: string; // Map từ campusName
  capacity: number;
  floor: number;
  equipment: string[]; // Map từ chuỗi equipment
  status: string;
}

const API_URL = '/api/Faciliti';

// Các giá trị mặc định cho Select Box
const roomTypes = ['Classroom', 'Meeting Room', 'Computer Lab', 'Sport Field', 'Lecture Hall'];
const campuses = ['Co s? nhà van hóa', 'Co s? khu công ngh? cao', 'Campus 1', 'Campus 2']; 
// Lưu ý: Campus nên khớp với những gì Backend trả về hoặc chấp nhận

const statusOptions = [
  { value: 'Available', label: 'Sẵn sàng', color: 'bg-green-500' },
  { value: 'Active', label: 'Hoạt động', color: 'bg-blue-500' }, // Mapping với status backend
  { value: 'Maintenance', label: 'Bảo trì', color: 'bg-yellow-500' },
  { value: 'Occupied', label: 'Đang sử dụng', color: 'bg-red-500' },
];

const emptyRoom: Omit<ManagedRoom, 'id'> = {
  name: '',
  type: 'Classroom',
  campus: 'Co s? nhà van hóa',
  capacity: 30,
  floor: 1,
  equipment: [],
  status: 'Available',
};

export const AdminRoomManagement = () => {
  const [rooms, setRooms] = useState<ManagedRoom[]>([]);
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [searchQuery, setSearchQuery] = useState('');
  
  // State quản lý Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<ManagedRoom | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<ManagedRoom | null>(null);
  
  // State Form
  const [formData, setFormData] = useState<Omit<ManagedRoom, 'id'>>(emptyRoom);
  const [equipmentInput, setEquipmentInput] = useState('');

  // --- 2. CÁC HÀM GỌI API ---

  // Hàm load dữ liệu
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Không thể tải dữ liệu');
      const data: ApiFacility[] = await response.json();

      // Map dữ liệu từ API sang cấu trúc UI
      const mappedData: ManagedRoom[] = data.map((item) => ({
        id: item.facilityId.toString(),
        name: item.facilityCode || 'Chưa đặt tên',
        type: item.typeName || 'Khác',
        campus: item.campusName || 'Chưa xác định',
        capacity: item.capacity,
        floor: item.floor,
        equipment: item.equipment ? item.equipment.split(',').map(e => e.trim()) : [],
        status: item.status || 'Available',
      }));

      setRooms(mappedData);
    } catch (error) {
      console.error(error);
      toast({ title: 'Lỗi', description: 'Không thể kết nối đến server', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component được mount
  useEffect(() => {
    fetchRooms();
  }, []);

  // Filter local (Tìm kiếm trên client sau khi đã tải dữ liệu)
  const filteredRooms = rooms.filter((room) => {
    return room.name.toLowerCase().includes(searchQuery.toLowerCase());
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
      name: room.name,
      type: room.type,
      campus: room.campus,
      capacity: room.capacity,
      floor: room.floor,
      equipment: room.equipment,
      status: room.status,
    });
    setEquipmentInput(room.equipment.join(', '));
    setIsDialogOpen(true);
  };

  // --- 3. XỬ LÝ LƯU (CREATE / UPDATE) ---
  const handleSave = async () => {
    const equipmentString = equipmentInput; // Backend cần chuỗi, UI nhập chuỗi

    if (!formData.name.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập mã/tên phòng', variant: 'destructive' });
      return;
    }

    // Chuẩn bị payload gửi lên server
    const payload = {
      facilityCode: formData.name,
      capacity: formData.capacity,
      floor: formData.floor,
      equipment: equipmentString,
      status: formData.status,
      campusName: formData.campus,
      typeName: formData.type
    };

    try {
      if (editingRoom) {
        // --- API UPDATE ---
        const res = await fetch(`${API_URL}/update/${editingRoom.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Cập nhật thất bại');
        toast({ title: 'Thành công', description: 'Đã cập nhật thông tin phòng' });
      } else {
        // --- API CREATE ---
        const res = await fetch(`${API_URL}/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Thêm mới thất bại');
        toast({ title: 'Thành công', description: 'Đã thêm phòng mới' });
      }

      // Reload lại danh sách sau khi lưu thành công
      await fetchRooms();
      setIsDialogOpen(false);
      setEditingRoom(null);
    } catch (error) {
      console.error(error);
      toast({ title: 'Lỗi', description: 'Có lỗi xảy ra khi lưu dữ liệu', variant: 'destructive' });
    }
  };

  // --- 4. XỬ LÝ XÓA (DELETE) ---
  const handleDelete = async () => {
    if (roomToDelete) {
      try {
        const res = await fetch(`${API_URL}/${roomToDelete.id}`, {
          method: 'DELETE',
        });

        if (!res.ok) throw new Error('Xóa thất bại');
        
        toast({ title: 'Thành công', description: 'Đã xóa phòng' });
        await fetchRooms(); // Reload data
      } catch (error) {
        console.error(error);
        toast({ title: 'Lỗi', description: 'Không thể xóa phòng này', variant: 'destructive' });
      } finally {
        setIsDeleteDialogOpen(false);
        setRoomToDelete(null);
      }
    }
  };

  // Render Status Badge
  const getStatusBadge = (status: string) => {
    // Tìm trong options, nếu không thấy thì lấy mặc định hoặc hiển thị nguyên gốc
    const normalizedStatus = statusOptions.find(
      (s) => s.value.toLowerCase() === status.toLowerCase()
    );
    
    const color = normalizedStatus ? normalizedStatus.color : 'bg-gray-500';
    const label = normalizedStatus ? normalizedStatus.label : status;

    return (
      <Badge variant="outline" className="gap-1">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Quản lý phòng (API)</h1>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo mã phòng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Danh sách phòng {loading && <Loader2 className="inline h-4 w-4 animate-spin ml-2"/>}</CardTitle>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm phòng mới
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phòng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Cơ sở (Campus)</TableHead>
                <TableHead>Tầng</TableHead>
                <TableHead>Sức chứa</TableHead>
                <TableHead>Thiết bị</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                   <TableCell colSpan={8} className="text-center py-4">Đang tải dữ liệu...</TableCell>
                 </TableRow>
              ) : filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell>{room.type}</TableCell>
                    <TableCell>{room.campus}</TableCell>
                    <TableCell>{room.floor === 0 ? 'Tầng trệt' : `Tầng ${room.floor}`}</TableCell>
                    <TableCell>{room.capacity}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {room.equipment.slice(0, 2).map((eq, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {eq}
                          </Badge>
                        ))}
                        {room.equipment.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{room.equipment.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(room.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(room)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setRoomToDelete(room);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy phòng nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Thêm/Sửa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}</DialogTitle>
            <DialogDescription>
              {editingRoom ? 'Cập nhật thông tin phòng' : 'Nhập thông tin để tạo phòng mới'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Mã phòng / Tên phòng</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: P.A101"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại phòng</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Campus</Label>
                <Select
                  value={formData.campus}
                  onValueChange={(value) => setFormData({ ...formData, campus: value })}
                >
                  <SelectTrigger>
                     {/* Hiển thị giá trị hiện tại dù nó không có trong list mặc định */}
                    <SelectValue placeholder="Chọn cơ sở" />
                  </SelectTrigger>
                  <SelectContent>
                    {campuses.map((campus) => (
                      <SelectItem key={campus} value={campus}>{campus}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floor">Tầng</Label>
                <Input
                  id="floor"
                  type="number"
                  min="0"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Sức chứa</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${status.color}`} />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment">Thiết bị (phân cách bằng dấu phẩy)</Label>
              <Input
                id="equipment"
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                placeholder="VD: Máy chiếu, Bảng trắng"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave}>
              {editingRoom ? 'Cập nhật' : 'Thêm phòng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phòng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phòng "{roomToDelete?.name}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
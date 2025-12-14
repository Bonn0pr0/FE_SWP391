import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, RefreshCw, Search, UserPlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

// URL gốc
const API_BASE_URL = '/api/FacilityType';

export interface RoomType {
  id: number;
  name: string;
  description: string;
  icon: string;
  roomCount: number;
  createdAt: string;
}

// Helper để random màu nền cho Icon giống Avatar trong ảnh
const getIconColor = (index: number) => {
    const colors = [
        'bg-orange-500', // Giống màu N
        'bg-blue-500',   // Giống màu T
        'bg-green-500',  // Giống màu L
        'bg-emerald-500' // Giống màu P
    ];
    return colors[index % colors.length];
};

export const RoomTypeManager = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '🏢' });
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchRoomTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/GetListType`);
      if (!response.ok) throw new Error(`Lỗi kết nối`);
      const data = await response.json();
      const mappedData: RoomType[] = Array.isArray(data) ? data.map((item: any) => ({
        id: item.typeId,
        name: item.typeName,
        description: item.typeDescription || item.description || '',
        icon: '🏢',
        roomCount: item.facilitiCount || 0,
        createdAt: item.createAt || new Date().toISOString()
      })) : [];
      setRoomTypes(mappedData);
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể tải dữ liệu', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const handleCreate = async () => { /* ... Logic giữ nguyên ... */ };
  const handleEdit = async () => { /* ... Logic giữ nguyên ... */ };
  const handleDelete = async (id: number) => { /* ... Logic giữ nguyên ... */ };

  const openEditDialog = (roomType: RoomType) => {
    setEditingType(roomType);
    setFormData({ name: roomType.name, description: roomType.description, icon: roomType.icon });
    setIsEditOpen(true);
  };

  const filteredRoomTypes = roomTypes.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      
      {/* --- HEADER SECTION: Giống hệt ảnh --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          {/* Gradient Text Title */}
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
            Quản Lý Loại Phòng
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Danh sách các loại phòng trong FPT University</p>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Nút Refresh tròn */}
            <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full border-slate-200 hover:bg-slate-100 hover:text-slate-600 w-10 h-10"
                onClick={fetchRoomTypes}
            >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            {/* Nút Thêm mới: Gradient Cam, bo tròn */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full px-6 shadow-lg shadow-orange-200 transition-all">
                        <UserPlus className="mr-2 h-4 w-4" /> Thêm loại phòng
                    </Button>
                </DialogTrigger>
                {/* Dialog Content Giữ nguyên */}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm loại phòng</DialogTitle>
                        <DialogDescription>Nhập thông tin chi tiết bên dưới.</DialogDescription>
                    </DialogHeader>
                    {/* Form Inputs ... */}
                    <div className="grid gap-4 py-4">
                         <div className="grid gap-2">
                            <Label>Tên loại phòng</Label>
                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                         </div>
                         <div className="grid gap-2">
                            <Label>Mô tả</Label>
                            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                         </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
                        <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600">Lưu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* --- MAIN CARD --- */}
      <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden">
        
        {/* Toolbar: Input search dài + Dropdown bên phải */}
        <div className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-100">
            <div className="relative w-full md:w-[400px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Tìm kiếm theo tên hoặc mô tả..." 
                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-lg"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
            
            {/* Giả lập Dropdown "Tất cả vai trò" trong ảnh */}
            <div className="w-full md:w-[200px]">
                <Select>
                    <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg">
                        <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="active">Hoạt động</SelectItem>
                        <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                <TableHead className="pl-6 font-semibold text-slate-600">Icon</TableHead>
                <TableHead className="font-semibold text-slate-600">Tên & Mô tả</TableHead>
                <TableHead className="font-semibold text-slate-600">Số lượng</TableHead>
                <TableHead className="font-semibold text-slate-600">Ngày tạo</TableHead>
                <TableHead className="font-semibold text-slate-600">Trạng thái</TableHead>
                <TableHead className="text-right pr-6 font-semibold text-slate-600">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-orange-500"/></TableCell></TableRow>
              ) : filteredRoomTypes.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-400">Không có dữ liệu.</TableCell></TableRow>
              ) : (
                filteredRoomTypes.map((roomType, index) => (
                  <TableRow key={roomType.id} className="hover:bg-slate-50 border-b border-slate-100 group">
                    {/* Cột 1: Icon giống Avatar */}
                    <TableCell className="pl-6 py-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-lg shadow-sm ${getIconColor(index)}`}>
                            {roomType.icon}
                        </div>
                    </TableCell>

                    {/* Cột 2: Tên & Email (Mô tả) */}
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-700 text-sm">{roomType.name}</span>
                            <span className="text-xs text-slate-400 truncate max-w-[200px]">{roomType.description}</span>
                        </div>
                    </TableCell>

                    {/* Cột 3: Vai trò (Số lượng) - Style Badge Pastel */}
                    <TableCell>
                         <Badge 
                            variant="secondary" 
                            className={`
                                font-normal px-3 py-1 rounded-md
                                ${index % 3 === 0 ? 'bg-orange-100 text-orange-600' : 
                                  index % 3 === 1 ? 'bg-blue-100 text-blue-600' : 
                                  'bg-green-100 text-green-600'}
                            `}
                         >
                            {roomType.roomCount} phòng
                        </Badge>
                    </TableCell>

                     {/* Cột 4: Ngày tạo (Thay cho Email phụ) */}
                     <TableCell className="text-slate-500 text-sm">
                        {new Date(roomType.createdAt).toLocaleDateString('vi-VN')}
                     </TableCell>

                    {/* Cột 5: Trạng thái Active */}
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            <span className="text-green-600 font-medium text-sm">Active</span>
                        </div>
                    </TableCell>

                    {/* Cột 6: Hành động (Hiện icon trực tiếp) */}
                    <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => openEditDialog(roomType)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                                        <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(roomType.id)} className="bg-red-600">Xóa</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* --- EDIT DIALOG --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Cập nhật thông tin</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label>Tên loại phòng</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                    <Label>Mô tả</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
                <Button onClick={handleEdit} className="bg-orange-500 hover:bg-orange-600 text-white">Lưu thay đổi</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
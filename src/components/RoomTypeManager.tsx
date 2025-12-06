import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Building, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// URL gốc (đã qua Proxy Vite)
const API_BASE_URL = '/api/FacilityType';

export interface RoomType {
  id: number;
  name: string;
  description: string;
  icon: string;
  roomCount: number;
  createdAt: string;
}

export const RoomTypeManager = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '🏢' });
  const { toast } = useToast();

  // 1. GET: Lấy danh sách
  const fetchRoomTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/GetListType`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`Lỗi kết nối: ${response.statusText}`);
      
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
      console.error("Fetch Error:", error);
      toast({ title: 'Lỗi', description: 'Không thể tải dữ liệu', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  // 2. POST: Thêm mới
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập tên loại phòng', variant: 'destructive' });
      return;
    }

    try {
      const payload = {
        typeName: formData.name,
        description: formData.description,
      };

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Thêm thất bại');

      await fetchRoomTypes();
      setFormData({ name: '', description: '', icon: '🏢' });
      setIsCreateOpen(false);
      toast({ title: 'Thành công', description: 'Đã thêm loại phòng mới' });
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Có lỗi xảy ra khi thêm mới', variant: 'destructive' });
    }
  };

  // --- 3. PUT: Cập nhật (ĐÃ SỬA THEO CURL) ---
  const handleEdit = async () => {
    if (!editingType) return;

    try {
      // Body chỉ chứa thông tin cần sửa (không gửi typeId trong body)
      const payload = {
        typeName: formData.name,
        description: formData.description
      };

      // URL sử dụng Query Parameter: ?id=...
      const response = await fetch(`${API_BASE_URL}?id=${editingType.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Cập nhật thất bại');

      await fetchRoomTypes();
      setEditingType(null);
      setFormData({ name: '', description: '', icon: '🏢' });
      setIsEditOpen(false);
      toast({ title: 'Thành công', description: 'Đã cập nhật thông tin' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Lỗi', description: 'Có lỗi xảy ra khi cập nhật', variant: 'destructive' });
    }
  };

  // 4. DELETE: Xóa
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Xóa thất bại');

      await fetchRoomTypes();
      toast({ title: 'Thành công', description: 'Đã xóa loại phòng' });
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể xóa loại phòng này', variant: 'destructive' });
    }
  };

  const openEditDialog = (roomType: RoomType) => {
    setEditingType(roomType);
    setFormData({ name: roomType.name, description: roomType.description, icon: roomType.icon });
    setIsEditOpen(true);
  };

  const iconOptions = ['🏢', '💻', '⚽', '🎓', '📚', '🎯', '🏋️', '🎨', '🎵', '🔬'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Quản lý loại phòng
            </CardTitle>
            <CardDescription>Thêm, sửa, xóa các loại phòng trong hệ thống</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchRoomTypes} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Thêm loại phòng
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm loại phòng mới</DialogTitle>
                  <DialogDescription>Nhập thông tin loại phòng mới</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên loại phòng *</Label>
                    <Input
                      id="name"
                      placeholder="Ví dụ: Meeting Room"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      placeholder="Mô tả về loại phòng..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon (Local)</Label>
                    <div className="flex flex-wrap gap-2">
                      {iconOptions.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon })}
                          className={`h-10 w-10 rounded-md text-xl flex items-center justify-center border-2 transition-all ${
                            formData.icon === icon 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
                  <Button onClick={handleCreate}>Thêm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Icon</TableHead>
                <TableHead>Tên loại phòng</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-center">Số phòng</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomTypes.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        Không có dữ liệu
                    </TableCell>
                 </TableRow>
              ) : (
                roomTypes.map((roomType) => (
                <TableRow key={roomType.id}>
                  <TableCell className="text-2xl">{roomType.icon}</TableCell>
                  <TableCell className="font-medium">{roomType.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {roomType.description}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{roomType.roomCount}</Badge>
                  </TableCell>
                  <TableCell>{new Date(roomType.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(roomType)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa "{roomType.name}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(roomType.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Sửa loại phòng</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>Tên loại phòng *</Label>
                <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>
            </div>
            <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
            <Button onClick={handleEdit}>Lưu</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    </Card>
  );
};
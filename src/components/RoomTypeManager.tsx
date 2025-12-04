import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface RoomType {
  id: string;
  name: string;
  description: string;
  icon: string;
  roomCount: number;
  createdAt: string;
}

const initialRoomTypes: RoomType[] = [
  {
    id: 'rt1',
    name: 'Meeting Room',
    description: 'Phòng họp dành cho các cuộc họp nhóm, hội nghị nhỏ',
    icon: '🏢',
    roomCount: 2,
    createdAt: '2025-01-01',
  },
  {
    id: 'rt2',
    name: 'Computer Lab',
    description: 'Phòng máy tính dành cho học tập và thực hành',
    icon: '💻',
    roomCount: 2,
    createdAt: '2025-01-01',
  },
  {
    id: 'rt3',
    name: 'Sport Field',
    description: 'Sân thể thao cho các hoạt động thể dục, thể thao',
    icon: '⚽',
    roomCount: 4,
    createdAt: '2025-01-01',
  },
  {
    id: 'rt4',
    name: 'Lecture Hall',
    description: 'Giảng đường lớn dành cho các buổi giảng, hội thảo',
    icon: '🎓',
    roomCount: 1,
    createdAt: '2025-01-01',
  },
];

export const RoomTypeManager = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(initialRoomTypes);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '🏢' });
  const { toast } = useToast();

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập tên loại phòng', variant: 'destructive' });
      return;
    }

    const newRoomType: RoomType = {
      id: `rt${Date.now()}`,
      name: formData.name,
      description: formData.description,
      icon: formData.icon || '🏢',
      roomCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRoomTypes([...roomTypes, newRoomType]);
    setFormData({ name: '', description: '', icon: '🏢' });
    setIsCreateOpen(false);
    toast({ title: 'Thành công', description: 'Đã thêm loại phòng mới' });
  };

  const handleEdit = () => {
    if (!editingType || !formData.name.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập tên loại phòng', variant: 'destructive' });
      return;
    }

    setRoomTypes(roomTypes.map(rt => 
      rt.id === editingType.id 
        ? { ...rt, name: formData.name, description: formData.description, icon: formData.icon }
        : rt
    ));
    setEditingType(null);
    setFormData({ name: '', description: '', icon: '🏢' });
    setIsEditOpen(false);
    toast({ title: 'Thành công', description: 'Đã cập nhật loại phòng' });
  };

  const handleDelete = (id: string) => {
    const roomType = roomTypes.find(rt => rt.id === id);
    if (roomType && roomType.roomCount > 0) {
      toast({ 
        title: 'Không thể xóa', 
        description: `Loại phòng này đang có ${roomType.roomCount} phòng. Vui lòng xóa các phòng trước.`, 
        variant: 'destructive' 
      });
      return;
    }
    setRoomTypes(roomTypes.filter(rt => rt.id !== id));
    toast({ title: 'Thành công', description: 'Đã xóa loại phòng' });
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
                  <Label>Icon</Label>
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
      </CardHeader>
      <CardContent>
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
            {roomTypes.map((roomType) => (
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
                            Bạn có chắc chắn muốn xóa loại phòng "{roomType.name}"? 
                            {roomType.roomCount > 0 && (
                              <span className="block mt-2 text-destructive font-medium">
                                Cảnh báo: Loại phòng này đang có {roomType.roomCount} phòng.
                              </span>
                            )}
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
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa loại phòng</DialogTitle>
            <DialogDescription>Cập nhật thông tin loại phòng</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên loại phòng *</Label>
              <Input
                id="edit-name"
                placeholder="Ví dụ: Meeting Room"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                placeholder="Mô tả về loại phòng..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
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
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
            <Button onClick={handleEdit}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
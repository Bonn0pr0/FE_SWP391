import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/hooks/use-toast";

// --- 1. ĐỊNH NGHĨA TYPE ---

interface ApiCampus {
  campusId: number;
  campusName: string;
  phone?: string;
  status?: string;
}

interface ApiFacilityType {
  typeId: number;
  typeName: string;
  description?: string;
}

interface ManagedRoom {
  id: string;
  name: string;
  type: string;
  campus: string;
  capacity: number;
  floor: number;
  equipment: string[];
  status: string;
}

// URL GỐC
const API_BASE_URL = "/api";

const statusOptions = [
  { value: "Available", label: "Sẵn sàng", color: "bg-green-500" },
  { value: "Active", label: "Hoạt động", color: "bg-blue-500" },
  { value: "Maintenance", label: "Bảo trì", color: "bg-yellow-500" },
  { value: "Occupied", label: "Đang sử dụng", color: "bg-red-500" },
];

const emptyRoom: Omit<ManagedRoom, "id"> = {
  name: "",
  type: "",
  campus: "",
  capacity: 30,
  floor: 1,
  equipment: [],
  status: "Available",
};

// --- HÀM HELPER: TÌM TẦNG AN TOÀN ---
// Hàm này sẽ quét tất cả các key trong object trả về để tìm key nào là "floor" (bất chấp hoa thường)
const getSafeFloorValue = (item: any): number => {
  if (!item) return 0;

  // 1. Kiểm tra trực tiếp các trường phổ biến
  if (item.floor !== undefined && item.floor !== null)
    return Number(item.floor);
  if (item.Floor !== undefined && item.Floor !== null)
    return Number(item.Floor);
  if (item.FloorNumber !== undefined && item.FloorNumber !== null)
    return Number(item.FloorNumber);

  // 2. Quét toàn bộ key để tìm "floor" (case-insensitive)
  const keys = Object.keys(item);
  const floorKey = keys.find((k) => k.toLowerCase().includes("floor")); // Tìm key có chứa chữ 'floor'

  if (floorKey && item[floorKey] !== null && item[floorKey] !== undefined) {
    return Number(item[floorKey]);
  }

  return 0; // Mặc định nếu không tìm thấy gì
};

export const AdminRoomManagement = () => {
  const [rooms, setRooms] = useState<ManagedRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [campusList, setCampusList] = useState<ApiCampus[]>([]);
  const [typeList, setTypeList] = useState<ApiFacilityType[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<ManagedRoom | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<ManagedRoom | null>(null);

  const [formData, setFormData] = useState<Omit<ManagedRoom, "id">>(emptyRoom);
  const [equipmentInput, setEquipmentInput] = useState("");

  // --- 2. CÁC HÀM GỌI API ---

  const fetchMetadata = async () => {
    try {
      const campusRes = await fetch(`${API_BASE_URL}/Campus`);
      if (campusRes.ok) setCampusList(await campusRes.json());

      const typeRes = await fetch(`${API_BASE_URL}/FacilityType`);
      if (typeRes.ok) setTypeList(await typeRes.json());
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Faciliti/List`);

      if (!response.ok) throw new Error("Không thể tải dữ liệu");
      const data: any[] = await response.json(); // Dùng any[] để linh hoạt

      console.log("=== API DATA ===", data); // Check log F12 để xem tên biến thật sự

      const mappedData: ManagedRoom[] = data.map((item) => {
        // Dùng hàm helper để lấy tầng chính xác nhất
        const floorVal = getSafeFloorValue(item);

        return {
          id: item.facilityId?.toString() || item.FacilityId?.toString() || "",
          name: item.facilityCode || item.FacilityCode || "Chưa đặt tên",
          type: item.typeName || item.TypeName || "",
          campus: item.campusName || item.CampusName || "",
          capacity: Number(item.capacity || item.Capacity || 0),

          // Gán giá trị tầng đã xử lý
          floor: isNaN(floorVal) ? 0 : floorVal,

          equipment: (item.equipment || item.Equipment || "")
            .split(",")
            .map((e: string) => e.trim())
            .filter((e: string) => e),
          status: item.status || item.Status || "Available",
        };
      });

      setRooms(mappedData);
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchMetadata();
  }, []);

  const filteredRooms = rooms.filter((room) => {
    return room.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setFormData(emptyRoom);
    setEquipmentInput("");
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
    setEquipmentInput(room.equipment.join(", "));
    setIsDialogOpen(true);
  };

  // --- 3. XỬ LÝ LƯU (CREATE / UPDATE) ---
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã/tên phòng",
        variant: "destructive",
      });
      return;
    }
    if (!formData.type) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn loại phòng",
        variant: "destructive",
      });
      return;
    }
    if (!formData.campus) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn cơ sở",
        variant: "destructive",
      });
      return;
    }

    // --- PAYLOAD CHUẨN PASCAL CASE CHO .NET ---
    const payload = {
      FacilityId: editingRoom ? parseInt(editingRoom.id) : 0,
      FacilityCode: formData.name, // PascalCase
      Capacity: formData.capacity, // PascalCase
      Floor: formData.floor, // PascalCase
      Equipment: equipmentInput, // PascalCase
      Status: formData.status, // PascalCase
      CampusName: formData.campus,
      TypeName: formData.type,
    };

    console.log("Payload gửi đi:", payload);

    try {
      if (editingRoom) {
        // --- API UPDATE ---
        const res = await fetch(
          `${API_BASE_URL}/Faciliti/update/${editingRoom.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Lỗi update từ server:", errorText);
          throw new Error(`Cập nhật thất bại: ${res.status}`);
        }

        toast({
          title: "Thành công",
          description: "Đã cập nhật thông tin phòng",
        });
      } else {
        // --- API CREATE ---
        const res = await fetch(`${API_BASE_URL}/Faciliti/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Thêm mới thất bại");
        toast({ title: "Thành công", description: "Đã thêm phòng mới" });
      }

      await fetchRooms();
      setIsDialogOpen(false);
      setEditingRoom(null);
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi lưu dữ liệu",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (roomToDelete) {
      try {
        const res = await fetch(`${API_BASE_URL}/Faciliti/${roomToDelete.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Xóa thất bại");

        toast({ title: "Thành công", description: "Đã xóa phòng" });
        await fetchRooms();
      } catch (error) {
        console.error(error);
        toast({
          title: "Lỗi",
          description: "Không thể xóa phòng này",
          variant: "destructive",
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setRoomToDelete(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = statusOptions.find(
      (s) => s.value.toLowerCase() === status.toLowerCase()
    );
    const color = normalizedStatus ? normalizedStatus.color : "bg-gray-500";
    const label = normalizedStatus ? normalizedStatus.label : status;
    return (
      <Badge variant="outline" className="gap-1">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Quản lý phòng</h1>
          <p className="text-muted-foreground">Danh sách các phòng học tập</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchRooms}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
          </Button>
          <Button onClick={handleOpenCreate} className="bg-primary">
            <Plus className="mr-2 h-4 w-4" /> Thêm mới
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
              <Input
                placeholder="Tìm kiếm..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã phòng</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Cơ sở</TableHead>
                  <TableHead>Tầng</TableHead>
                  <TableHead>Sức chứa</TableHead>
                  <TableHead>Thiết bị</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>{room.campus}</TableCell>
                      <TableCell>
                        {room.floor === 0 ? "Tầng trệt" : `Tầng ${room.floor}`}
                      </TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {room.equipment.slice(0, 2).map((eq, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
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
                      <TableCell>
                        <span
                          className={`text-sm font-bold ${
                            room.status === "Available"
                              ? "text-green-600"
                              : room.status === "Maintenance"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {room.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(room)}
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <AlertDialog>
                          <AlertDialog>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setRoomToDelete(room);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </AlertDialog>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không tìm thấy phòng nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? "Cập nhật thông tin" : "Thêm phòng mới"}
            </DialogTitle>
            <DialogDescription>
              {editingRoom ? "Sửa thông tin chi tiết." : "Tạo phòng mới."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Mã phòng</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại phòng</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeList.map((t) => (
                      <SelectItem key={t.typeId} value={t.typeName}>
                        {t.typeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cơ sở</Label>
                <Select
                  value={formData.campus}
                  onValueChange={(v) => setFormData({ ...formData, campus: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {campusList.map((c) => (
                      <SelectItem key={c.campusId} value={c.campusName}>
                        {c.campusName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tầng</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.floor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      floor: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Sức chứa</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Sẵn sàng</SelectItem>
                    <SelectItem value="Active">Hoạt động</SelectItem>
                    <SelectItem value="Maintenance">Bảo trì</SelectItem>
                    <SelectItem value="Occupied">Đang sử dụng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Thiết bị (phân cách bằng dấu phẩy)</Label>
              <Input
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                placeholder="VD: Máy chiếu, Bảng trắng"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {editingRoom ? "Lưu" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Không thể hoàn tác hành động này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default AdminRoomManagement;

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card"; // Rút gọn import cho gọn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, UserPlus, Loader2, Trash2, RefreshCw, Eye, EyeOff, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  status: string;
  roleName: string;
}

// ⚠️ QUAN TRỌNG: Hãy đổi PORT này thành PORT backend .NET của bạn (Ví dụ: 44338, 7001, 5000...)
// Kiểm tra file launchSettings.json trong Visual Studio để biết chính xác.
const BACKEND_DOMAIN = ""; 
const API_BASE_URL = `${BACKEND_DOMAIN}/api/User`;

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State Dialog & Edit
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    organization: "FPT University",
    roleName: "Student",
    status: "Active",
  });

  // 1. Fetch Users (GET)
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Gọi đúng vào endpoint /Infor
      const response = await fetch(`${API_BASE_URL}/Infor`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      
      const mappedUsers = data.map((u: any) => ({
        ...u,
        fullName: u.name, // Map name từ API sang fullName
        phone: u.phone || "N/A"
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error(error);
      toast({ title: "Lỗi tải danh sách", description: "Kiểm tra lại Backend Server có đang chạy không?", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2. Reset Form khi mở modal Thêm mới
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      fullName: "", email: "", password: "", phone: "", 
      organization: "FPT University", roleName: "Student", status: "Active"
    });
    setIsDialogOpen(true);
  };

  // 3. Fill Form khi mở modal Sửa
  const handleOpenEdit = (user: User) => {
    setIsEditing(true);
    setCurrentUserId(user.id);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: "", 
      phone: user.phone === "N/A" ? "" : user.phone || "",
      organization: "FPT University",
      roleName: user.roleName,
      status: user.status
    });
    setIsDialogOpen(true);
  };

  // 4. Xử lý Submit (POST / PUT)
  const handleSaveUser = async () => {
    // Validate cơ bản
    if (!formData.fullName || !formData.email) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng nhập Tên và Email", variant: "destructive" });
      return;
    }

    try {
      let url = "";
      let method = "";

      if (isEditing && currentUserId) {
        // --- LOGIC SỬA (UPDATE) ---
        // Thường là PUT vào /api/User/{id} hoặc /api/User/Update/{id}
        url = `${API_BASE_URL}/${currentUserId}`; 
        method = 'PUT';
      } else {
        // --- LOGIC THÊM MỚI (CREATE) ---
        // ⚠️ QUAN TRỌNG: Thử endpoint /Create hoặc /Register
        // Vì bạn dùng /Infor nên endpoint tạo mới 99% là /Create
        url = `${API_BASE_URL}/Create`; 
        method = 'POST';
      }

      console.log(`Calling API: ${method} ${url}`, formData); // Log để debug

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(formData)
      });

      // Kiểm tra response
      if (response.ok || response.status === 201 || response.status === 204) {
        toast({
          title: "Thành công",
          description: isEditing ? "Cập nhật thành công" : "Thêm mới thành công",
          className: "bg-green-600 text-white",
        });
        setIsDialogOpen(false);
        fetchUsers(); // Load lại bảng
      } else {
        // Đọc lỗi từ backend trả về
        const errorText = await response.text();
        console.error("Server Error:", errorText);
        throw new Error(errorText || `Lỗi HTTP ${response.status}`);
      }

    } catch (error: any) {
      console.error("Save User Error:", error);
      
      let errorMsg = "Không thể lưu dữ liệu.";
      if (error.message.includes("405")) errorMsg = "Lỗi 405: Sai đường dẫn API (Method Not Allowed).";
      if (error.message.includes("404")) errorMsg = "Lỗi 404: Không tìm thấy API (Sai đường dẫn).";
      if (error.message.includes("Failed to fetch")) errorMsg = "Lỗi kết nối: Server chưa chạy hoặc sai PORT.";

      toast({ 
        title: "Lỗi", 
        description: errorMsg, 
        variant: "destructive" 
      });
    }
  };

  // 5. Xóa User
  const handleDeleteUser = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      if (response.ok || response.status === 204) {
        toast({ title: "Đã xóa thành công", className: "bg-green-600 text-white" });
        fetchUsers();
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      toast({ title: "Lỗi xóa", variant: "destructive" });
    }
  };

  const filteredUsers = users.filter(user => 
    (roleFilter === "all" || user.roleName === roleFilter) &&
    (user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
          <p className="text-muted-foreground">Danh sách người dùng FPTU</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchUsers}>
                <RefreshCw className={isLoading ? "animate-spin" : ""} />
            </Button>
            <Button onClick={handleOpenAdd} className="bg-primary">
                <UserPlus className="mr-2 h-4 w-4" /> Thêm mới
            </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Tìm kiếm..." 
                className="pl-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Vai trò" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Lecturer">Lecturer</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Badge variant="outline">{user.roleName}</Badge></TableCell>
                    <TableCell>
                        <span className={`text-sm font-bold ${user.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>
                            {user.status}
                        </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(user)}>
                            <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                                    <AlertDialogDescription>Không thể hoàn tác hành động này.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-red-600">
                                        Xóa
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>{isEditing ? "Cập nhật thông tin" : "Thêm người dùng mới"}</DialogTitle>
                <DialogDescription>{isEditing ? "Sửa thông tin chi tiết." : "Tạo tài khoản mới."}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label>Họ và Tên</Label>
                    <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Mật khẩu {isEditing && "(Để trống nếu không đổi)"}</Label>
                    <div className="relative">
                        <Input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Số điện thoại</Label>
                        <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Vai trò</Label>
                        <Select value={formData.roleName} onValueChange={v => setFormData({...formData, roleName: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Student">Student</SelectItem>
                                <SelectItem value="Lecturer">Lecturer</SelectItem>
                                <SelectItem value="Facility Admin">Facility Admin</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleSaveUser}>{isEditing ? "Lưu" : "Tạo mới"}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
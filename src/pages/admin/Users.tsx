import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { 
  Search, UserPlus, Loader2, Trash2, RefreshCw, Eye, EyeOff, Pencil, 
  Users as UsersIcon, ShieldCheck, GraduationCap 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Nếu chưa có component này thì dùng div tròn thay thế

interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  status: string;
  roleName: string;
}

// ⚠️ Cấu hình Backend
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
    fullName: "", email: "", password: "", phone: "", 
    organization: "FPT University", roleName: "Student", status: "Active",
  });

  // --- LOGIC GIỮ NGUYÊN ---
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Infor`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      const mappedUsers = data.map((u: any) => ({
        ...u, fullName: u.name, phone: u.phone || "N/A"
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error(error);
      toast({ title: "Lỗi tải danh sách", description: "Không thể kết nối Server", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ fullName: "", email: "", password: "", phone: "", organization: "FPT University", roleName: "Student", status: "Active" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setIsEditing(true);
    setCurrentUserId(user.id);
    setFormData({
      fullName: user.fullName, email: user.email, password: "", 
      phone: user.phone === "N/A" ? "" : user.phone || "",
      organization: "FPT University", roleName: user.roleName, status: user.status
    });
    setIsDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.fullName || !formData.email) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng nhập Tên và Email", variant: "destructive" });
      return;
    }
    try {
      let url = isEditing && currentUserId ? `${API_BASE_URL}/${currentUserId}` : `${API_BASE_URL}/Create`;
      let method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
        body: JSON.stringify(formData)
      });

      if (response.ok || response.status === 201 || response.status === 204) {
        toast({ title: "Thành công", description: isEditing ? "Đã cập nhật" : "Đã thêm mới", className: "bg-green-600 text-white" });
        setIsDialogOpen(false);
        fetchUsers();
      } else {
        const errorText = await response.text();
        throw new Error(errorText || `Lỗi HTTP ${response.status}`);
      }
    } catch (error: any) {
      toast({ title: "Lỗi", description: "Thao tác thất bại", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      if (response.ok || response.status === 204) {
        toast({ title: "Đã xóa", className: "bg-green-600 text-white" });
        fetchUsers();
      } else throw new Error("Delete failed");
    } catch (error) {
      toast({ title: "Lỗi xóa", variant: "destructive" });
    }
  };

  const filteredUsers = users.filter(user => 
    (roleFilter === "all" || user.roleName === roleFilter) &&
    (user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // --- HELPER MÀU SẮC ---
  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'Admin': return 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200'; // Cam
      case 'Facility Admin': return 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100';
      case 'Lecturer': return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'; // Xanh dương
      default: return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'; // Student - Xanh lá
    }
  };

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  }

  // --- GIAO DIỆN ---
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-8 font-sans">
      
      {/* 1. Header Section với Gradient Text */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500">
            Quản Lý Người Dùng
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Danh sách người dùng FPT University</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" size="icon" onClick={fetchUsers} className="rounded-full hover:bg-blue-50 hover:text-blue-600 border-slate-200">
                <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin text-orange-500" : ""}`} />
            </Button>
            <Button onClick={handleOpenAdd} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-200 rounded-full px-6 transition-all hover:scale-105">
                <UserPlus className="mr-2 h-5 w-5" /> Thêm thành viên
            </Button>
        </div>
      </div>

      {/* 2. Stats Cards - Màu sắc chủ đạo */}
      {/* <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md bg-white hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-2 bg-orange-500 group-hover:w-full group-hover:opacity-10 transition-all duration-500"/>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng người dùng</CardTitle>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <UsersIcon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{users.length}</div>
              <p className="text-xs text-orange-500 font-semibold mt-1">+12% so với tháng trước</p>
            </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-2 bg-green-500 group-hover:w-full group-hover:opacity-10 transition-all duration-500"/>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Sinh viên (Active)</CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <GraduationCap className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {users.filter(u => u.roleName === 'Student').length}
              </div>
              <p className="text-xs text-green-500 font-semibold mt-1">Đang hoạt động tốt</p>
            </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-2 bg-blue-500 group-hover:w-full group-hover:opacity-10 transition-all duration-500"/>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Giảng viên & Admin</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                 {users.filter(u => u.roleName !== 'Student').length}
              </div>
              <p className="text-xs text-blue-500 font-semibold mt-1">Nhân sự quản lý</p>
            </CardContent>
        </Card>
      </div> */}

      {/* 3. Main Table Card */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          
          {/* Filters Bar */}
          <div className="p-6 flex flex-col sm:flex-row gap-4 border-b border-slate-100 bg-white">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
              <Input 
                placeholder="Tìm kiếm theo tên hoặc email..." 
                className="pl-10 h-10 border-slate-200 focus-visible:ring-orange-500 focus-visible:ring-offset-0 rounded-lg bg-slate-50 focus:bg-white transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[200px] h-10 border-slate-200 rounded-lg focus:ring-blue-500">
                    <SelectValue placeholder="Lọc theo vai trò" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    <SelectItem value="Facility Admin">Facility Admin</SelectItem>
                    <SelectItem value="Lecturer">Lecturer</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50">
                  <TableHead className="w-[80px] pl-6">Avatar</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Họ và Tên</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Email</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Vai trò</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Trạng thái</TableHead>
                  <TableHead className="text-right pr-6 text-slate-600 font-semibold">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center">
                            <div className="flex flex-col items-center justify-center text-slate-400">
                                <Search className="h-10 w-10 mb-2 opacity-20" />
                                <p>Không tìm thấy người dùng nào</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredUsers.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-blue-50/30 transition-colors border-b border-slate-50">
                        <TableCell className="pl-6 py-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm
                                ${user.roleName === 'Student' ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 
                                  user.roleName === 'Lecturer' ? 'bg-gradient-to-br from-blue-400 to-indigo-600' : 
                                  'bg-gradient-to-br from-orange-400 to-red-600'}`}
                            >
                                {getInitials(user.fullName)}
                            </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">{user.fullName}</TableCell>
                        <TableCell className="text-slate-500">{user.email}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className={`rounded-md px-3 py-1 font-normal ${getRoleBadgeColor(user.roleName)}`}>
                                {user.roleName}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${user.status === 'Active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
                                <span className={`text-sm font-medium ${user.status === 'Active' ? 'text-green-700' : 'text-red-600'}`}>
                                    {user.status}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(user)} className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 rounded-full">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100 hover:text-red-600 rounded-full">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-xl">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-red-600">Xác nhận xóa người dùng?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Hành động này sẽ xóa <b>{user.fullName}</b> khỏi hệ thống và không thể hoàn tác.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-lg">Hủy bỏ</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-red-600 hover:bg-red-700 rounded-lg">
                                                Xác nhận xóa
                                            </AlertDialogAction>
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
          </div>
        </CardContent>
      </Card>

      {/* 4. Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    {isEditing ? <Pencil className="h-6 w-6"/> : <UserPlus className="h-6 w-6"/>}
                    {isEditing ? "Cập Nhật Hồ Sơ" : "Tạo Tài Khoản Mới"}
                </DialogTitle>
                <DialogDescription className="text-orange-100 mt-1">
                    {isEditing ? "Chỉnh sửa thông tin chi tiết người dùng." : "Điền thông tin để thêm thành viên vào hệ thống."}
                </DialogDescription>
            </div>
            
            <div className="p-6 grid gap-5 bg-white">
                <div className="grid gap-2">
                    <Label className="text-slate-600">Họ và Tên</Label>
                    <Input className="focus-visible:ring-orange-500 rounded-lg" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Nguyễn Văn A" />
                </div>
                <div className="grid gap-2">
                    <Label className="text-slate-600">Email</Label>
                    <Input className="focus-visible:ring-orange-500 rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="example@fpt.edu.vn" />
                </div>
                <div className="grid gap-2">
                    <Label className="text-slate-600">Mật khẩu {isEditing && <span className="text-xs text-orange-500 font-normal">(Chỉ nhập nếu muốn đổi)</span>}</Label>
                    <div className="relative">
                        <Input type={showPassword ? "text" : "password"} className="focus-visible:ring-orange-500 rounded-lg pr-10" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-orange-500" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label className="text-slate-600">Số điện thoại</Label>
                        <Input className="focus-visible:ring-orange-500 rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-slate-600">Vai trò</Label>
                        <Select value={formData.roleName} onValueChange={v => setFormData({...formData, roleName: v})}>
                            <SelectTrigger className="focus:ring-orange-500 rounded-lg"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Student">Student (Xanh lá)</SelectItem>
                                <SelectItem value="Lecturer">Lecturer (Xanh dương)</SelectItem>
                                <SelectItem value="Facility Admin">Facility Admin (Cam)</SelectItem>
                                <SelectItem value="Admin">Admin (Cam đậm)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <DialogFooter className="p-6 pt-0 bg-white">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-lg border-slate-200 hover:bg-slate-50">Hủy</Button>
                <Button onClick={handleSaveUser} className="rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200">
                    {isEditing ? "Lưu Thay Đổi" : "Tạo Mới Ngay"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
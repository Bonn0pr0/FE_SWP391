import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, Loader2 } from 'lucide-react';
// Đảm bảo import đúng đường dẫn tới file AuthContext vừa tạo
import { useAuth } from '@/contexts/AuthContext'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate email đơn giản
    if (email !== 'admin') {
      if (!email.endsWith('@fpt.edu.vn') && !email.endsWith('@fe.edu.vn')) {
        toast({
          title: 'Email không hợp lệ',
          description: 'Vui lòng sử dụng email @fpt.edu.vn hoặc @fe.edu.vn',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);
    
    // 2. Gọi hàm login và nhận lại roleId
    // Nếu lỗi CORS xảy ra, roleId sẽ là null
    const roleId = await login(email, password);

    setIsLoading(false);

    // 3. Xử lý điều hướng dựa trên Role ID
    if (roleId !== null) {
      toast({
        title: 'Đăng nhập thành công',
        description: `Chào mừng quay trở lại, ${email}`,
      });

      // LOGIC ĐIỀU HƯỚNG
      if (roleId === 1) {
        // Nếu là Admin, điều hướng trực tiếp đến trang Lịch sử booking
        navigate('/admin?section=booking-history');
      } else if (roleId === 2 || roleId === 3) {
        navigate('/');
      } else {
        navigate('/dashboard'); 
      }

    } else {
      // Nếu vào đây, có thể do sai pass HOẶC do lỗi CORS
      toast({
        title: 'Đăng nhập thất bại',
        description: 'không zo đc Bỏn ơiiii.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-slide-up">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">FPTU HCM Booking System</CardTitle>
          <CardDescription>Đăng nhập để tiếp tục</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                placeholder="email@fpt.edu.vn hoặc admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
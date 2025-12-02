import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Building2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email domain for non-admin users
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

    const success = await login(email, password);

    if (success) {
      toast({
        title: 'Đăng nhập thành công',
        description: 'Chào mừng bạn đến với FPTU Booking System',
      });

      // Redirect based on role
      if (email === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast({
        title: 'Đăng nhập thất bại',
        description: 'Email hoặc mật khẩu không chính xác',
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
              />
            </div>

            <Button type="submit" className="w-full">
              Đăng nhập
            </Button>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-2">Tài khoản demo:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• Student: nguyenvana@fpt.edu.vn / 123456</p>
                <p>• Lecturer: nguyenvanb@fe.edu.vn / 123456</p>
                <p>• Admin: admin / 123456</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

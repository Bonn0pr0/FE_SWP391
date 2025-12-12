import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Đã thêm Link
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Icon Google SVG component
const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.053-3.24 2.08-2.16 2.68-5.333 2.68-7.84 0-.747-.067-1.427-.187-2.12h-10.55z"
    />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // State loading riêng cho Google

  const { toast } = useToast();
  const navigate = useNavigate();
  // Giả sử bạn sẽ thêm loginWithGoogle vào AuthContext sau này
  const { login } = useAuth(); 

  // Xử lý đăng nhập thường
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    
    // Gọi hàm login từ context
    const roleId = await login(email, password);

    setIsLoading(false);

    if (roleId !== null) {
      toast({
        title: 'Đăng nhập thành công',
        description: `Chào mừng quay trở lại, ${email}`,
      });

      if (roleId === 1) {
        navigate('/admin?section=booking-history');
      } else if (roleId === 2 || roleId === 3) {
        navigate('/');
      } else {
        navigate('/dashboard'); 
      }
    } else {
      toast({
        title: 'Đăng nhập thất bại',
        description: 'Thông tin đăng nhập không chính xác hoặc lỗi hệ thống.',
        variant: 'destructive',
      });
    }
  };

  // Xử lý đăng nhập Google
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      // TODO: Gọi hàm loginWithGoogle từ AuthContext ở đây
      // const result = await loginWithGoogle();
      
      // Giả lập delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Tính năng đang phát triển",
        description: "Vui lòng kết nối Firebase/OAuth để sử dụng tính năng này.",
      });
      
      setIsGoogleLoading(false);
    } catch (error) {
      setIsGoogleLoading(false);
      toast({
        title: "Lỗi đăng nhập Google",
        variant: "destructive"
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
                disabled={isLoading || isGoogleLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                {/* Link Quên mật khẩu */}
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
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

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <Button 
            variant="outline" 
            type="button" 
            className="w-full" 
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Đăng nhập bằng Google
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
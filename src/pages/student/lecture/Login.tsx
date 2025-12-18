import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Khai báo kiểu cho Google API
declare global {
  interface Window {
    google?: any;
    handleGoogleCallback?: (response: any) => void;
  }
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  // Hàm điều hướng tập trung theo Role
  const redirectByUserRole = (roleId: number) => {
    if (roleId === 1) {
      navigate("/admin?section=booking-history");
    } else if (roleId === 2 || roleId === 3) {
      navigate("/dashboard"); // Đã cập nhật: Role 2, 3 vào Dashboard
    } else {
      navigate("/dashboard");
    }
  };

  // Xử lý response từ Google
  const handleGoogleResponse = async (response: any) => {
    setIsGoogleLoading(true);
    try {
      const idToken = response.credential;
      const roleId = await loginWithGoogle(idToken);
      setIsGoogleLoading(false);

      if (roleId !== null) {
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn đến với hệ thống FPTU!",
          className: "bg-green-600 text-white shadow-lg",
        });
        redirectByUserRole(roleId);
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: "Không thể xác thực tài khoản Google của bạn.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsGoogleLoading(false);
      toast({
        title: "Lỗi đăng nhập Google",
        description: "Đã xảy ra lỗi khi kết nối với Google.",
        variant: "destructive",
      });
    }
  };

  // Khởi tạo Google SDK
  useEffect(() => {
    window.handleGoogleCallback = handleGoogleResponse;
    const initializeGoogleSignIn = () => {
      if (!window.google) {
        setTimeout(initializeGoogleSignIn, 100);
        return;
      }
      try {
        window.google.accounts.id.initialize({
          client_id:
            "570164711064-e8l1rh5cqe65dvf3nerpqf4pbp33dkt7.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        });
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            width: googleButtonRef.current.offsetWidth,
            text: "continue_with",
            locale: "vi",
          });
        }
        setGoogleReady(true);
      } catch (error) {
        console.error("Google Init Error:", error);
      }
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      delete window.handleGoogleCallback;
    };
  }, []);

  // Xử lý đăng nhập bằng Email/Password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== "admin") {
      if (!email.endsWith("@fpt.edu.vn") && !email.endsWith("@fe.edu.vn")) {
        toast({
          title: "Email không hợp lệ",
          description: "Vui lòng dùng email FPT (@fpt.edu.vn hoặc @fe.edu.vn)",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    const roleId = await login(email, password);
    setIsLoading(false);

    if (roleId !== null) {
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng quay trở lại, ${email}`,
        className: "bg-green-600 text-white shadow-lg",
      });
      redirectByUserRole(roleId);
    } else {
      toast({
        title: "Đăng nhập thất bại",
        description: "Tài khoản hoặc mật khẩu không chính xác.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Card với viền cam và đổ bóng lớn */}
      <Card className="w-full max-w-md shadow-2xl border-t-8 border-orange-600 animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-2 text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center shadow-inner">
              <Building2 className="h-10 w-10 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black text-blue-700 tracking-tight">
            FPTU HCM
          </CardTitle>
          <CardDescription className="text-gray-500 font-medium text-lg">
            Hệ thống đặt phòng trực tuyến
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-700 font-bold">
                Email
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="username@fpt.edu.vn"
                className="focus:border-orange-500 border-gray-300 h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-blue-700 font-bold">
                  Mật khẩu
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="focus:border-orange-500 border-gray-300 h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg shadow-lg transition-all active:scale-95"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" /> Đăng nhập ngay
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-500 font-bold">
                Hoặc đăng nhập bằng
              </span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <div className="space-y-3">
            <div
              ref={googleButtonRef}
              className="w-full flex justify-center shadow-sm"
              style={{ minHeight: "44px" }}
            />

            {!googleReady && (
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-400"
                disabled
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải Google...
              </Button>
            )}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Bạn chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-bold hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

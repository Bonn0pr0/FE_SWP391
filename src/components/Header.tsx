import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import logo from '@/pictures/logo.png';

export const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="FPTU Logo" className="h-16 w-36 object-contain" />
          <span className="text-xl font-bold"></span>
        </Link>

        <nav className="hidden md:flex items-center space-x-10">
          <Link to="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Đặt phòng
          </Link>
          <Link to="/details" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Chi tiết
          </Link>
          <Link to="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Liên hệ
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={user?.role === 'admin' ? '/admin' : '/information'}>
                  {user?.email.split('@')[0]}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link to="/login">Đăng nhập</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

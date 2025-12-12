import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Bell, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import logo from '@/pictures/logo.png';

interface Notification {
  notificationId: number;
  title: string;
  message: string;
  status: string;
  date: string;
}

export const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showNotificationIcon = isAuthenticated && (user?.role === 'student' || user?.role === 'lecturer');

  useEffect(() => {
    if (showNotificationIcon) {
      fetchNotifications();
    }
  }, [showNotificationIcon]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      // --- SỬA LẠI PHẦN LẤY ID ---
      let userId = null;
      
      // 1. Lấy chuỗi JSON từ key 'fptu_user' (như trong ảnh)
      const localUserString = localStorage.getItem('fptu_user'); 
      
      if (localUserString) {
        try {
          const parsedUser = JSON.parse(localUserString);
          // 2. Lấy thuộc tính .userId từ object đã parse
          userId = parsedUser.userId; 
        } catch (e) {
          console.error("Error parsing user from local storage", e);
        }
      }

      // Fallback: Nếu không tìm thấy trong local, thử lấy từ context
      if (!userId && user && (user as any).id) {
         userId = (user as any).id;
      }

      if (!userId) {
        console.warn("User ID not found in Local Storage (fptu_user) or Context");
        return; 
      }

      // --- GỌI API ---
      // Lưu ý: Đảm bảo port 44338 là đúng port Backend của bạn
      const response = await fetch(`/api/Notification/user/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        // Sắp xếp thông báo mới nhất lên đầu (nếu API chưa sắp xếp)
        const sortedData = data.sort((a: Notification, b: Notification) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setNotifications(sortedData);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const unreadCount = notifications.filter(n => n.status === "Unread").length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="FPTU Logo" className="h-16 w-36 object-contain" />
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
              {showNotificationIcon && (
                <div className="relative" ref={dropdownRef}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative text-muted-foreground hover:text-primary"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </Button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-950 border rounded-md shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-3 border-b flex justify-between items-center bg-gray-50 dark:bg-slate-900">
                        <h3 className="font-semibold text-sm">Thông báo</h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowDropdown(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div 
                              key={notif.notificationId} 
                              className={`p-3 border-b text-left hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors ${notif.status === 'Unread' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                            >
                              <p className={`text-sm ${notif.status === 'Unread' ? 'font-bold text-primary' : 'font-medium'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-gray-400 mt-1 block">
                                {new Date(notif.date).toLocaleString('vi-VN')}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Không có thông báo mới
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
import { cn } from '@/lib/utils';
import { LayoutDashboard, BarChart3, History, FileText, Settings, User, Home } from 'lucide-react';

export type AdminSection = 'dashboard' | 'overview' | 'booking-history' | 'reports' | 'room-management' | 'room-types' | 'users';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const menuItems = [
  // { id: 'dashboard' as AdminSection, label: 'Admin Dashboard', icon: LayoutDashboard },
  // { id: 'overview' as AdminSection, label: 'Tổng quan', icon: BarChart3 },
  { id: 'booking-history' as AdminSection, label: 'Lịch sử booking', icon: History },
  { id: 'reports' as AdminSection, label: 'Báo cáo chi tiết', icon: FileText },
  { id: 'room-management' as AdminSection, label: 'Quản lý phòng', icon: Home },
  { id: 'room-types' as AdminSection, label: 'Loại phòng', icon: Settings },
  { id: 'users' as AdminSection, label: 'Người dùng', icon: User },
];

export const AdminSidebar = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  return (
    <aside className="w-64 min-h-[calc(100vh-4rem)] bg-card border-r border-border">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
              activeSection === item.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};
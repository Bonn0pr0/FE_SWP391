import { useState } from 'react';
import { Header } from '@/components/Header';
import { AdminSidebar, type AdminSection } from '@/pages/admin/AdminSidebar';
import { AdminDashboardStats } from '@/pages/admin/AdminDashboardStats';
import { AdminOverview } from '@/pages/admin/AdminOverview';
import { AdminBookingHistory } from '@/pages/admin/AdminBookingHistory';
import { AdminReports } from '@/pages/admin/AdminReports';
import { AdminRoomTypes } from '@/pages/admin/AdminRoomTypes';
import { AdminRoomManagement } from '@/pages/admin/AdminRoomManagement';
import Users from '@/pages/admin/Users';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboardStats />;
      case 'overview':
        return <AdminOverview />;
      case 'booking-history':
        return <AdminBookingHistory />;
      case 'reports':
        return <AdminReports />;
      case 'room-types':
        return <AdminRoomTypes />;
      case 'room-management':
        return <AdminRoomManagement />;
      case 'users':
        return <Users />;
      default:
        return <AdminDashboardStats />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <main className="flex-1 p-8 animate-fade-in">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
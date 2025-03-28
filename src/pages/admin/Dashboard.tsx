
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { Toaster } from 'sonner';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex">
      <Toaster position="top-right" />
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border p-4">
          <div className="container flex justify-between items-center">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 px-3 py-1 rounded-full text-sm text-primary-foreground">
                <span className="text-primary font-medium">{user?.name}</span>
                <span className="ml-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 container py-8 px-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

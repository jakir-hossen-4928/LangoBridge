
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  BookOpen, 
  Settings, 
  LayoutDashboard, 
  MessageSquare,
  LogOut
} from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const navItems = [
    { path: '/admin', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/vocabulary', label: 'Vocabulary', icon: <BookOpen size={20} /> },
    { path: '/admin/requests', label: 'Word Requests', icon: <MessageSquare size={20} /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
    { path: '/', label: 'Back to App', icon: <Home size={20} /> },
  ];
  
  return (
    <aside className={`h-screen sticky top-0 flex flex-col bg-muted/50 border-r border-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <h2 className="font-bold text-primary">LangoBridge</h2>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(prev => !prev)}
          className={collapsed ? 'mx-auto' : ''}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) => `
                  flex items-center px-3 py-2 rounded-md transition-colors
                  ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                  ${collapsed ? 'justify-center' : 'justify-start'}
                `}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border mt-auto">
        <Button 
          variant="ghost" 
          className={`text-red-500 hover:text-red-600 hover:bg-red-100/10 w-full ${collapsed ? 'justify-center' : 'justify-start'}`}
          onClick={handleLogout}
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

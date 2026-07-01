import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ListOrdered, 
  Tags, 
  Users, 
  LogOut, 
  Home, 
  MessageCircle,
  BarChart3
} from 'lucide-react'; // Cài đặt: npm install lucide-react

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Sản phẩm', path: '/admin/products', icon: <Package size={20}/> },
    { name: 'Danh mục', path: '/admin/categories', icon: <Tags size={20}/> },
    { name: 'Đơn hàng', path: '/admin/orders', icon: <ListOrdered size={20}/> },
    { name: 'Người dùng', path: '/admin/users', icon: <Users size={20}/> },
    { name: 'Đánh giá', path: '/admin/reviews', icon: <MessageCircle size={20}/> },
    { name: 'Doanh thu', path: '/admin/revenues', icon: <BarChart3 size={20}/> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex-shrink-0">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 flex items-center gap-2">
          <Home className="text-blue-400" /> FURNI ADMIN
        </div>
        <nav className="mt-6 flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                location.pathname === item.path ? 'bg-blue-600' : 'hover:bg-slate-700'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-600 text-red-300 hover:text-white mt-10 transition-all"
          >
            <LogOut size={20}/>
            <span>Đăng xuất</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center px-8 justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            {menuItems.find(i => i.path === location.pathname)?.name || 'Quản trị'}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Chào, Admin</span>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">A</div>
          </div>
        </header>
        <div className="p-8 overflow-y-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
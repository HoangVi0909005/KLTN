import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Save,Lock, X, Package, LogOut, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/api'; // 1. Thêm import api
import HeaderPage from '../components/HeaderPage';

const Profile = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [editedUser, setEditedUser] = useState(user);

  // 2. Thêm state lưu đơn hàng
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Kiểm tra authentication
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // 3. Thêm logic lấy đơn hàng khi chuyển sang tab orders
  useEffect(() => {
    if (activeTab === 'orders' && user?.id) {
      fetchUserOrders();
    }
  }, [activeTab, user?.id]);

  useEffect(() => {
    if (user) {
      setEditedUser(user);
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await api.get(`/orders/user/${user.id}`);
      if (res.data && res.data.data) {
        // Sắp xếp đơn mới nhất lên đầu
        const sorted = res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setUserOrders(sorted);
      }
    } catch (err) {
      console.error("Lỗi lấy đơn hàng tại Profile:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu khớp nhau ở client trước
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      const res = await api.post(`/users/${user.id}/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res.data.success) {
        alert("Đổi mật khẩu thành công!");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setActiveTab('info'); // Chuyển về tab info
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi đổi mật khẩu");
    }
  };

  const handleSave = async () => {
    try {
      // Tạo object data theo đúng cấu trúc UpdateUserRequest
      const updateData = {
        fullName: editedUser.fullName,
        phone: editedUser.phone,
        address: editedUser.address,
        // Nếu bạn có ô nhập mật khẩu mới thì gửi vào đây, 
        // còn hiện tại tab Info của bạn chưa có thì gửi null hoặc xóa đi
        password: null
      };

      const res = await api.put(`/users/${user.id}`, updateData);

      if (res.data.success) {
        // res.data.data lúc này là UserResponse (đã có đủ fullName, phone, address)
        // Cập nhật vào AuthContext để Header và Profile hiển thị đúng
        login({ ...user, ...res.data.data });

        setIsEditing(false);
        alert("Cập nhật thông tin thành công!");
      }
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      // Hiển thị lỗi cụ thể từ Validation của Backend
      const serverMessage = err.response?.data?.message;
      alert(serverMessage || "Không thể cập nhật thông tin");
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  // Helper formats
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('vi-VN');

  const getStatusBadge = (status) => {
    const map = {
      PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
      DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
      CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
      CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
    };
    const info = map[status] || map.PENDING;
    return <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${info.color}`}>{info.label}</span>;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <HeaderPage />
      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* Header Profile */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-100">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {(user.fullName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.fullName}</h1>
                <p className="text-gray-500 mb-3">{user.email}</p>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg uppercase tracking-wider">
                  {user.role || 'Thành viên'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md">
                  <Edit2 size={18} /> Chỉnh sửa
                </button>
              ) : (
                <>
                  <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold shadow-md">
                    <Save size={18} /> Lưu
                  </button>
                  <button onClick={handleCancel} className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all font-semibold">
                    <X size={18} /> Hủy
                  </button>
                </>
              )}
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-8 py-4 font-bold transition-all ${activeTab === 'security' ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Lock size={18} /> Đổi mật khẩu
              </button>
              <button onClick={handleLogoutClick} className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-semibold">
                <LogOut size={18} /> Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b bg-gray-50/50">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 px-8 py-4 font-bold transition-all ${activeTab === 'info' ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <User size={18} /> Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-8 py-4 font-bold transition-all ${activeTab === 'orders' ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Package size={18} /> Đơn hàng
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Họ và tên</label>
                  {isEditing ? (
                    <input type="text" value={editedUser.fullName || ''} onChange={(e) => setEditedUser({ ...editedUser, fullName: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  ) : (
                    <p className="text-lg font-semibold text-gray-800">{user.fullName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Email</label>
                  <p className="text-lg font-semibold text-gray-800">{user.email}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Số điện thoại</label>
                  {isEditing ? (
                    <input type="tel" value={editedUser.phone || ''} onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  ) : (
                    <p className="text-lg font-semibold text-gray-800">{user.phone || 'Chưa cập nhật'}</p>
                  )}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Địa chỉ mặc định</label>
                  {isEditing ? (
                    <textarea value={editedUser.address || ''} onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" rows="3" />
                  ) : (
                    <p className="text-lg font-semibold text-gray-800">{user.address || 'Chưa cập nhật'}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} className="max-w-md space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase">Mật khẩu mới</label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all">
                  Cập nhật mật khẩu
                </button>
              </form>
            )}

            {activeTab === 'orders' && (
              <div>
                {ordersLoading ? (
                  <div className="text-center py-10">Đang tải đơn hàng...</div>
                ) : userOrders.length > 0 ? (
                  <div className="space-y-4">
                    {userOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">{formatDate(order.createdAt)} • {order.items.length} sản phẩm</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{formatPrice(order.totalAmount)}</p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-4">
                      <button onClick={() => navigate('/orders')} className="text-blue-600 font-bold hover:underline">
                        Xem tất cả đơn hàng của bạn →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Package size={64} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500 font-semibold">Bạn chưa có đơn hàng nào.</p>
                    <button onClick={() => navigate('/')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Mua sắm ngay</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
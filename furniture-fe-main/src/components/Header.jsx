import React, { useState } from 'react';
import { ShoppingCart, Search, Sliders, User, ChevronDown, Package2, LogOut, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth

const Header = ({ searchTerm, setSearchTerm, handleSearch, showAdvancedFilter, setShowAdvancedFilter }) => {
  const { cartCount, cartItems } = useCart();
  const { user, logout } = useAuth(); // 2. Lấy user và logout từ Context
  const navigate = useNavigate();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Tính tổng tiền giỏ hàng
  const totalPrice = cartItems?.reduce((total, item) => total + (item.discountPrice || item.price) * (item.quantity || 1), 0) || 0;
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  const handleLogoutClick = () => {
    logout(); // Sử dụng hàm logout của Context để xóa sạch state/localStorage
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 pb-4">
        {/* HÀNG 1: LOGO, AUTH, CART */}
        <div className="flex items-center justify-between mb-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-800 tracking-tighter">
              🪑 Furniture<span className="text-blue-600">Shop</span>
            </span>
          </Link>

          <div className="flex items-center gap-8">
            {/* Tài khoản - Sử dụng biến 'user' từ Context */}
            <div className="hidden md:block relative z-50">
              {user ? (
                // ĐÃ ĐĂNG NHẬP
                <div>
                  <div 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full group-hover:shadow-md transition-all">
                      <User size={24} className="text-white" />
                    </div>
                    <div className="flex flex-col text-sm">
                      <span className="text-xs text-gray-500">Xin chào,</span>
                      <button className="flex items-center font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {user.fullName || user.name} <ChevronDown size={14} className="ml-1" />
                      </button>
                    </div>
                  </div>

                  {/* DROPDOWN MENU USER */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white shadow-2xl rounded-lg border border-gray-100 py-2 z-[60]">
                      <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100"></div>
                      
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-800 truncate">{user.fullName || user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700" onClick={() => setIsUserMenuOpen(false)}>
                        <User size={18} /> Tài khoản của tôi
                      </Link>

                      <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700" onClick={() => setIsUserMenuOpen(false)}>
                        <Package2 size={18} /> Đơn hàng của tôi
                      </Link>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button 
                          onClick={handleLogoutClick}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 w-full text-left text-sm text-red-600 font-medium"
                        >
                          <LogOut size={18} /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // CHƯA ĐĂNG NHẬP
                <div className="flex items-center gap-3 group">
                  <div className="p-2 bg-gray-100 rounded-full group-hover:bg-blue-50 transition-colors">
                    <User size={24} className="text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div className="flex flex-col text-sm">
                    <div className="flex gap-1 text-gray-500">
                      <Link to="/login" className="hover:text-blue-600 transition-colors">Đăng nhập</Link>
                      <span>/</span>
                      <Link to="/register" className="hover:text-blue-600 transition-colors">Đăng ký</Link>
                    </div>
                    <Link to="/login" className="font-semibold text-gray-800 hover:text-blue-600">
                      Tài khoản của tôi
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Giỏ hàng */}
            <div className="relative z-50">
              <div 
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="relative p-2 bg-gray-100 rounded-full group-hover:bg-blue-50 transition-colors">
                  <ShoppingCart size={24} className="text-gray-600 group-hover:text-blue-600" />
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                </div>
                <span className="font-semibold text-gray-800 hidden sm:block group-hover:text-blue-600">Giỏ hàng</span>
              </div>

              {/* DROPDOWN GIỎ HÀNG */}
              {isCartOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-2xl rounded-sm border border-gray-100 py-4 px-5 z-[100]">
                  <div className="absolute -top-2 right-12 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100"></div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b">Giỏ hàng</h3>
                  
                  <div className="max-h-60 overflow-y-auto">
                    {cartItems.length === 0 ? (
                      <div className="py-6 text-center text-sm text-gray-400">Giỏ hàng trống</div>
                    ) : (
                      cartItems.map((item, index) => (
                        <div key={index} className="flex gap-3 mb-3 pb-3 border-b border-gray-50 last:border-0">
                          <img src={item.imageUrls?.[0]} className="w-12 h-12 object-cover rounded" alt="" />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.name}</p>
                            <p className="text-xs text-blue-600 font-bold">{formatPrice(item.discountPrice || item.price)} x{item.quantity}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-2">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Tổng tiền:</span>
                      <span className="text-lg font-bold text-orange-600">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to="/cart" className="flex-1 bg-gray-800 text-white text-[10px] font-bold py-3 text-center rounded hover:bg-black transition-colors uppercase" onClick={() => setIsCartOpen(false)}>Xem giỏ hàng</Link>
                      <Link to="/checkout" className="flex-1 bg-blue-600 text-white text-[10px] font-bold py-3 text-center rounded hover:bg-blue-700 transition-colors uppercase" onClick={() => setIsCartOpen(false)}>Thanh toán</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* THANH TÌM KIẾM */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button onClick={handleSearch} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
            <Search size={18} /> <span className="hidden sm:inline">Tìm</span>
          </button>
          <button onClick={() => setShowAdvancedFilter(!showAdvancedFilter)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all">
            <Sliders size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
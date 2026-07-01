import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import HeaderPage from '../components/HeaderPage';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartCount } = useCart();
  const { user } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  // Tính toán các giá trị hóa đơn
  const subtotal = cartItems?.reduce((total, item) => total + (item.discountPrice || item.price) * item.quantity, 0) || 0;
  const shippingFee = subtotal > 2000000 ? 0 : 50000;
  const total = subtotal + shippingFee;

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  const handleCheckout = () => {
    if (!user) {
      // Nếu chưa đăng nhập, chuyển đến trang login
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      // Nếu đã đăng nhập, chuyển đến trang checkout
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-gray-50 p-8 rounded-full mb-6">
          <ShoppingBag size={80} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá các mẫu nội thất mới nhất của chúng tôi!
        </p>
        <Link 
          to="/" 
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <ArrowLeft size={20} />
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <HeaderPage />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">GIỎ HÀNG CỦA BẠN</h1>
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
            {cartCount} sản phẩm
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DANH SÁCH SẢN PHẨM (Cột Trái) */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 transition-hover hover:shadow-md">
                {/* Hình ảnh */}
                <div className="w-32 h-32 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <img 
                    src={item.imageUrls?.[0] || 'https://via.placeholder.com/150'} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thông tin sản phẩm */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-gray-800 text-lg line-clamp-2 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-400 mb-3 uppercase tracking-wider font-medium">Mã SP: {item.id}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <span className="text-blue-600 font-black text-xl">
                      {formatPrice(item.discountPrice || item.price)}
                    </span>
                    {item.discountPrice && (
                      <span className="text-gray-400 line-through text-sm">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bộ điều khiển số lượng */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-100 rounded-xl bg-gray-50 p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-2 hover:bg-white hover:text-blue-600 rounded-lg transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-bold text-gray-700">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-white hover:text-blue-600 rounded-lg transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button 
                    onClick={() => {
                      removeFromCart(item.id);
                      success(`✅ Đã xóa "${item.name}" khỏi giỏ hàng!`);
                    }}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Xóa khỏi giỏ hàng"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </div>
            ))}

            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-semibold transition-colors mt-4">
              <ArrowLeft size={18} />
              Tiếp tục mua thêm sản phẩm khác
            </Link>
          </div>

          {/* TỔNG KẾT ĐƠN HÀNG (Cột Phải) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-28">
              <h2 className="text-xl font-black text-gray-800 mb-6 pb-4 border-b border-gray-50">TỔNG ĐƠN HÀNG</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-bold text-gray-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-bold text-green-600">
                    {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-[11px] text-orange-500 italic">
                    * Mua thêm {formatPrice(2000000 - subtotal)} để được miễn phí vận chuyển
                  </p>
                )}
              </div>

              <div className="pt-6 border-t-2 border-dashed border-gray-100 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Tổng thanh toán</span>
                  <span className="text-3xl font-black text-orange-600 leading-none">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <p className="text-sm text-blue-800 text-center font-medium">
                      Vui lòng đăng nhập để tiếp tục thanh toán
                    </p>
                  </div>
                )}

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                >
                  {!user ? (
                    <>
                      <LogIn size={20} />
                      ĐĂNG NHẬP ĐỂ THANH TOÁN
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      TIẾN HÀNH THANH TOÁN
                    </>
                  )}
                </button>
                
                <div className="flex flex-col items-center gap-2 mt-4 text-gray-400 text-xs text-center">
                  <p className="flex items-center gap-1">
                    🛡️ Thanh toán an toàn & bảo mật
                  </p>
                  <p>Hỗ trợ: 1900 1234 (8:00 - 21:00)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
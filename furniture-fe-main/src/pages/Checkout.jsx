import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, MapPin, User, Phone, Mail, CheckCircle, Clock, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/api';
import Header from '../components/Header';
import HeaderPage from '../components/HeaderPage';

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const currentUserId = user?.id || user?.userId;

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '', city: '', district: '', ward: '', note: '',
    paymentMethod: 'COD',
    shippingMethod: 'standard'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState({ p: false, d: false, w: false });

  const subtotal = cartItems.reduce((total, item) => total + (item.discountPrice || item.price) * item.quantity, 0);
  const shippingFee = formData.shippingMethod === 'express' ? 80000 : (subtotal > 2000000 ? 0 : 50000);
  const total = subtotal + shippingFee;

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/orders');
      return;
    }
    fetchProvinces();
  }, [user, cartItems, navigate]);

  const fetchProvinces = async () => {
    try {
      setLoading(prev => ({ ...prev, p: true }));
      const response = await fetch('https://provinces.open-api.vn/api/p/');
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error('Lỗi khi tải tỉnh thành:', error);
    } finally {
      setLoading(prev => ({ ...prev, p: false }));
    }
  };

  const handleProvinceChange = async (e) => {
    const provinceName = e.target.value;
    setFormData(prev => ({ ...prev, city: provinceName, district: '', ward: '' }));
    setDistricts([]);
    setWards([]);

    if (!provinceName) return;

    const selectedProvince = provinces.find(p => p.name === provinceName);
    if (selectedProvince) {
      try {
        setLoading(prev => ({ ...prev, d: true }));
        const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`);
        const data = await response.json();
        setDistricts(data.districts || []);
      } catch (error) {
        console.error('Lỗi khi tải quận huyện:', error);
      } finally {
        setLoading(prev => ({ ...prev, d: false }));
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const districtName = e.target.value;
    setFormData(prev => ({ ...prev, district: districtName, ward: '' }));
    setWards([]);

    if (!districtName) return;

    const selectedDistrict = districts.find(d => d.name === districtName);
    if (selectedDistrict) {
      try {
        setLoading(prev => ({ ...prev, w: true }));
        const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`);
        const data = await response.json();
        setWards(data.wards || []);
      } catch (error) {
        console.error('Lỗi khi tải phường xã:', error);
      } finally {
        setLoading(prev => ({ ...prev, w: false }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
    if (!formData.city) newErrors.city = 'Vui lòng chọn Tỉnh/Thành phố';
    if (!formData.district) newErrors.district = 'Vui lòng chọn Quận/Huyện';
    if (!formData.ward) newErrors.ward = 'Vui lòng chọn Phường/Xã';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      error("❌ Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!currentUserId) {
      error("⚠️ Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`;
      const orderData = {
        items: cartItems.map(item => ({ productId: item.id, quantity: item.quantity })),
        paymentMethod: formData.paymentMethod,
        shippingAddress: fullAddress,
        recipientName: formData.fullName,
        recipientPhone: formData.phone,
        note: formData.note || ''
      };

      // 1. Tạo đơn hàng trước
      const orderResponse = await api.post(`/orders/user/${currentUserId}`, orderData);
      const orderId = orderResponse.data.data.id;

      // 2. Nếu chọn VNPay, lấy link và chuyển hướng
      if (formData.paymentMethod === 'VNPAY') {
        const paymentResponse = await api.get(`/payment/vnpay/create-url/${orderId}`);
        if (paymentResponse.data.success) {
          success("✅ Đơn hàng đã được tạo! Chuyển hướng đến trang thanh toán...");
          setTimeout(() => {
            window.location.href = paymentResponse.data.data;
          }, 1500);
          return;
        }
      }

      // 3. Nếu là COD thì xử lý như cũ
      clearCart();
      success("✅ Đặt hàng thành công! Cảm ơn bạn đã mua hàng!");
      setTimeout(() => {
        navigate(`/orders/${orderId}`);
      }, 1500);

    } catch (err) {
      console.error('Lỗi khi đặt hàng:', err);
      error("❌ " + (err.response?.data?.message || 'Phiên đăng nhập hết hạn (Lỗi 403). Vui lòng đăng xuất và đăng nhập lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <HeaderPage />
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={handleBackToCart}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại giỏ hàng</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* User Info Banner */}
        {user && (
          <div className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Xin chào, {user.fullName || user.name || 'Khách hàng'}!</h3>
                <p className="text-blue-100">Thông tin của bạn đã được điền sẵn</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                <CheckCircle size={20} />
              </div>
              <span className="text-sm font-semibold text-gray-700 hidden sm:inline">Giỏ hàng</span>
            </div>
            <div className="w-16 h-1 bg-blue-600 rounded"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                2
              </div>
              <span className="text-sm font-semibold text-blue-600 hidden sm:inline">Thanh toán</span>
            </div>
            <div className="w-16 h-1 bg-gray-200 rounded"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold">
                3
              </div>
              <span className="text-sm font-semibold text-gray-400 hidden sm:inline">Hoàn tất</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">

              {/* Contact Info */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Thông tin liên hệ</h2>
                    <p className="text-sm text-gray-500">Nhập thông tin để nhận hàng</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <User size={16} />
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 border-2 ${errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-800 font-medium`}
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">⚠️ {errors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Phone size={16} />
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-5 py-4 border-2 ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-800 font-medium`}
                        placeholder="0901234567"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">⚠️ {errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Mail size={16} />
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-5 py-4 border-2 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-800 font-medium`}
                        placeholder="email@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">⚠️ {errors.email}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <MapPin size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Địa chỉ giao hàng</h2>
                    <p className="text-sm text-gray-500">Chọn địa chỉ nhận hàng chính xác</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleProvinceChange}
                        disabled={loading.p}
                        className={`w-full px-5 py-4 border-2 ${errors.city ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-800 font-medium`}
                      >
                        <option value="">{loading.p ? 'Đang tải...' : 'Chọn Tỉnh/TP'}</option>
                        {provinces.map(p => (
                          <option key={p.code} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                      {errors.city && <p className="text-red-500 text-sm mt-2">⚠️ {errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Quận/Huyện <span className="text-red-500">*</span></label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleDistrictChange}
                        disabled={!formData.city || loading.d}
                        className={`w-full px-5 py-4 border-2 ${errors.district ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-800 font-medium disabled:bg-gray-100`}
                      >
                        <option value="">{loading.d ? 'Đang tải...' : 'Chọn Quận/Huyện'}</option>
                        {districts.map(d => (
                          <option key={d.code} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                      {errors.district && <p className="text-red-500 text-sm mt-2">⚠️ {errors.district}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phường/Xã <span className="text-red-500">*</span></label>
                      <select
                        name="ward"
                        value={formData.ward}
                        onChange={handleChange}
                        disabled={!formData.district || loading.w}
                        className={`w-full px-5 py-4 border-2 ${errors.ward ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-800 font-medium disabled:bg-gray-100`}
                      >
                        <option value="">{loading.w ? 'Đang tải...' : 'Chọn Phường/Xã'}</option>
                        {wards.map(w => (
                          <option key={w.code} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                      {errors.ward && <p className="text-red-500 text-sm mt-2">⚠️ {errors.ward}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 border-2 ${errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-800 font-medium`}
                      placeholder="Số nhà, tên đường..."
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-2">⚠️ {errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú</label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-800 font-medium"
                      placeholder="Ghi chú cho người giao hàng (không bắt buộc)"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CreditCard size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Phương thức thanh toán</h2>
                    <p className="text-sm text-gray-500">Chọn cách thanh toán phù hợp</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer hover:bg-blue-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.paymentMethod === 'VNPAY' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="VNPAY"
                      checked={formData.paymentMethod === 'VNPAY'}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="w-12 h-8 flex items-center justify-center bg-white rounded border">
                      {/* Thay thế bằng icon VNPay nếu bạn có, hoặc dùng icon card */}
                      <span className="text-[10px] font-bold text-blue-700">VNPAY</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">Thanh toán qua VNPay</p>
                      <p className="text-sm text-gray-500">Thẻ ATM, Visa, Master, QR Code</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Truck size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Phương thức vận chuyển</h2>
                    <p className="text-sm text-gray-500">Chọn cách giao hàng</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer hover:bg-blue-50 transition-colors">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={formData.shippingMethod === 'standard'}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600"
                    />
                    <Clock size={24} className="text-blue-600" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">Giao hàng tiêu chuẩn</p>
                      <p className="text-sm text-gray-500">Giao trong 3-5 ngày</p>
                    </div>
                    <p className="font-bold text-blue-600">{subtotal > 2000000 ? 'Miễn phí' : formatPrice(50000)}</p>
                  </label>

                  <label className="flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer hover:bg-blue-50 transition-colors">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={formData.shippingMethod === 'express'}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600"
                    />
                    <Zap size={24} className="text-orange-600" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">Giao hàng nhanh</p>
                      <p className="text-sm text-gray-500">Giao trong 1-2 ngày</p>
                    </div>
                    <p className="font-bold text-orange-600">{formatPrice(80000)}</p>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Đơn hàng của bạn</h2>

                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                      <img
                        src={item.imageUrls?.[0] || 'https://via.placeholder.com/150'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm leading-tight">{item.name}</p>
                        <p className="text-sm text-gray-600 mt-1">x{item.quantity}</p>
                        <p className="font-bold text-blue-600 mt-1">{formatPrice(item.discountPrice || item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-dashed border-gray-200 pt-6 space-y-4">
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Tạm tính</span>
                    <span className="font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Phí vận chuyển</span>
                    <span className="font-bold">{shippingFee === 0 ? <span className="text-green-600">Miễn phí</span> : formatPrice(shippingFee)}</span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-4 flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Tổng cộng</span>
                    <span className="text-2xl font-black text-blue-600">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={24} />
                      Đặt hàng ngay
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-4">
                  Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi
                </p>
                {/* Trust Badges */}
                <div className="mt-6 grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
                      <CheckCircle size={20} />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">Chính hãng 100%</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-2">
                      <Truck size={20} />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">Giao hàng nhanh</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-2">
                      <CreditCard size={20} />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">Bảo mật thanh toán</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer đơn giản cho trang checkout */}
      <footer className="py-8 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Tên Cửa Hàng Của Bạn. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;
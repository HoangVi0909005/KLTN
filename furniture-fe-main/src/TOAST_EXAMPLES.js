/**
 * HƯỚNG DẪN SỬ DỤNG TOAST NOTIFICATIONS
 * 
 * File này chứa các ví dụ cách sử dụng hệ thống Toast Notifications
 * trong các component khác nhau
 */

// ============================================
// 1. EXAMPLE: Login Page Notifications
// ============================================

/*
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const { success, error, info } = useToast();
  
  const handleLogin = async (credentials) => {
    try {
      // Call API
      const response = await api.post('/login', credentials);
      
      // Success toast
      success(`✅ Đăng nhập thành công! Chào mừng, ${response.data.user.name}!`);
      
      // Redirect after 1.5s
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      // Error toast
      error(`❌ ${err.response?.data?.message || 'Đăng nhập thất bại'}`);
    }
  };
};
*/

// ============================================
// 2. EXAMPLE: Register Page Notifications
// ============================================

/*
const RegisterPage = () => {
  const { success, error, info } = useToast();
  
  const handleRegister = async (formData) => {
    try {
      // Show info toast
      info("ℹ️ Đang xử lý đăng ký...");
      
      const response = await api.post('/register', formData);
      success("✅ Đăng ký thành công! Vui lòng đăng nhập.");
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      error(`❌ ${err.response?.data?.message || 'Đăng ký thất bại'}`);
    }
  };
};
*/

// ============================================
// 3. EXAMPLE: Profile Page Notifications
// ============================================

/*
const ProfilePage = () => {
  const { success, error } = useToast();
  
  const handleUpdateProfile = async (updatedData) => {
    try {
      await api.put(`/users/${userId}`, updatedData);
      success("✅ Cập nhật thông tin cá nhân thành công!");
    } catch (err) {
      error("❌ Cập nhật thất bại");
    }
  };
  
  const handleChangePassword = async (passwords) => {
    try {
      await api.post(`/users/${userId}/change-password`, passwords);
      success("✅ Đổi mật khẩu thành công!");
    } catch (err) {
      error("❌ Mật khẩu hiện tại không đúng");
    }
  };
};
*/

// ============================================
// 4. EXAMPLE: Product Page Notifications
// ============================================

/*
const ProductPage = () => {
  const { success, error } = useToast();
  
  const handleAddToCart = (product) => {
    try {
      addToCart(product);
      success(`✅ Đã thêm "${product.name}" vào giỏ hàng!`);
    } catch (err) {
      error("❌ Không thể thêm sản phẩm");
    }
  };
  
  const handleAddToWishlist = (productId) => {
    try {
      addWishlist(productId);
      success("❤️ Đã thêm vào danh sách yêu thích!");
    } catch (err) {
      error("❌ Lỗi khi thêm vào danh sách yêu thích");
    }
  };
};
*/

// ============================================
// 5. EXAMPLE: Admin Panel Notifications
// ============================================

/*
const AdminProductPage = () => {
  const { success, error } = useToast();
  
  const handleAddProduct = async (formData) => {
    try {
      await api.post('/admin/products', formData);
      success("✅ Thêm sản phẩm thành công!");
      fetchProducts(); // Reload danh sách
    } catch (err) {
      error("❌ Thêm sản phẩm thất bại");
    }
  };
  
  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/admin/products/${productId}`);
      success("✅ Xóa sản phẩm thành công!");
      fetchProducts();
    } catch (err) {
      error("❌ Không thể xóa sản phẩm");
    }
  };
  
  const handleUpdateProduct = async (productId, updatedData) => {
    try {
      await api.put(`/admin/products/${productId}`, updatedData);
      success("✅ Cập nhật sản phẩm thành công!");
      fetchProducts();
    } catch (err) {
      error("❌ Cập nhật thất bại");
    }
  };
};
*/

// ============================================
// 6. EXAMPLE: Order Management Notifications
// ============================================

/*
const OrderManagement = () => {
  const { success, error, info } = useToast();
  
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      success(`✅ Cập nhật trạng thái đơn hàng thành công!`);
      fetchOrders();
    } catch (err) {
      error("❌ Cập nhật trạng thái thất bại");
    }
  };
  
  const handleCancelOrder = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/cancel`);
      success("✅ Hủy đơn hàng thành công!");
      fetchOrders();
    } catch (err) {
      error("❌ Không thể hủy đơn hàng");
    }
  };
};
*/

// ============================================
// 7. EXAMPLE: Form Validation Notifications
// ============================================

/*
const ContactForm = () => {
  const { success, error } = useToast();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!email) {
      error("❌ Vui lòng nhập email");
      return;
    }
    
    if (!message) {
      error("❌ Vui lòng nhập tin nhắn");
      return;
    }
    
    // Submit
    try {
      submitForm({ email, message });
      success("✅ Tin nhắn đã được gửi! Cảm ơn bạn!");
      resetForm();
    } catch (err) {
      error("❌ Gửi tin nhắn thất bại");
    }
  };
};
*/

// ============================================
// 8. EXAMPLE: File Upload Notifications
// ============================================

/*
const FileUpload = () => {
  const { success, error, info } = useToast();
  
  const handleFileUpload = async (file) => {
    try {
      if (!file) {
        error("❌ Vui lòng chọn tệp");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        error("❌ Tệp quá lớn (tối đa 5MB)");
        return;
      }
      
      info("ℹ️ Đang tải lên...");
      
      const formData = new FormData();
      formData.append('file', file);
      
      await api.post('/upload', formData);
      success("✅ Tệp đã được tải lên thành công!");
    } catch (err) {
      error("❌ Tải lên thất bại");
    }
  };
};
*/

// ============================================
// 9. EMOJI REFERENCES
// ============================================

/**
 * Các emoji phổ biến dùng với Toast:
 * 
 * ✅ - Thành công
 * ❌ - Lỗi/Thất bại
 * ⚠️ - Cảnh báo
 * ℹ️ - Thông tin
 * 🎉 - Kỉ niệm/Đặc biệt
 * ❤️ - Yêu thích
 * 🔒 - Bảo mật
 * 🔓 - Mở khóa
 * 📝 - Biên tập
 * 🗑️ - Xóa
 * 💾 - Lưu
 * 🔄 - Cập nhật
 * 📧 - Email
 * 📱 - Điện thoại
 * 🚀 - Nhanh chóng
 * ⏳ - Đang chờ
 * 👥 - Người dùng
 * 🛒 - Giỏ hàng
 * 📦 - Gói hàng
 * 🎁 - Quà tặng
 */

// ============================================
// 10. BEST PRACTICES
// ============================================

/**
 * 1. ✅ Luôn import useToast hook
 *    import { useToast } from '../context/ToastContext';
 * 
 * 2. ✅ Sử dụng các hàm: success(), error(), info()
 *    const { success, error, info } = useToast();
 * 
 * 3. ✅ Thêm emoji vào message để dễ nhìn
 *    success("✅ Đặt hàng thành công!");
 * 
 * 4. ✅ Đặt toast ngay sau khi có kết quả
 *    success("Thành công"); // Đúng
 *    alert("Thành công"); // Sai - dùng alert cũ
 * 
 * 5. ✅ Sử dụng error() cho lỗi
 *    error("❌ Lỗi: " + err.message);
 * 
 * 6. ✅ Sử dụng info() cho thông tin trung lập
 *    info("ℹ️ Đang tải dữ liệu...");
 * 
 * 7. ❌ KHÔNG lạm dụng toast (tối đa 2-3 toast/lần)
 * 
 * 8. ❌ KHÔNG dùng toast cho dialog/confirm lớn
 *    -> Dùng modal component thay vì
 */

export default {};

# Hệ Thống Thông Báo & Validation (Toast Notifications)

## 📋 Tổng Quan

Ứng dụng đã được bổ sung hệ thống thông báo (Toast) toàn diện để cung cấp phản hồi trực quan cho người dùng khi thực hiện các hành động quan trọng.

## 🎯 Các Tính Năng Đã Thêm

### 1. **Component Toast**

- **Vị trí**: `src/components/Toast.jsx`
- **Chức năng**: Hiển thị thông báo duy nhất với các kiểu:
  - `success` (xanh) - Thành công
  - `error` (đỏ) - Lỗi
  - `info` (xanh dương) - Thông tin

### 2. **Toast Context & Hook**

- **Vị trí**: `src/context/ToastContext.jsx`
- **Chức năng**: Quản lý multiple Toast notifications
- **Hook**: `useToast()` - Sử dụng để trigger thông báo

### 3. **Hiển Thị Thông Báo Tại:**

#### 📦 **ProductDetail.jsx** - Chi tiết sản phẩm

```javascript
// Thêm vào giỏ hàng
onClick={() => {
  addToCart(product);
  success(`✅ Đã thêm "${product.name}" vào giỏ hàng!`);
}}

// Gửi đánh giá
success("✅ Cảm ơn bạn đã đánh giá sản phẩm!");
error("❌ " + errorMessage);
```

#### 🛒 **CartPage.jsx** - Trang giỏ hàng

```javascript
// Xóa sản phẩm
onClick={() => {
  removeFromCart(item.id);
  success(`✅ Đã xóa "${item.name}" khỏi giỏ hàng!`);
}}
```

#### 💳 **Checkout.jsx** - Trang thanh toán

```javascript
// Lỗi validation
error("❌ Vui lòng điền đầy đủ thông tin!");

// Đặt hàng thành công
success("✅ Đặt hàng thành công! Cảm ơn bạn đã mua hàng!");

// Lỗi khi đặt hàng
error("❌ " + errorMessage);
```

## 🚀 Cách Sử Dụng

### 1. Import hook vào component

```jsx
import { useToast } from "../context/ToastContext";
```

### 2. Sử dụng trong component

```jsx
const MyComponent = () => {
  const { success, error, info } = useToast();

  const handleAction = () => {
    try {
      // Thực hiện hành động
      success("✅ Hành động thành công!");
    } catch (err) {
      error("❌ Có lỗi xảy ra!");
    }
  };

  return <button onClick={handleAction}>Thực hiện</button>;
};
```

## 🎨 Tùy Chỉnh Toast

### Thay Đổi Thời Gian Hiển Thị

```jsx
showToast(message, type, duration);
// duration mặc định: success/info = 3000ms, error = 4000ms
```

### Thêm Emoji/Icon

- ✅ Thành công
- ❌ Lỗi
- ⚠️ Cảnh báo
- ℹ️ Thông tin
- 🎉 Kỉ niệm

## 📍 Vị Trí Hiển Thị

Toast hiển thị ở **góc trên bên phải** màn hình (Top Right)

## 🎬 Animation

- **Fade In**: 0.3s ease-out (khi xuất hiện)
- **Fade Out**: 0.3s ease-out (khi biến mất)

## ✨ Các Validation Được Thêm

### ProductDetail.jsx

- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Gửi đánh giá sản phẩm
- ❌ Phải đăng nhập để đánh giá

### CartPage.jsx

- ✅ Xóa sản phẩm khỏi giỏ hàng

### Checkout.jsx

- ✅ Đặt hàng thành công
- ❌ Lỗi validation form
- ❌ Phiên đăng nhập hết hạn
- ⚠️ Lỗi khi tạo đơn hàng

## 🔧 Cải Tiến Trong Tương Lai

- [ ] Thêm sound effects khi notification
- [ ] Thêm undo action cho xóa sản phẩm
- [ ] Toast notifications cho login/logout
- [ ] Toast cho password reset
- [ ] Batch notifications cho bulk actions

---

**Phiên bản**: 1.0 | **Ngày cập nhật**: 02/02/2026

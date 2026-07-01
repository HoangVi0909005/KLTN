# 🪑 FurnitureShop - Ứng Dụng Frontend

Một nền tảng thương mại điện tử nội thất hiện đại, đầy đủ các tính năng xây dựng bằng **React 19**, **Vite**, và **Tailwind CSS**. Ứng dụng frontend này cung cấp trải nghiệm mua sắm hoàn chỉnh cho khách hàng và công cụ quản lý toàn diện cho quản trị viên.

## 📋 Mục Lục

- [Tính Năng](#tính-năng)
- [Công Nghệ](#công-nghệ)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Cài Đặt và Thiết Lập](#cài-đặt-và-thiết-lập)
- [Script Có Sẵn](#script-có-sẵn)
- [Chi Tiết Tính Năng Chính](#chi-tiết-tính-năng-chính)
- [Tích Hợp API](#tích-hợp-api)
- [Quản Lý State](#quản-lý-state)
- [Tổng Quan Các Thành Phần](#tổng-quan-các-thành-phần)
- [Bảng Điều Khiển Admin](#bảng-điều-khiển-admin)
- [Đóng Góp](#đóng-góp)

## ✨ Tính Năng

### Tính Năng Khách Hàng
- 🛍️ **Duyệt Sản Phẩm**: Duyệt các sản phẩm nội thất với bộ lọc nâng cao và tìm kiếm
- 🔍 **Bộ Lọc Nâng Cao**: Lọc theo danh mục, khoảng giá, xếp hạng và hơn nữa
- 🛒 **Giỏ Hàng**: Thêm/xóa sản phẩm, quản lý số lượng, lưu trữ giỏ hàng bền vững
- 💳 **Thanh Toán & Thanh Toán**: Quy trình thanh toán liền mạch với tích hợp thanh toán
- 👤 **Tài Khoản Người Dùng**: Đăng ký, đăng nhập và quản lý hồ sơ người dùng
- 📦 **Quản Lý Đơn Hàng**: Theo dõi đơn hàng, xem chi tiết đơn hàng và trạng thái thanh toán
- 💬 **Chatbot AI**: Widget chatbot tương tác để hỗ trợ khách hàng
- ⭐ **Đánh Giá Sản Phẩm**: Đọc và lọc sản phẩm theo xếp hạng
- 🎯 **Danh Mục Sản Phẩm**: Duyệt sản phẩm theo danh mục
- 🏷️ **Sản Phẩm Khuyến Mãi**: Phần sản phẩm có chiết khấu nổi bật

### Tính Năng Quản Trị
- 📊 **Phân Tích Bảng Điều Khiển**: Thống kê thời gian thực, theo dõi doanh thu, các hiểu biết về bán hàng
- 📦 **Quản Lý Sản Phẩm**: Các hoạt động CRUD đầy đủ cho sản phẩm (thêm, chỉnh sửa, xóa, hành động hàng loạt)
- 🏷️ **Quản Lý Danh Mục**: Quản lý các danh mục sản phẩm
- 👥 **Quản Lý Người Dùng**: Xem và quản lý tài khoản khách hàng
- 📋 **Quản Lý Đơn Hàng**: Theo dõi, cập nhật và quản lý các đơn hàng của khách hàng
- ⭐ **Quản Lý Đánh Giá**: Giám sát và quản lý các đánh giá sản phẩm
- 💰 **Báo Cáo Doanh Thu**: Báo cáo tài chính chi tiết và phân tích
- 📈 **Biểu Đồ & Đồ Thị**: Biểu diễn trực quan các chỉ số kinh doanh (Recharts)

## 🛠️ Công Nghệ

### Framework Frontend & Build
- **React 19.2.0** - Thư viện UI
- **Vite 7.2.4** - Công cụ xây dựng nhanh và máy chủ phát triển
- **React Router DOM 7.11.0** - Định tuyến phía máy khách
- **React DOM 19.2.0** - Kết xuất DOM

### Styling
- **Tailwind CSS 3.4.19** - Framework CSS hữu ích đầu tiên
- **PostCSS 8.5.6** - Xử lý CSS
- **AutoPrefixer 10.4.23** - Các tiền tố vendor CSS

### Dữ Liệu & API
- **Axios 1.13.2** - HTTP client với các bộ chặn
- **Recharts 3.6.0** - Thư viện biểu đồ React cho phân tích

### Thành Phần UI
- **Lucide React 0.562.0** - Thư viện biểu tượng đẹp, nhẹ

### Công Cụ Phát Triển
- **ESLint 9.39.1** - Kiểm tra mã
- **React Fast Refresh** - Cập nhật thành phần nhanh trong quá trình phát triển

## 📁 Cấu Trúc Dự Án

```
furniture-frontend/
├── public/                          # Các tài sản tĩnh
├── src/
│   ├── admin/                       # Các trang bảng điều khiển admin
│   │   ├── AdminDashboard.jsx       # Bảng điều khiển chính của admin với phân tích
│   │   ├── AdminProduct.jsx         # Trang quản lý sản phẩm
│   │   ├── AdminProductAdd.jsx      # Mẫu thêm sản phẩm mới
│   │   ├── AdminProductEdit.jsx     # Chỉnh sửa sản phẩm hiện có
│   │   ├── AdminOrder.jsx           # Quản lý đơn hàng
│   │   ├── AdminOrderDetail.jsx     # Chế độ xem chi tiết đơn hàng
│   │   ├── AdminUser.jsx            # Quản lý người dùng
│   │   ├── AdminCategory.jsx        # Quản lý danh mục
│   │   ├── AdminReview.jsx          # Quản lý đánh giá
│   │   ├── AdminRevenue.jsx         # Báo cáo doanh thu & phân tích
│   │   ├── AdminLogin.jsx           # Xác thực admin
│   │   └── AdminLayout.jsx          # Trình bao bọc layout admin
│   │
│   ├── api/                         # Tích hợp API
│   │   ├── api.jsx                  # Phiên bản Axios với các bộ chặn
│   │   └── ChatService.jsx          # Dịch vụ API Chatbot
│   │
│   ├── components/                  # Các thành phần có thể tái sử dụng
│   │   ├── Header.jsx               # Tiêu đề điều hướng chính
│   │   ├── HeaderPage.jsx           # Tiêu đề phụ trang
│   │   ├── Footer.jsx               # Thành phần chân trang
│   │   ├── ProductCard.jsx          # Hiển thị thẻ sản phẩm
│   │   ├── FilterBar.jsx            # Thanh lọc sản phẩm
│   │   ├── AdvancedFilter.jsx       # Modal tìm kiếm & lọc nâng cao
│   │   ├── ChatbotWidget.jsx        # Widget chatbot AI
│   │   ├── ChatbotWidget.css        # Kiểu dáng Chatbot
│   │   ├── AdminRoute.jsx           # Trình bao bọc tuyến đường admin được bảo vệ
│   │   ├── ProtectedRoute.jsx       # Các tuyến đường người dùng được bảo vệ
│   │
│   ├── context/                     # Quản lý state React Context
│   │   ├── AuthContext.jsx          # State xác thực & đăng nhập người dùng
│   │   └── CartContext.jsx          # Quản lý state giỏ hàng
│   │
│   ├── pages/                       # Các trang hướng đến người dùng
│   │   ├── HomePage.jsx             # Danh sách sản phẩm với danh mục & tìm kiếm
│   │   ├── ProductDetail.jsx        # Trang chi tiết sản phẩm riêng lẻ
│   │   ├── CartPage.jsx             # Hiển thị giỏ hàng
│   │   ├── Checkout.jsx             # Trang thanh toán & thanh toán
│   │   ├── LoginPage.jsx            # Trang đăng nhập người dùng
│   │   ├── RegisterPage.jsx         # Trang đăng ký người dùng
│   │   ├── Profile.jsx              # Quản lý hồ sơ người dùng
│   │   ├── MyOrders.jsx             # Lịch sử đơn hàng của người dùng
│   │   ├── OrderDetail.jsx          # Chi tiết đơn hàng & theo dõi
│   │   └── PaymentReturn.jsx        # Trang xác nhận thanh toán
│   │
│   ├── assets/                      # Hình ảnh, phông chữ và tệp tĩnh
│   ├── App.jsx                      # Thành phần ứng dụng chính với định tuyến
│   ├── App.css                      # Kiểu dáng ứng dụng toàn cục
│   ├── index.css                    # Đặt lại CSS & tiện ích toàn cục
│   └── main.jsx                     # Điểm vào ứng dụng React
│
├── index.html                       # Mẫu HTML
├── package.json                     # Phụ thuộc dự án
├── vite.config.js                   # Cấu hình Vite
├── tailwind.config.js               # Cấu hình Tailwind CSS
├── postcss.config.js                # Cấu hình PostCSS
├── eslint.config.js                 # Cấu hình ESLint
└── README.md                        # Tệp này
```

## 🚀 Cài Đặt và Thiết Lập

### Điều Kiện Tiên Quyết
- Node.js (v16 hoặc cao hơn)
- npm hoặc trình quản lý gói yarn
- API backend chạy trên `http://localhost:8080/api`

### Các Bước Cài Đặt

1. **Sao chép repository**
```bash
git clone <repository-url>
cd furniture-frontend
```

2. **Cài đặt các phụ thuộc**
```bash
npm install
```

3. **Cấu hình URL API cơ sở** (nếu cần)
Chỉnh sửa `src/api/api.jsx` và cập nhật `baseURL`:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:8080/api',  // Cập nhật URL này
  ...
})
```

4. **Khởi động máy chủ phát triển**
```bash
npm run dev
```
Ứng dụng sẽ có sẵn tại `http://localhost:5173`

## 📜 Script Có Sẵn

```bash
# Khởi động máy chủ phát triển với tải lại nóng
npm run dev

# Xây dựng cho sản xuất
npm run build

# Xem trước bản dựng sản xuất cục bộ
npm run preview

# Chạy ESLint để kiểm tra chất lượng mã
npm lint
```

## 🎯 Chi Tiết Tính Năng Chính

### 1. **Quản Lý Sản Phẩm**
- **Trang Chủ**: Hiển thị tất cả sản phẩm với phân trang
- **Lọc**: Lọc theo danh mục, khoảng giá, xếp hạng
- **Tìm Kiếm**: Chức năng tìm kiếm sản phẩm thời gian thực
- **Chi Tiết Sản Phẩm**: Chế độ xem sản phẩm chi tiết với thư viện ảnh, thông số kỹ thuật
- **Thêm Vào Giỏ**: Thêm vào giỏ nhanh chóng với lựa chọn số lượng

### 2. **Giỏ Hàng**
- Lưu trữ bền vững bằng localStorage
- Thêm, xóa, cập nhật hoạt động số lượng
- Tính toán tổng giỏ hàng thời gian thực
- Tính toán phí vận chuyển tự động (50.000 VND cho đơn hàng < 2.000.000 VND)
- Phản hồi trực quan rõ ràng cho các hành động giỏ hàng

### 3. **Xác Thực Người Dùng**
- Đăng ký với xác nhận email
- Đăng nhập với xác thực mã thông báo JWT
- Lưu trữ mã thông báo an toàn trong localStorage
- Đăng xuất tự động khi mã thông báo hết hạn
- Các tuyến đường được bảo vệ cho người dùng được xác thực

### 4. **Thanh Toán & Thanh Toán**
- Quy trình thanh toán nhiều bước
- Tích hợp cổng thanh toán (hỗ trợ nhiều phương thức thanh toán)
- Xác nhận đơn hàng với biên lai
- Theo dõi trạng thái thanh toán

### 5. **Quản Lý Đơn Hàng**
- Xem tất cả các đơn hàng của người dùng với phân trang
- Thông tin đơn hàng chi tiết
- Theo dõi trạng thái thanh toán
- Lịch sử đơn hàng với dấu thời gian

### 6. **Bảng Điều Khiển Admin**
- Bảng điều khiển thống kê thời gian thực
- Theo dõi doanh thu theo thời kỳ
- Thống kê sản phẩm (tổng cộng, đang hoạt động, hàng tồn kho thấp)
- Danh sách đơn hàng gần đây
- Biểu đồ doanh thu và phân tích
- Điều hướng nhanh đến các mô-đun quản lý

### 7. **Quản Lý Sản Phẩm Admin**
- Liệt kê tất cả sản phẩm với phân trang và sắp xếp
- Tìm kiếm sản phẩm theo tên
- Lựa chọn hàng loạt và xóa hàng loạt
- Chỉnh sửa sản phẩm hiện có
- Thêm sản phẩm mới với tải lên hình ảnh
- Hỗ trợ chức năng xuất/nhập

### 8. **Tích Hợp Chatbot**
- Chatbot hỗ trợ khách hàng do AI cung cấp
- Lịch sử hội thoại dựa trên phiên
- Trao đổi tin nhắn thời gian thực
- Quản lý lịch sử trò chuyện

## 🔌 Tích Hợp API

### Cấu Hình API
Ứng dụng sử dụng Axios cho các yêu cầu HTTP với cấu hình sau:

```javascript
// URL cơ sở
baseURL: 'http://localhost:8080/api'

// Quản lý Mã Thông Báo Tự Động
- Bộ chặn yêu cầu thêm mã thông báo JWT từ localStorage
- Bộ chặn phản hồi xử lý lỗi và hết hạn mã thông báo
- Đăng xuất tự động trên phản hồi 401 Không được phép

// Thời gian chờ
timeout: 10000 (10 giây)
```

### Các Điểm Cuối API Chính Được Sử Dụng

#### Sản Phẩm
- `GET /products` - Liệt kê tất cả sản phẩm
- `GET /products/:id` - Lấy chi tiết sản phẩm
- `GET /products/search` - Tìm kiếm sản phẩm với bộ lọc
- `GET /products/category/:id` - Lấy sản phẩm theo danh mục
- `GET /products/best-selling` - Lấy sản phẩm bán chạy nhất
- `GET /products/high-rated` - Lấy sản phẩm được xếp hạng cao
- `GET /products/discounted` - Lấy sản phẩm có chiết khấu
- `GET /products/paginated` - Danh sách sản phẩm phân trang
- `POST /products` - Tạo sản phẩm
- `PUT /products/:id` - Cập nhật sản phẩm
- `DELETE /products/:id` - Xóa sản phẩm

#### Đơn Hàng
- `GET /orders` - Liệt kê các đơn hàng của người dùng
- `GET /orders/:id` - Lấy chi tiết đơn hàng
- `GET /orders/paginated` - Đơn hàng phân trang (admin)
- `POST /orders` - Tạo đơn hàng
- `PUT /orders/:id` - Cập nhật đơn hàng

#### Xác Thực
- `POST /auth/register` - Đăng ký người dùng mới
- `POST /auth/login` - Đăng nhập người dùng
- `POST /auth/admin-login` - Đăng nhập admin
- `GET /auth/profile` - Lấy hồ sơ người dùng

#### Admin
- `GET /products/statistics` - Thống kê sản phẩm
- `GET /reports/revenue/quick` - Báo cáo doanh thu nhanh
- `GET /categories` - Liệt kê danh mục
- `GET /reviews` - Liệt kê đánh giá
- `GET /users` - Liệt kê người dùng

#### Chatbot
- `POST /chatbot/chat` - Gửi tin nhắn trò chuyện
- `GET /chatbot/history/:sessionId` - Lấy lịch sử trò chuyện
- `DELETE /chatbot/history/:sessionId` - Xóa lịch sử trò chuyện

## 💾 Quản Lý State

### AuthContext
Quản lý state xác thực người dùng:
```javascript
{
  user: { fullName, email, id, ... } | null,
  login(userData),        // Đặt người dùng và mã thông báo
  logout()               // Xóa state xác thực
}
```

### CartContext
Quản lý state giỏ hàng:
```javascript
{
  cartItems: [{ id, name, price, discountPrice, quantity, ... }],
  cartCount: number,
  addToCart(product),           // Thêm sản phẩm với xử lý trùng lặp
  removeFromCart(productId),    // Xóa sản phẩm
  updateQuantity(productId, qty), // Cập nhật số lượng sản phẩm
  clearCart()                   // Xóa toàn bộ giỏ hàng
}
```

**Lưu trữ**: Cả hai bối cảnh đều duy trì dữ liệu để localStorage để phục hồi phiên.

## 🧩 Tổng Quan Các Thành Phần

### Thành Phần Dùng Chung
- **Header**: Điều hướng chính với tìm kiếm, giỏ hàng, menu người dùng
- **HeaderPage**: Tiêu đề phụ cho tiêu đề trang và breadcrumbs
- **Footer**: Chân trang với thông tin công ty và liên kết
- **ProductCard**: Thành phần hiển thị sản phẩm có thể tái sử dụng
- **AdvancedFilter**: Modal để lọc sản phẩm nâng cao
- **ChatbotWidget**: Widget chatbot nổi

### Bảo Vệ Tuyến Đường
- **AdminRoute**: Bảo vệ các trang admin, chuyển hướng những người dùng chưa được xác thực để quản trị viên đăng nhập
- **ProtectedRoute**: Bảo vệ các trang người dùng, chuyển hướng đến đăng nhập nếu cần

## 📊 Bảng Điều Khiển Admin

Bảng điều khiển admin cung cấp những hiểu biết toàn diện:

### Các Phần Bảng Điều Khiển
1. **Thẻ Thống Kê**
   - Doanh thu hàng tháng
   - Tổng số sản phẩm
   - Tổng số đơn hàng
   - Số lượng người dùng

2. **Biểu Đồ & Phân Tích**
   - Biểu đồ xu hướng doanh thu (Biểu Đồ Khu Vực)
   - Phân phối danh mục sản phẩm (Biểu Đồ Tròn)
   - Danh sách các đơn hàng gần đây
   - Chỉ số hiệu suất

3. **Hành Động Nhanh**
   - Điều hướng đến quản lý sản phẩm
   - Điều hướng đến quản lý đơn hàng
   - Điều hướng đến báo cáo doanh thu
   - Nút thêm sản phẩm mới

### Các Trang Quản Lý Admin
- **Sản Phẩm**: CRUD đầy đủ với các hoạt động hàng loạt
- **Đơn Hàng**: Xem danh sách, xem chi tiết, cập nhật trạng thái
- **Người Dùng**: Xem danh sách người dùng và chi tiết
- **Danh Mục**: Quản lý danh mục sản phẩm
- **Đánh Giá**: Giám sát các đánh giá sản phẩm
- **Doanh Thu**: Báo cáo tài chính chi tiết

## 🤝 Đóng Góp

Để đóng góp cho dự án này:

1. Tạo nhánh tính năng (`git checkout -b feature/AmazingFeature`)
2. Cam kết các thay đổi của bạn (`git commit -m 'Add some AmazingFeature'`)
3. Đẩy đến nhánh (`git push origin feature/AmazingFeature`)
4. Mở Yêu Cầu Kéo

### Các Tiêu Chuẩn Mã
- Sử dụng ESLint để kiểm tra chất lượng mã
- Tuân theo các phương pháp hay nhất của React và mô hình hook
- Sử dụng Tailwind CSS để tạo kiểu
- Giữ các thành phần tập trung và có thể tái sử dụng
- Thêm nhận xét cho logic phức tạp

## 📝 Thiết Lập Môi Trường

Tạo tệp `.env` (nếu cần cho các cấu hình trong tương lai):
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=FurnitureShop
```

## 🐛 Xử Lý Sự Cố

### Các Sự Cố Phổ Biến

1. **Lỗi Kết Nối API**
   - Đảm bảo máy chủ backend chạy trên cổng 8080
   - Kiểm tra cấu hình `src/api/api.jsx` baseURL
   - Xác minh kết nối mạng

2. **Dữ Liệu Giỏ Hàng Không Tồn Tại**
   - Kiểm tra cài đặt localStorage của trình duyệt
   - Xóa bộ nhớ cache trình duyệt và thử lại
   - Xác minh localStorage không bị vô hiệu hóa

3. **Các Tuyến Admin Quay Lại Đăng Nhập**
   - Đảm bảo mã thông báo admin hợp lệ
   - Kiểm tra hết hạn mã thông báo trong backend
   - Xóa localStorage và đăng nhập lại

4. **Lỗi Xây Dựng**
   - Chạy `npm install` để đảm bảo tất cả các phụ thuộc được cài đặt
   - Kiểm tra khả năng tương thích phiên bản Node.js (v16+)
   - Xóa node_modules và cài đặt lại nếu cần: `rm -rf node_modules && npm install`

## 📞 Hỗ Trợ

Để nhận trợ giúp về các vấn đề và câu hỏi:
- Kiểm tra các vấn đề hiện có trong repository
- Tạo một vấn đề mới với mô tả chi tiết
- Bao gồm thông báo lỗi và các bước tái tạo

## 📄 Giấy Phép

Dự án này là độc quyền và bảo mật. Sao chép trái phép dự án này bị nghiêm cấm.

---

**Chúc mã hóa vui vẻ! 🚀**

Được xây dựng bằng ❤️ bằng React, Vite và Tailwind CSS

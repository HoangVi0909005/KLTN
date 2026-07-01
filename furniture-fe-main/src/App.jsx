import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Home from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import AdminProduct from './admin/AdminProduct';
import AdminOrder from './admin/AdminOrder';
// import ProtectedRoute từ folder components của bạn...
import AdminLayout from './admin/AdminLayout';
import CheckoutPage from './pages/Checkout';
import Profile from './pages/Profile';
import AdminProductAdd from './admin/AdminProductAdd';
import AdminProductEdit from './admin/AdminProductEdit';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import AdminOrderDetail from './admin/AdminOrderDetail';
import AdminUser from './admin/AdminUser';
import AdminCategory from './admin/AdminCategory';
import AdminReview from './admin/AdminReview';
import AdminRevenue from './admin/AdminRevenue';
import PaymentReturn from './pages/PaymentReturn';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/payment-return" element={<PaymentReturn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminProduct />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/add"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminProductAdd />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/edit/:id"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminProductEdit />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminOrder />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/orders/:id"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminOrderDetail />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminUser />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/categories"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminCategory />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/reviews"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminReview />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/revenues"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminRevenue />
                  </AdminLayout>
                </AdminRoute>
              }
            />
          </Routes>
        </BrowserRouter>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
export default App;
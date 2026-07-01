import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Đang kiểm tra quyền...</div>;

    // Nếu chưa đăng nhập hoặc không phải ADMIN -> Đá về trang login admin
    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/admin/login" />;
    }

    return children;
};

export default AdminRoute;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Package, Eye, XCircle, Clock, CheckCircle, Truck, Box } from 'lucide-react';
import HeaderPage from '../components/HeaderPage';

const MyOrders = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/orders/user/${user.id}`);
            if (res.data && res.data.data) {
                const sortedOrders = res.data.data.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setOrders(sortedOrders);
                setFilteredOrders(sortedOrders);
            }
        } catch (err) {
            console.error("Lỗi lấy đơn hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (status) => {
        setActiveTab(status);
        if (status === 'ALL') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order => order.status === status));
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

        try {
            await api.delete(`/orders/${orderId}/cancel`);
            alert("Hủy đơn hàng thành công!");
            fetchOrders();
        } catch (err) {
            console.error("Lỗi hủy đơn:", err);
            alert(err.response?.data?.message || "Không thể hủy đơn hàng!");
        }
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
            CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
            PROCESSING: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-700', icon: Box },
            SHIPPING: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700', icon: Truck },
            DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-700', icon: CheckCircle },
            CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle }
        };
        return statusMap[status] || statusMap.PENDING;
    };

    const tabs = [
        { key: 'ALL', label: 'Tất cả', count: orders.length },
        { key: 'PENDING', label: 'Chờ xác nhận', count: orders.filter(o => o.status === 'PENDING').length },
        { key: 'CONFIRMED', label: 'Đã xác nhận', count: orders.filter(o => o.status === 'CONFIRMED').length },
        { key: 'SHIPPING', label: 'Đang giao', count: orders.filter(o => o.status === 'SHIPPING').length },
        { key: 'DELIVERED', label: 'Đã giao', count: orders.filter(o => o.status === 'DELIVERED').length },
        { key: 'CANCELLED', label: 'Đã hủy', count: orders.filter(o => o.status === 'CANCELLED').length }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải đơn hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <HeaderPage />
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                            <Package size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
                            <p className="text-gray-600">Quản lý và theo dõi đơn hàng</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-md mb-6 overflow-x-auto">
                    <div className="flex border-b">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={`flex-1 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${activeTab === tab.key
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                        <Package size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
                        <p className="text-gray-600 mb-6">Hãy khám phá và đặt hàng ngay!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                        >
                            Tiếp tục mua sắm
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => {
                            const statusInfo = getStatusInfo(order.status);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <div key={order.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                    {/* Order Header */}
                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                                                <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                                            </div>
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${statusInfo.color}`}>
                                                <StatusIcon size={18} />
                                                {statusInfo.label}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-6">
                                        <div className="space-y-4 mb-6">
                                            {order.items.slice(0, 2).map((item, index) => (
                                                <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div className="w-20 h-20 bg-white rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                                                        {/* Lấy hình ảnh từ item.imageUrl */}
                                                        <img
                                                            src={item.imageUrl || 'https://placehold.co/400x400?text=Furniture'}
                                                            className="w-full h-full object-cover"
                                                            alt={item.productName}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900 line-clamp-1">{item.productName}</p>
                                                        <p className="text-sm text-gray-500 font-medium">Số lượng: {item.quantity}</p>
                                                        <p className="font-bold text-blue-600 mt-1">{formatPrice(item.price)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {order.items.length > 2 && (
                                                <p className="text-xs text-gray-500 text-center font-bold uppercase tracking-wider py-2 bg-gray-100 rounded-xl">
                                                    + {order.items.length - 2} sản phẩm khác
                                                </p>
                                            )}
                                        </div>

                                        {/* Order Footer */}
                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Tổng tiền:</p>
                                                <p className="text-2xl font-bold text-blue-600">{formatPrice(order.totalAmount)}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/orders/${order.id}`)}
                                                    className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold flex items-center gap-2"
                                                >
                                                    <Eye size={18} />
                                                    Xem chi tiết
                                                </button>
                                                {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-semibold flex items-center gap-2"
                                                    >
                                                        <XCircle size={18} />
                                                        Hủy đơn
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
    ArrowLeft, Package, MapPin, User, Phone, CreditCard,
    Truck, CheckCircle, Clock, XCircle, FileText
} from 'lucide-react';
import Header from '../components/Header';
import HeaderPage from '../components/HeaderPage';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrderDetail();
    }, [id, user, navigate]);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/orders/${id}`);
            if (res.data && res.data.data) {
                setOrder(res.data.data);
            }
        } catch (err) {
            console.error("Lỗi lấy chi tiết đơn hàng:", err);
            alert("Không tìm thấy đơn hàng!");
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

        try {
            await api.delete(`/orders/${id}/cancel`);
            alert("Hủy đơn hàng thành công!");
            fetchOrderDetail();
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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
            CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle },
            PROCESSING: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-700 border-indigo-300', icon: Package },
            SHIPPING: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: Truck },
            DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
            CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle }
        };
        return statusMap[status] || statusMap.PENDING;
    };

    const getPaymentMethodLabel = (method) => {
        const methodMap = {
            COD: 'Thanh toán khi nhận hàng',
            VNPAY: 'VNPay',
            MOMO: 'MoMo',
            BANK_TRANSFER: 'Chuyển khoản ngân hàng'
        };
        return methodMap[method] || method;
    };

    const getPaymentStatusInfo = (status) => {
        const statusMap = {
            UNPAID: { label: 'Chưa thanh toán', color: 'text-yellow-600' },
            PAID: { label: 'Đã thanh toán', color: 'text-green-600' },
            REFUNDED: { label: 'Đã hoàn tiền', color: 'text-blue-600' }
        };
        return statusMap[status] || statusMap.UNPAID;
    };

    const getOrderTimeline = (status) => {
        const allSteps = [
            { key: 'PENDING', label: 'Đơn hàng đã đặt', icon: Package },
            { key: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircle },
            { key: 'PROCESSING', label: 'Đang chuẩn bị', icon: Package },
            { key: 'SHIPPING', label: 'Đang giao hàng', icon: Truck },
            { key: 'DELIVERED', label: 'Đã giao hàng', icon: CheckCircle }
        ];

        const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED'];
        const currentIndex = statusOrder.indexOf(status);

        return allSteps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            active: index === currentIndex
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const statusInfo = getStatusInfo(order.status);
    const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus);
    const StatusIcon = statusInfo.icon;
    const timeline = order.status !== 'CANCELLED' ? getOrderTimeline(order.status) : [];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <HeaderPage />
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4 font-semibold"
                    >
                        <ArrowLeft size={20} />
                        Quay lại danh sách đơn hàng
                    </button>

                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết đơn hàng</h1>
                                <p className="text-gray-600">Mã đơn: <span className="font-bold text-blue-600">#{order.orderNumber}</span></p>
                                <p className="text-sm text-gray-500 mt-1">Đặt lúc: {formatDate(order.createdAt)}</p>
                            </div>
                            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 font-bold text-lg ${statusInfo.color}`}>
                                <StatusIcon size={24} />
                                {statusInfo.label}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline - Only show if not cancelled */}
                {order.status !== 'CANCELLED' && (
                    <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Tiến trình đơn hàng</h2>
                        <div className="relative">
                            <div className="flex justify-between">
                                {timeline.map((step, index) => {
                                    const StepIcon = step.icon;
                                    return (
                                        <div key={step.key} className="flex flex-col items-center flex-1 relative">
                                            {index < timeline.length - 1 && (
                                                <div className={`absolute top-6 left-1/2 w-full h-1 ${step.completed ? 'bg-blue-600' : 'bg-gray-200'
                                                    }`} style={{ zIndex: 0 }}></div>
                                            )}
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${step.completed
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-400'
                                                }`}>
                                                <StepIcon size={24} />
                                            </div>
                                            <p className={`text-sm font-semibold mt-2 text-center ${step.completed ? 'text-blue-600' : 'text-gray-400'
                                                }`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Products */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Package size={24} className="text-blue-600" />
                                Sản phẩm ({order.items.length})
                            </h2>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-blue-50/50 transition-all border border-gray-100">
                                        <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                            <img
                                                src={item.imageUrl || 'https://placehold.co/400x400?text=Furniture'}
                                                className="w-full h-full object-cover"
                                                alt={item.productName}
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="font-black text-gray-900 text-lg line-clamp-1">{item.productName}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <p className="text-gray-500 font-bold">x{item.quantity}</p>
                                                <p className="font-bold text-blue-600">{formatPrice(item.price)}</p>
                                            </div>
                                            <p className="text-sm text-gray-400 mt-2">
                                                Thành tiền: <span className="font-black text-gray-700">{formatPrice(item.subtotal)}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <MapPin size={24} className="text-green-600" />
                                Thông tin giao hàng
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <User size={20} className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-600">Người nhận</p>
                                        <p className="font-bold text-gray-900">{order.recipientName}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone size={20} className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-600">Số điện thoại</p>
                                        <p className="font-bold text-gray-900">{order.recipientPhone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin size={20} className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                                        <p className="font-bold text-gray-900">{order.shippingAddress}</p>
                                    </div>
                                </div>
                                {order.note && (
                                    <div className="flex items-start gap-3">
                                        <FileText size={20} className="text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-600">Ghi chú</p>
                                            <p className="font-bold text-gray-900">{order.note}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Payment Info */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <CreditCard size={24} className="text-purple-600" />
                                Thanh toán
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600">Phương thức</p>
                                    <p className="font-bold text-gray-900">{getPaymentMethodLabel(order.paymentMethod)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Trạng thái</p>
                                    <p className={`font-bold ${paymentStatusInfo.color}`}>{paymentStatusInfo.label}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Tổng đơn hàng</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-700">
                                    <span>Tạm tính</span>
                                    <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Phí vận chuyển</span>
                                    <span className="font-semibold text-green-600">Miễn phí</span>
                                </div>
                                <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                                    <span className="text-2xl font-black text-blue-600">{formatPrice(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                            <button
                                onClick={handleCancelOrder}
                                className="w-full px-6 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors font-bold flex items-center justify-center gap-2"
                            >
                                <XCircle size={20} />
                                Hủy đơn hàng
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { ArrowLeft, Package, MapPin, User, Phone, CreditCard, FileText } from 'lucide-react';

const AdminOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

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
            navigate('/admin/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            await api.patch(`/orders/${id}/status`, { status: newStatus });
            alert("Cập nhật trạng thái thành công!");
            fetchOrderDetail();
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái:", err);
            alert("Không thể cập nhật trạng thái!");
        }
    };

    const handleUpdatePaymentStatus = async (newStatus) => {
        try {
            await api.patch(`/orders/${id}/payment-status`, { paymentStatus: newStatus });
            alert("Cập nhật trạng thái thanh toán thành công!");
            fetchOrderDetail();
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái thanh toán:", err);
            alert("Không thể cập nhật trạng thái thanh toán!");
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
            PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
            CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-300' },
            PROCESSING: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
            SHIPPING: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700 border-purple-300' },
            DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-700 border-green-300' },
            CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-300' }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4 font-semibold"
                >
                    <ArrowLeft size={20} />
                    Quay lại danh sách đơn hàng
                </button>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết đơn hàng</h1>
                        <p className="text-gray-600">Mã đơn: <span className="font-bold text-blue-600">#{order.orderNumber}</span></p>
                        <p className="text-sm text-gray-500 mt-1">Đặt lúc: {formatDate(order.createdAt)}</p>
                    </div>
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 font-bold text-lg ${statusInfo.color}`}>
                        {statusInfo.label}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Products */}
                    <div className="border rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package size={24} className="text-blue-600" />
                            Sản phẩm ({order.items.length})
                        </h2>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-20 h-20 bg-white rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                        <img
                                            src={item.imageUrl || 'https://placehold.co/400x400?text=Furniture'}
                                            alt={item.productName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/400x400?text=No+Image';
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{item.productName}</h3>
                                        <p className="text-sm text-gray-600 mt-1">Số lượng: {item.quantity}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <p className="font-bold text-blue-600">{formatPrice(item.price)}</p>
                                            <p className="text-sm text-gray-500">Thành tiền: <span className="font-bold text-gray-900">{formatPrice(item.subtotal)}</span></p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="border rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                    {/* Update Status */}
                    <div className="border rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Cập nhật trạng thái</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Trạng thái đơn hàng
                                </label>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleUpdateStatus(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                                    disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                                >
                                    <option value="PENDING">Chờ xác nhận</option>
                                    <option value="CONFIRMED">Đã xác nhận</option>
                                    <option value="PROCESSING">Đang xử lý</option>
                                    <option value="SHIPPING">Đang giao</option>
                                    <option value="DELIVERED">Đã giao</option>
                                    <option value="CANCELLED">Đã hủy</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Trạng thái thanh toán
                                </label>
                                <select
                                    value={order.paymentStatus}
                                    onChange={(e) => handleUpdatePaymentStatus(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                                >
                                    <option value="UNPAID">Chưa thanh toán</option>
                                    <option value="PAID">Đã thanh toán</option>
                                    <option value="REFUNDED">Đã hoàn tiền</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="border rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard size={24} className="text-purple-600" />
                            Thanh toán
                        </h2>
                        <div>
                            <p className="text-sm text-gray-600">Phương thức</p>
                            <p className="font-bold text-gray-900">{getPaymentMethodLabel(order.paymentMethod)}</p>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tổng đơn hàng</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-700">
                                <span>Tạm tính</span>
                                <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Phí vận chuyển</span>
                                <span className="font-semibold text-green-600">Miễn phí</span>
                            </div>
                            <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                                <span className="text-2xl font-black text-blue-600">{formatPrice(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetail;
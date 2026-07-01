import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Eye, Search, ChevronLeft, ChevronRight, Package, TrendingUp } from 'lucide-react';

const AdminOrder = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Filter
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchOrders();
    }, [currentPage, pageSize]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get('/orders/paginated', {
                params: { page: currentPage, size: pageSize }
            });

            if (res.data && res.data.data) {
                const pageData = res.data.data;
                setOrders(pageData.content);
                setTotalPages(pageData.totalPages);
                setTotalElements(pageData.totalElements);
            }
        } catch (err) {
            console.error("Lỗi lấy đơn hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            alert("Cập nhật trạng thái thành công!");
            fetchOrders();
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái:", err);
            alert("Không thể cập nhật trạng thái!");
        }
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) return;
        const filtered = orders.filter(order => 
            order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setOrders(filtered);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const formatPrice = (price) => 
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
            CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
            PROCESSING: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-700' },
            SHIPPING: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
            DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
            CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' }
        };
        return statusMap[status] || statusMap.PENDING;
    };

    const getPaymentStatusColor = (status) => {
        const colorMap = {
            UNPAID: 'text-yellow-600',
            PAID: 'text-green-600',
            REFUNDED: 'text-blue-600'
        };
        return colorMap[status] || 'text-gray-600';
    };

    // Statistics
    const stats = {
        total: totalElements,
        pending: orders.filter(o => o.status === 'PENDING').length,
        revenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };

    const filteredOrders = statusFilter === 'ALL' 
        ? orders 
        : orders.filter(o => o.status === statusFilter);

    if (loading) {
        return <div className="p-6">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Package size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h2>
                        <p className="text-sm text-gray-600">Tổng {totalElements} đơn hàng</p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Tổng đơn hàng</p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">{stats.total}</p>
                        </div>
                        <Package size={40} className="text-blue-600 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-600 font-medium">Chờ xác nhận</p>
                            <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pending}</p>
                        </div>
                        <Package size={40} className="text-yellow-600 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Doanh thu</p>
                            <p className="text-lg font-bold text-green-700 mt-1">{formatPrice(stats.revenue)}</p>
                        </div>
                        <TrendingUp size={40} className="text-green-600 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo mã đơn hoặc tên người nhận..."
                        className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="PROCESSING">Đang xử lý</option>
                    <option value="SHIPPING">Đang giao</option>
                    <option value="DELIVERED">Đã giao</option>
                    <option value="CANCELLED">Đã hủy</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-4 font-semibold text-gray-600">Mã đơn</th>
                            <th className="p-4 font-semibold text-gray-600">Khách hàng</th>
                            <th className="p-4 font-semibold text-gray-600">Ngày đặt</th>
                            <th className="p-4 font-semibold text-gray-600">Tổng tiền</th>
                            <th className="p-4 font-semibold text-gray-600">Thanh toán</th>
                            <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
                            <th className="p-4 font-semibold text-gray-600">Cập nhật</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-8 text-gray-500">
                                    Không có đơn hàng nào
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => {
                                const statusInfo = getStatusInfo(order.status);
                                return (
                                    <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <span className="font-bold text-blue-600">#{order.orderNumber}</span>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">{order.recipientName}</p>
                                                <p className="text-sm text-gray-500">{order.recipientPhone}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="p-4 font-bold text-blue-600">
                                            {formatPrice(order.totalAmount)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 
                                                 order.paymentStatus === 'UNPAID' ? 'Chưa thanh toán' : 
                                                 'Đã hoàn tiền'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                                            >
                                                <option value="PENDING">Chờ xác nhận</option>
                                                <option value="CONFIRMED">Đã xác nhận</option>
                                                <option value="PROCESSING">Đang xử lý</option>
                                                <option value="SHIPPING">Đang giao</option>
                                                <option value="DELIVERED">Đã giao</option>
                                                <option value="CANCELLED">Đã hủy</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                <div className="text-sm text-gray-600">
                    Hiển thị {filteredOrders.length} / {totalElements} đơn hàng
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Hiển thị:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(parseInt(e.target.value));
                            setCurrentPage(0);
                        }}
                        className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageChange(index)}
                                className={`px-3 py-1 rounded-lg ${
                                    currentPage === index
                                        ? 'bg-blue-600 text-white'
                                        : 'border hover:bg-gray-50'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminOrder;
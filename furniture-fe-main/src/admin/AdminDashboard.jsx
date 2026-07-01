import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { 
    Package, Users, ShoppingCart, DollarSign, 
    TrendingUp, ArrowUpRight, ArrowDownRight,
    AlertCircle, ChevronRight, Activity
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // States cho dữ liệu thật
    const [stats, setStats] = useState(null); // Từ sản phẩm
    const [revenueData, setRevenueData] = useState(null); // Từ báo cáo doanh thu
    const [recentOrders, setRecentOrders] = useState([]); // Từ đơn hàng

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // Gọi đồng thời 3 nguồn dữ liệu chính
                const [productRes, revenueRes, orderRes] = await Promise.all([
                    api.get('/products/statistics'),
                    api.get('/reports/revenue/quick', { params: { period: 'THIS_MONTH' } }),
                    api.get('/orders/paginated', { params: { page: 0, size: 5 } })
                ]);

                setStats(productRes.data.data);
                setRevenueData(revenueRes.data.data);
                setRecentOrders(orderRes.data.data.content);
            } catch (err) {
                console.error("Lỗi tải dữ liệu Dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="p-1 space-y-8 animate-in fade-in duration-500">
            {/* Header Greeting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 tracking-tight">Tổng quan hệ thống</h2>
                    <p className="text-gray-500 mt-1">Chào mừng trở lại, <span className="font-bold text-blue-600">{user?.fullName}</span>. Đây là tình hình kinh doanh tháng này.</p>
                </div>
                <button 
                    onClick={() => navigate('/admin/revenues')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all"
                >
                    <TrendingUp size={18} /> Xem báo cáo chi tiết
                </button>
            </div>

            {/* 4 Thẻ thông số chính - Dữ liệu thật */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Doanh thu tháng" 
                    value={formatCurrency(revenueData?.totalRevenue || 0)} 
                    icon={<DollarSign size={22} />} 
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                    subText="Tính từ đầu tháng"
                />
                <StatCard 
                    title="Đơn hàng" 
                    value={revenueData?.totalOrders || 0} 
                    icon={<ShoppingCart size={22} />} 
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                    subText={`${recentOrders.length} đơn mới nhất`}
                />
                <StatCard 
                    title="Sản phẩm & Kho" 
                    value={stats?.totalProducts || 0} 
                    icon={<Package size={22} />} 
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                    subText={`Tổng tồn: ${stats?.totalStock || 0}`}
                />
                <StatCard 
                    title="Giá trị TB/Đơn" 
                    value={formatCurrency(revenueData?.averageOrderValue || 0)} 
                    icon={<Activity size={22} />} 
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                    subText="Dựa trên doanh số thực"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Biểu đồ Doanh thu theo kỳ (Lấy từ revenueData.revenueByPeriods) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-gray-800">Biểu đồ tăng trưởng</h3>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Doanh thu & Lợi nhuận</div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData?.revenueByPeriods || []}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top 5 Sản phẩm bán chạy */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800 mb-6">Sản phẩm bán chạy</h3>
                    <div className="space-y-4">
                        {revenueData?.topSellingProducts?.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-600">
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.productName}</p>
                                        <p className="text-xs text-gray-500">Đã bán: {item.quantitySold}</p>
                                    </div>
                                </div>
                                <ArrowUpRight size={16} className="text-emerald-500" />
                            </div>
                        ))}
                        <button 
                            onClick={() => navigate('/admin/products')}
                            className="w-full py-2.5 mt-2 text-sm font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                            Xem tất cả sản phẩm
                        </button>
                    </div>
                </div>
            </div>

            {/* Hàng dưới: Đơn hàng gần đây & Cảnh báo kho */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Đơn hàng gần đây */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800">Đơn hàng mới nhất</h3>
                        <button onClick={() => navigate('/admin/orders')} className="text-sm text-blue-600 font-bold hover:underline">Tất cả</button>
                    </div>
                    <div className="divide-y">
                        {recentOrders.map(order => (
                            <div key={order.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                        <ShoppingCart size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">#{order.orderNumber}</p>
                                        <p className="text-xs text-gray-500">{order.recipientName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm text-blue-600">{formatCurrency(order.totalAmount)}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Thông báo & Cảnh báo kho (Dữ liệu logic từ stats) */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                            <AlertCircle className="text-red-500" size={20} />
                            Cảnh báo hệ thống
                        </h3>
                        <div className="space-y-4">
                            {/* Logic: Kiểm tra nếu có SP nào giá cực thấp hoặc cực cao bất thường */}
                            <AlertItem 
                                type="info" 
                                message={`Hệ thống đang quản lý ${stats?.totalProducts} sản phẩm.`} 
                                time="Thời gian thực" 
                            />
                            <AlertItem 
                                type="warning" 
                                message={`Giá bán trung bình hiện tại: ${formatCurrency(stats?.averagePrice || 0)}`} 
                                time="Cập nhật mới nhất" 
                            />
                            {revenueData?.totalOrders > 100 && (
                                <AlertItem 
                                    type="success" 
                                    message="Cửa hàng đạt mốc doanh số ấn tượng trong tháng này!" 
                                    time="Chúc mừng" 
                                />
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl text-white relative overflow-hidden shadow-xl">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-2">Xuất dữ liệu Excel</h3>
                            <p className="text-blue-100 mb-6 text-sm">Tải xuống báo cáo doanh thu và danh sách đơn hàng để lưu trữ offline.</p>
                            <button 
                                onClick={() => navigate('/admin/revenues')}
                                className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg"
                            >
                                Đi đến trang báo cáo <ChevronRight size={18} />
                            </button>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Component phụ trợ ---

const StatCard = ({ title, value, icon, color, bgColor, subText }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl transition-colors ${bgColor} ${color} group-hover:scale-110 duration-300`}>
                {icon}
            </div>
        </div>
        <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{value}</p>
            <p className="text-[10px] text-gray-400 mt-1 italic">{subText}</p>
        </div>
    </div>
);

const AlertItem = ({ type, message, time }) => {
    const colors = {
        warning: 'bg-amber-500',
        success: 'bg-emerald-500',
        info: 'bg-blue-500',
        error: 'bg-red-500'
    };
    return (
        <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
            <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${colors[type]}`}></div>
            <div className="flex-1">
                <p className="text-sm text-gray-700 font-semibold">{message}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase font-bold">{time}</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
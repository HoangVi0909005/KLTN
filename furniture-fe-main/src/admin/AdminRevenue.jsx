import React, { useState } from 'react';
import api from '../api/api';
import { 
    TrendingUp, DollarSign, ShoppingCart, Package, Download, 
    Calendar, BarChart3, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const AdminRevenue = () => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    
    // Form states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportType, setReportType] = useState('MONTH');
    const [quickPeriod, setQuickPeriod] = useState('');

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    // Lấy báo cáo theo khoảng thời gian tùy chọn
    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            alert('Vui lòng chọn khoảng thời gian!');
            return;
        }

        try {
            setLoading(true);
            const response = await api.get('/reports/revenue', {
                params: { startDate, endDate, reportType }
            });

            if (response.data && response.data.data) {
                setReportData(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tạo báo cáo:', error);
            alert('Không thể tạo báo cáo!');
        } finally {
            setLoading(false);
        }
    };

    // Lấy báo cáo nhanh
    const handleQuickReport = async (period) => {
        try {
            setLoading(true);
            setQuickPeriod(period);
            const response = await api.get('/reports/revenue/quick', {
                params: { period }
            });

            if (response.data && response.data.data) {
                setReportData(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tạo báo cáo:', error);
            alert('Không thể tạo báo cáo!');
        } finally {
            setLoading(false);
        }
    };

    // Xuất Excel
    const handleExportExcel = async () => {
        if (!startDate || !endDate) {
            alert('Vui lòng chọn khoảng thời gian!');
            return;
        }

        try {
            setLoading(true);
            const response = await api.get('/reports/revenue/export', {
                params: { startDate, endDate, reportType },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Bao_Cao_Doanh_Thu_${startDate}_${endDate}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('Xuất file Excel thành công!');
        } catch (error) {
            console.error('Lỗi khi xuất Excel:', error);
            alert('Không thể xuất file Excel!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <BarChart3 className="text-blue-600" size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Báo cáo Doanh thu</h1>
                                <p className="text-gray-500 text-sm">Phân tích và thống kê doanh thu</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick period buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => handleQuickReport('TODAY')}
                            className={`px-4 py-2 rounded-lg border transition ${
                                quickPeriod === 'TODAY' 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                            }`}
                        >
                            Hôm nay
                        </button>
                        <button
                            onClick={() => handleQuickReport('THIS_WEEK')}
                            className={`px-4 py-2 rounded-lg border transition ${
                                quickPeriod === 'THIS_WEEK' 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                            }`}
                        >
                            Tuần này
                        </button>
                        <button
                            onClick={() => handleQuickReport('THIS_MONTH')}
                            className={`px-4 py-2 rounded-lg border transition ${
                                quickPeriod === 'THIS_MONTH' 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                            }`}
                        >
                            Tháng này
                        </button>
                        <button
                            onClick={() => handleQuickReport('THIS_QUARTER')}
                            className={`px-4 py-2 rounded-lg border transition ${
                                quickPeriod === 'THIS_QUARTER' 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                            }`}
                        >
                            Quý này
                        </button>
                        <button
                            onClick={() => handleQuickReport('THIS_YEAR')}
                            className={`px-4 py-2 rounded-lg border transition ${
                                quickPeriod === 'THIS_YEAR' 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                            }`}
                        >
                            Năm này
                        </button>
                    </div>

                    {/* Custom date range */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tùy chọn khoảng thời gian</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Từ ngày</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Đến ngày</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Loại báo cáo</label>
                                <select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                >
                                    <option value="DAY">Theo ngày</option>
                                    <option value="WEEK">Theo tuần</option>
                                    <option value="MONTH">Theo tháng</option>
                                    <option value="YEAR">Theo năm</option>
                                </select>
                            </div>
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={handleGenerateReport}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                                >
                                    <Calendar size={18} />
                                    Tạo báo cáo
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    disabled={loading || !reportData}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                                >
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Đang tạo báo cáo...</p>
                    </div>
                )}

                {reportData && !loading && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <SummaryCard
                                icon={<DollarSign size={24} />}
                                title="Tổng doanh thu"
                                value={formatCurrency(reportData.totalRevenue)}
                                iconBg="bg-blue-100"
                                iconColor="text-blue-600"
                            />
                            <SummaryCard
                                icon={<TrendingUp size={24} />}
                                title="Tổng lợi nhuận"
                                value={formatCurrency(reportData.totalProfit)}
                                iconBg="bg-green-100"
                                iconColor="text-green-600"
                            />
                            <SummaryCard
                                icon={<ShoppingCart size={24} />}
                                title="Số đơn hàng"
                                value={reportData.totalOrders.toLocaleString()}
                                iconBg="bg-purple-100"
                                iconColor="text-purple-600"
                            />
                            <SummaryCard
                                icon={<Package size={24} />}
                                title="SP đã bán"
                                value={reportData.totalProductsSold.toLocaleString()}
                                iconBg="bg-orange-100"
                                iconColor="text-orange-600"
                            />
                        </div>

                        {/* Average Order Value */}
                        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm mb-1">Giá trị đơn hàng trung bình</p>
                                    <p className="text-3xl font-bold text-gray-800">
                                        {formatCurrency(reportData.averageOrderValue)}
                                    </p>
                                </div>
                                <div className="bg-indigo-100 p-4 rounded-lg">
                                    <BarChart3 className="text-indigo-600" size={32} />
                                </div>
                            </div>
                        </div>

                        {/* Top Selling Products */}
                        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <PieChart className="text-blue-600" size={24} />
                                <h2 className="text-xl font-bold text-gray-800">Top 10 sản phẩm bán chạy</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="p-3 text-left text-xs font-semibold text-gray-600">STT</th>
                                            <th className="p-3 text-left text-xs font-semibold text-gray-600">Tên sản phẩm</th>
                                            <th className="p-3 text-center text-xs font-semibold text-gray-600">Số lượng</th>
                                            <th className="p-3 text-right text-xs font-semibold text-gray-600">Doanh thu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.topSellingProducts.map((product, index) => (
                                            <tr key={product.productId} className="border-b hover:bg-gray-50 transition">
                                                <td className="p-3 text-sm text-gray-600">{index + 1}</td>
                                                <td className="p-3 text-sm font-medium text-gray-800">{product.productName}</td>
                                                <td className="p-3 text-sm text-center">
                                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                                        {product.quantitySold}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-sm text-right font-bold text-blue-600">
                                                    {formatCurrency(product.revenue)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Revenue by Period */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="text-green-600" size={24} />
                                <h2 className="text-xl font-bold text-gray-800">Doanh thu theo kỳ</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="p-3 text-left text-xs font-semibold text-gray-600">Kỳ</th>
                                            <th className="p-3 text-right text-xs font-semibold text-gray-600">Doanh thu</th>
                                            <th className="p-3 text-right text-xs font-semibold text-gray-600">Lợi nhuận</th>
                                            <th className="p-3 text-center text-xs font-semibold text-gray-600">Đơn hàng</th>
                                            <th className="p-3 text-center text-xs font-semibold text-gray-600">SP bán</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.revenueByPeriods.map((period, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50 transition">
                                                <td className="p-3 text-sm font-medium text-gray-800">{period.period}</td>
                                                <td className="p-3 text-sm text-right font-bold text-blue-600">
                                                    {formatCurrency(period.revenue)}
                                                </td>
                                                <td className="p-3 text-sm text-right font-bold text-green-600">
                                                    {formatCurrency(period.profit)}
                                                </td>
                                                <td className="p-3 text-sm text-center text-gray-700">
                                                    {period.orderCount}
                                                </td>
                                                <td className="p-3 text-sm text-center text-gray-700">
                                                    {period.productsSold}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {!reportData && !loading && (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="text-gray-400" size={40} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có báo cáo</h3>
                        <p className="text-gray-500">Chọn khoảng thời gian và tạo báo cáo để xem dữ liệu</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Summary Card Component
const SummaryCard = ({ icon, title, value, iconBg, iconColor }) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
        <div className="flex items-center justify-between mb-4">
            <div className={`${iconBg} ${iconColor} p-3 rounded-lg`}>
                {icon}
            </div>
        </div>
        <p className="text-gray-600 text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
);

export default AdminRevenue;
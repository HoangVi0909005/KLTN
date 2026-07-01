import React, { useState, useEffect } from 'react';
import { Trash2, Star, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import api from '../api/api';

const AdminReview = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        fetchReviews();
    }, [currentPage]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await api.get('/reviews/all', {
                params: { page: currentPage, size: pageSize }
            });
            if (res.data.success) {
                setReviews(res.data.data.content);
                setTotalPages(res.data.data.totalPages);
                setTotalElements(res.data.data.totalElements);
            }
        } catch (err) {
            console.error("Lỗi lấy đánh giá:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa đánh giá này?")) return;
        try {
            await api.delete(`/reviews/${id}`);
            alert("Đã xóa!");
            fetchReviews();
        } catch (err) {
            console.error("Lỗi xóa đánh giá:", err);
            alert("Lỗi khi xóa");
        }
    };

    if (loading) return <div className="p-6 text-center">Đang tải...</div>;

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="text-blue-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-800">Quản lý Đánh giá</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-4 font-semibold text-gray-600">ID</th>
                            <th className="p-4 font-semibold text-gray-600">Khách hàng</th>
                            <th className="p-4 font-semibold text-gray-600">Đánh giá</th>
                            <th className="p-4 font-semibold text-gray-600 w-1/3">Nội dung</th>
                            <th className="p-4 font-semibold text-gray-600">Ngày gửi</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.length === 0 ? (
                            <tr><td colSpan="6" className="p-10 text-center text-gray-400">Chưa có đánh giá nào</td></tr>
                        ) : (
                            reviews.map((rev) => (
                                <tr key={rev.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-500">#{rev.id}</td>
                                    <td className="p-4 font-medium">{rev.userName}</td>
                                    <td className="p-4">
                                        <div className="flex text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 text-sm italic">"{rev.comment}"</td>
                                    <td className="p-4 text-gray-500 text-sm">
                                        {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(rev.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-500">Tổng cộng {totalElements} đánh giá</p>
                <div className="flex gap-2">
                    <button 
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium">
                        Trang {currentPage + 1} / {totalPages || 1}
                    </span>
                    <button 
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminReview;
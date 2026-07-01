import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

const PaymentReturn = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 1. Tính toán paymentDetail từ URL (Ghi nhớ để tránh tính toán lại thừa)
    const paymentDetail = useMemo(() => {
        const queryParams = new URLSearchParams(location.search);
        const vnp_OrderInfo = queryParams.get('vnp_OrderInfo') || '';
        const vnp_TxnRef = queryParams.get('vnp_TxnRef') || '';
        const vnp_Amount = queryParams.get('vnp_Amount') || '';

        return {
            orderNumber: vnp_TxnRef,
            orderInfo: decodeURIComponent(vnp_OrderInfo.replace(/\+/g, ' ')),
            amount: vnp_Amount ? (parseInt(vnp_Amount) / 100).toLocaleString('vi-VN') + ' ₫' : ''
        };
    }, [location.search]);

    // 2. GIẢI PHÁP CHO LỖI: Tính toán trạng thái ban đầu ngay tại đây
    // Nếu URL không có mã đơn hàng, ta cho trạng thái là 'fail' luôn từ đầu
    const [status, setStatus] = useState(() => {
        const queryParams = new URLSearchParams(location.search);
        const vnp_TxnRef = queryParams.get('vnp_TxnRef');
        const vnp_ResponseCode = queryParams.get('vnp_ResponseCode');
        
        // Nếu thiếu thông tin quan trọng hoặc mã phản hồi không phải 00 (thành công)
        if (!vnp_TxnRef || !vnp_ResponseCode || vnp_ResponseCode !== '00') {
            return 'fail';
        }
        return 'processing'; // Chỉ để processing nếu bước đầu có vẻ ổn
    });

    useEffect(() => {
        // Nếu trạng thái ban đầu đã là 'fail', không cần làm gì thêm trong Effect
        if (status !== 'processing') return;

        const queryParams = new URLSearchParams(location.search);
        const vnp_TxnRef = queryParams.get('vnp_TxnRef');

        const verifyPayment = async () => {
            try {
                // 1. Tìm đơn hàng
                const res = await api.get(`/orders/order-number/${vnp_TxnRef}`);
                const orderId = res.data.data.id;

                // 2. Cập nhật thanh toán thành PAID
                await api.patch(`/orders/${orderId}/payment-status`, { 
                    paymentStatus: 'PAID' 
                });

                // 3. Xác nhận đơn hàng
                await api.patch(`/orders/${orderId}/status`, { 
                    status: 'CONFIRMED' 
                });

                setStatus('success');
            } catch (err) {
                console.error('Lỗi xác thực đơn hàng:', err);
                setStatus('fail'); // Ở đây gọi setState async (trong catch) thì React cho phép
            }
        };

        verifyPayment();
        
    // Chúng ta chỉ chạy lại khi location.search thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]); 

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
                
                {status === 'processing' && (
                    <div className="py-10">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-gray-800">Đang xác thực...</h2>
                        <p className="text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900">Thanh toán thành công!</h2>
                        
                        <div className="mt-6 p-4 bg-gray-50 rounded-2xl text-left space-y-2 border border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Mã đơn hàng:</span>
                                <span className="font-bold text-gray-800">{paymentDetail.orderNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Số tiền:</span>
                                <span className="font-bold text-blue-600">{paymentDetail.amount}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500 italic leading-relaxed">
                                    {paymentDetail.orderInfo}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/orders')} 
                            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                        >
                            Xem đơn hàng của tôi <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {status === 'fail' && (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-12 h-12 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900">Giao dịch thất bại</h2>
                        <p className="text-gray-500 mt-3">Thanh toán không thành công hoặc đã bị hủy.</p>
                        
                        <div className="grid grid-cols-2 gap-3 mt-8">
                            <button onClick={() => navigate('/cart')} className="w-full bg-gray-800 text-white py-4 rounded-2xl font-bold hover:bg-gray-900 transition-all">
                                Thử lại
                            </button>
                            <button onClick={() => navigate('/')} className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                                Trang chủ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentReturn;
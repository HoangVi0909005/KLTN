import React, { useState } from 'react';
import api from '../api/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/users/forgot-password', { email });
            setMessage("Vui lòng kiểm tra email của bạn để lấy link đặt lại mật khẩu.");
        } catch (err) {
            setMessage(err.response?.data?.message || "Có lỗi xảy ra.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Quên mật khẩu</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="email" 
                        placeholder="Nhập email của bạn" 
                        className="w-full p-2.5 border rounded-lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button 
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700"
                    >
                        {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                    </button>
                    {message && <p className="text-center text-sm text-blue-600 mt-4">{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
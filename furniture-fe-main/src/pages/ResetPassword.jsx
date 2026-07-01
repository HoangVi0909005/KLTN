import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(password !== confirmPassword) {
            setMessage("Mật khẩu xác nhận không khớp");
            return;
        }
        try {
            await api.post('/users/reset-password', { token, password });
            alert("Mật khẩu đã được đổi thành công!");
            navigate('/login');
        } catch (err) {
            setMessage(err.response?.data?.message || "Token không hợp lệ hoặc hết hạn");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Đặt lại mật khẩu</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="password" 
                        placeholder="Mật khẩu mới" 
                        className="w-full p-2.5 border rounded-lg"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Xác nhận mật khẩu" 
                        className="w-full p-2.5 border rounded-lg"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700">
                        Cập nhật mật khẩu
                    </button>
                    {message && <p className="text-red-500 text-sm mt-2">{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
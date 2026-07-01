import React, { useState } from 'react';
import { User, Mail, Lock, Phone, MapPin, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import api from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '', password: '', fullName: '', phone: '', address: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const validateForm = () => {
        let newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Họ tên không được để trống";
        if (!formData.email.trim()) {
            newErrors.email = "Email là bắt buộc";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
        }
        if (formData.password.length < 6) newErrors.password = "Mật khẩu không được bỏ trống";
        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = "Số điện thoại không được bỏ trống và phải đúng định dạng";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const res = await api.post('/users/register', formData);
            if (res.data.success) {
                login(res.data.data);
                alert("Chúc mừng! Bạn đã đăng ký thành công.");
                navigate('/');
            }
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.data) {
                setErrors(error.response.data.data);
            } else {
                alert(error.response?.data?.message || "Đăng ký thất bại");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getInputClass = (name) => `w-full pl-10 pr-4 py-2 border rounded-xl outline-none transition-all ${
        errors[name] ? "border-red-500 focus:ring-red-100" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
    }`;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-green-600 p-6 text-white text-center">
                    <h2 className="text-2xl font-bold">Tạo Tài Khoản Mới</h2>
                    <p className="text-green-500 bg-white inline-block px-3 py-1 rounded-full text-xs font-bold mt-2">
                        JOIN THE FURNITURE COMMUNITY
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    <div className="relative">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Họ và tên</label>
                        <div className="relative mt-1">
                            <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input name="fullName" type="text" className={getInputClass('fullName')} placeholder="Nguyễn Văn A" onChange={handleChange} />
                        </div>
                        {errors.fullName && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">{errors.fullName}</p>}
                    </div>

                    <div className="relative">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                        <div className="relative mt-1">
                            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input name="email" type="email" className={getInputClass('email')} placeholder="email@example.com" onChange={handleChange} />
                        </div>
                        {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">{errors.email}</p>}
                    </div>

                    <div className="relative">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mật khẩu</label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input name="password" type="password" className={getInputClass('password')} placeholder="••••••••" onChange={handleChange} />
                        </div>
                        {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">{errors.password}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Số điện thoại</label>
                            <div className="relative mt-1">
                                <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input name="phone" type="text" className={getInputClass('phone')} placeholder="0987xxxxxx" onChange={handleChange} />
                            </div>
                            {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">{errors.phone}</p>}
                        </div>
                        <div className="relative">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Địa chỉ</label>
                            <div className="relative mt-1">
                                <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input name="address" type="text" className={getInputClass('address')} placeholder="TP. Hồ Chí Minh" onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all mt-6 flex items-center justify-center gap-2 shadow-lg shadow-green-100 disabled:bg-green-400"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />}
                        Đăng Ký Ngay
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-gray-500 text-sm">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="text-green-600 font-bold hover:underline">Đăng nhập</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
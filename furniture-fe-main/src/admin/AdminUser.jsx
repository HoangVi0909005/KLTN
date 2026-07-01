import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight, User, Lock, Mail, Phone, MapPin, Shield, CheckCircle, XCircle } from 'lucide-react';

const AdminUser = () => {
    const Navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    // Filter states
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        address: '',
        role: 'CUSTOMER',
        isActive: true
    });

    useEffect(() => {
        fetchUsers();
    }, [currentPage, pageSize, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            
            if (res.data && res.data.data) {
                let filteredUsers = res.data.data;
                
                // Apply filters
                if (roleFilter !== 'ALL') {
                    filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
                }
                if (statusFilter !== 'ALL') {
                    const isActive = statusFilter === 'ACTIVE';
                    filteredUsers = filteredUsers.filter(u => u.isActive === isActive);
                }
                
                // Apply search
                if (searchTerm.trim()) {
                    filteredUsers = filteredUsers.filter(u => 
                        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (u.phone && u.phone.includes(searchTerm))
                    );
                }
                
                // Manual pagination
                setTotalElements(filteredUsers.length);
                setTotalPages(Math.ceil(filteredUsers.length / pageSize));
                
                const startIndex = currentPage * pageSize;
                const endIndex = startIndex + pageSize;
                setUsers(filteredUsers.slice(startIndex, endIndex));
            }
        } catch (err) {
            console.error("Lỗi lấy users:", err);
            alert("Không thể tải danh sách người dùng!");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
                alert("Xóa thành công!");
            } catch (err) {
                console.error(err);
                alert("Lỗi khi xóa!");
            }
        }
    };

    const handleSearch = () => {
        setCurrentPage(0);
        fetchUsers();
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (e) => {
        setPageSize(parseInt(e.target.value));
        setCurrentPage(0);
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            fullName: '',
            phone: '',
            address: '',
            role: 'CUSTOMER',
            isActive: true
        });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/register', formData);
            alert("Thêm người dùng thành công!");
            setShowAddModal(false);
            resetForm();
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Lỗi khi thêm người dùng!");
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            password: '', // Không hiển thị password cũ
            fullName: user.fullName,
            phone: user.phone || '',
            address: user.address || '',
            role: user.role,
            isActive: user.isActive
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const updateData = { ...formData };
            // Nếu không nhập password mới, xóa field password
            if (!updateData.password) {
                delete updateData.password;
            }
            
            await api.put(`/users/${selectedUser.id}`, updateData);
            alert("Cập nhật thành công!");
            setShowEditModal(false);
            resetForm();
            setSelectedUser(null);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Lỗi khi cập nhật!");
        }
    };

    const UserFormModal = ({ isEdit = false, onClose, onSubmit }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XCircle size={24} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Mail size={16} className="inline mr-2" />
                                Email *
                            </label>
                            <input
                                type="email"
                                required
                                disabled={isEdit}
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                                placeholder="user@example.com"
                            />
                        </div>

                        {/* Password */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Lock size={16} className="inline mr-2" />
                                Mật khẩu {!isEdit && '*'}
                            </label>
                            <input
                                type="password"
                                required={!isEdit}
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={isEdit ? "Để trống nếu không đổi mật khẩu" : "Nhập mật khẩu"}
                            />
                        </div>

                        {/* Full Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <User size={16} className="inline mr-2" />
                                Họ và tên *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Phone size={16} className="inline mr-2" />
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0123456789"
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Shield size={16} className="inline mr-2" />
                                Vai trò *
                            </label>
                            <select
                                required
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="CUSTOMER">Khách hàng</option>
                                <option value="ADMIN">Quản trị viên</option>
                            </select>
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <MapPin size={16} className="inline mr-2" />
                                Địa chỉ
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                rows="3"
                                placeholder="Nhập địa chỉ..."
                            />
                        </div>

                        {/* Active Status */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Tài khoản hoạt động</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition-all"
                        >
                            {isEdit ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold transition-all"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo email, tên, SĐT..."
                        className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSearch}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
                    >
                        Tìm kiếm
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                    >
                        <Plus size={18} /> Thêm người dùng
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-gray-600">Vai trò:</label>
                    <select
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setCurrentPage(0);
                        }}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="ALL">Tất cả</option>
                        <option value="CUSTOMER">Khách hàng</option>
                        <option value="ADMIN">Quản trị viên</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-gray-600">Trạng thái:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(0);
                        }}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="ALL">Tất cả</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Khóa</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-4 font-semibold text-gray-600">ID</th>
                            <th className="p-4 font-semibold text-gray-600">Email</th>
                            <th className="p-4 font-semibold text-gray-600">Họ và tên</th>
                            <th className="p-4 font-semibold text-gray-600">SĐT</th>
                            <th className="p-4 font-semibold text-gray-600">Vai trò</th>
                            <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
                            <th className="p-4 font-semibold text-gray-600">Ngày tạo</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-8 text-gray-500">
                                    Không có người dùng nào
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-500">#{user.id}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-bold text-sm">
                                                    {user.fullName?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="font-medium">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">{user.fullName}</td>
                                    <td className="p-4 text-gray-600">{user.phone || '-'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            user.role === 'ADMIN' 
                                                ? 'bg-purple-100 text-purple-700' 
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {user.role === 'ADMIN' ? 'Admin' : 'Khách hàng'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                                            user.isActive 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {user.isActive ? (
                                                <><CheckCircle size={12} /> Hoạt động</>
                                            ) : (
                                                <><XCircle size={12} /> Khóa</>
                                            )}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                <div className="text-sm text-gray-600">
                    Hiển thị {users.length} / {totalElements} người dùng
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Hiển thị:</span>
                    <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
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
                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageChange(index)}
                                className={`px-3 py-1 rounded-lg transition-all ${
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
                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <UserFormModal 
                    isEdit={false}
                    onClose={() => {
                        setShowAddModal(false);
                        resetForm();
                    }}
                    onSubmit={handleAddUser}
                />
            )}

            {showEditModal && (
                <UserFormModal 
                    isEdit={true}
                    onClose={() => {
                        setShowEditModal(false);
                        resetForm();
                        setSelectedUser(null);
                    }}
                    onSubmit={handleUpdateUser}
                />
            )}
        </div>
    );
};

export default AdminUser;
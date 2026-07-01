import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '../api/api'; // Đảm bảo import đúng đường dẫn api đã cấu hình axios

const AdminCategory = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: ''
    });
    const [errors, setErrors] = useState({});

    // Pagination states (Phân trang tại Frontend)
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    // Sorting states
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('asc');

    useEffect(() => {
        fetchCategories();
    }, []);

    // Mỗi khi thay đổi tìm kiếm, sắp xếp hoặc phân trang thì tính toán lại list hiển thị
    useEffect(() => {
        processData();
    }, [categories, searchTerm, sortBy, sortDir, currentPage, pageSize]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            // Dùng axios (api) thay vì fetch để đồng nhất với Product
            const response = await api.get('/categories');

            // Kiểm tra cấu trúc ApiResponse của bạn
            if (response.data && response.data.success) {
                setCategories(response.data.data); // Lưu toàn bộ data gốc vào state
            }
        } catch (error) {
            console.error('Lỗi lấy categories:', error);
            alert('Lỗi khi tải danh sách categories!');
        } finally {
            setLoading(false);
        }
    };

    const handlePageSizeChange = (e) => {
        setPageSize(parseInt(e.target.value));
        setCurrentPage(0); // Reset về trang đầu tiên khi thay đổi số lượng hiển thị mỗi trang
    };

    const processData = () => {
        let result = [...categories];

        // 1. Search
        if (searchTerm.trim()) {
            result = result.filter(cat =>
                cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // 2. Sort
        result.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            if (sortDir === 'asc') return aValue > bValue ? 1 : -1;
            return aValue < bValue ? 1 : -1;
        });

        setTotalElements(result.length);

        // 3. Pagination
        const startIndex = currentPage * pageSize;
        const paginatedData = result.slice(startIndex, startIndex + pageSize);
        setFilteredCategories(paginatedData);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setErrors({ name: 'Tên category là bắt buộc' });
            return;
        }

        setLoading(true);
        try {
            let response;
            if (editingCategory) {
                response = await api.put(`/categories/${editingCategory.id}`, formData);
            } else {
                response = await api.post('/categories', formData);
            }

            if (response.data && response.data.success) {
                alert(editingCategory ? "Cập nhật thành công" : "Thêm mới thành công");
                fetchCategories();
                handleCloseModal();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi lưu category!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa category này?')) return;
        try {
            const response = await api.delete(`/categories/${id}`);
            if (response.data && response.data.success) {
                alert("Xóa thành công");
                fetchCategories();
            }
        } catch (error) {
            console.error('Lỗi xóa category:', error);
            alert('Lỗi khi xóa category!');
        }
    };

    // --- Các hàm hỗ trợ UI giữ nguyên ---
    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            imageUrl: category.imageUrl || ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', imageUrl: '' });
        setErrors({});
    };

    const totalPages = Math.ceil(totalElements / pageSize);

    if (loading && categories.length === 0) return <div className="p-6">Đang tải dữ liệu...</div>;

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            {/* Search & Add Button */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm category..."
                        className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
                    />
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                >
                    <Plus size={18} /> Thêm category
                </button>
            </div>

            {/* Filter & Sort */}
            <div className="flex gap-4 mb-4">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border rounded-lg outline-none">
                    <option value="id">ID</option>
                    <option value="name">Tên category</option>
                </select>
                <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} className="px-3 py-2 border rounded-lg outline-none">
                    <option value="asc">Tăng dần</option>
                    <option value="desc">Giảm dần</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-4 font-semibold text-gray-600">ID</th>
                            <th className="p-4 font-semibold text-gray-600 text-center">Ảnh</th>
                            <th className="p-4 font-semibold text-gray-600">Tên category</th>
                            <th className="p-4 font-semibold text-gray-600">Mô tả</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-8 text-gray-500">Không có dữ liệu</td></tr>
                        ) : (
                            filteredCategories.map((category) => (
                                <tr key={category.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 text-gray-500">#{category.id}</td>
                                    <td className="p-4 text-center">
                                        <img src={category.imageUrl || 'https://via.placeholder.com/50'} className="w-12 h-12 object-cover rounded-md mx-auto" alt="" />
                                    </td>
                                    <td className="p-4 font-medium">{category.name}</td>
                                    <td className="p-4 text-sm text-gray-600">{category.description || '-'}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(category.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>



            {/* Pagination Footer */}
            <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">Hiển thị {filteredCategories.length} / {totalElements} categories</div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-2 border rounded-lg disabled:opacity-50"><ChevronLeft size={18} /></button>
                    <span className="text-sm">Trang {currentPage + 1} / {totalPages || 1}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} className="p-2 border rounded-lg disabled:opacity-50"><ChevronRight size={18} /></button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Hiển thị:</span>
                    <select
                        value={pageSize}
                        onChange={handlePageSizeChange} // Gọi hàm vừa tạo ở đây
                        className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>

            {/* Modal - Giữ nguyên logic UI của bạn */}
            {showModal && (
                /* ... Phần code modal của bạn đã đúng logic, chỉ cần thay handleSubmit ... */
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Sửa' : 'Thêm'} Category</h2>
                        <input
                            className="w-full border p-2 mb-2 rounded"
                            placeholder="Tên"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        {errors.name && <p className="text-red-500 text-xs mb-2">{errors.name}</p>}
                        <textarea
                            className="w-full border p-2 mb-2 rounded"
                            placeholder="Mô tả"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                        <input
                            className="w-full border p-2 mb-4 rounded"
                            placeholder="Link ảnh"
                            value={formData.imageUrl}
                            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <button onClick={handleCloseModal} className="flex-1 border p-2 rounded">Hủy</button>
                            <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white p-2 rounded">Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategory;
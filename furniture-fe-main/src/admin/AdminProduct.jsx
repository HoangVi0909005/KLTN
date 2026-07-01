import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { 
    Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight, 
    FileUp, Download, CheckSquare, Square 
} from 'lucide-react';

const AdminProduct = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    // Data states
    const [products, setProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Sorting states
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');

    useEffect(() => {
        fetchProducts();
    }, [currentPage, pageSize, sortBy, sortDir]);

    // Lấy danh sách sản phẩm
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/products/paginated', {
                params: {
                    page: currentPage,
                    size: pageSize,
                    sortBy: sortBy,
                    sortDir: sortDir
                }
            });

            if (res.data && res.data.data) {
                const pageData = res.data.data;
                setProducts(pageData.content);
                setTotalPages(pageData.totalPages);
                setTotalElements(pageData.totalElements);
                // Reset selection khi chuyển trang
                setSelectedIds([]);
            }
        } catch (err) {
            console.error("Lỗi lấy sản phẩm:", err);
        } finally {
            setLoading(false);
        }
    };

    // ========== XỬ LÝ CHỌN NHIỀU (BULK SELECTION) ==========
    
    const handleSelectAll = () => {
        if (selectedIds.length === products.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.map(p => p.id));
        }
    };

    const handleSelectItem = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn?`)) return;
        try {
            setLoading(true);
            await api.post('/products/bulk-delete', selectedIds);
            alert("Đã xóa hàng loạt thành công!");
            setSelectedIds([]);
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert("Lỗi khi xóa hàng loạt!");
        } finally {
            setLoading(false);
        }
    };

    // ========== XỬ LÝ EXCEL ==========

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/products/template', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'mau_nhap_san_pham.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(err);
            alert("Không thể tải file mẫu");
        }
    };

    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            await api.post('/products/import-excel', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Nhập dữ liệu từ Excel thành công!");
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert("Lỗi định dạng file hoặc dữ liệu trong file Excel không hợp lệ!");
        } finally { 
            e.target.value = null; 
            setLoading(false); 
        }
    };

    // ========== XỬ LÝ TÌM KIẾM & XÓA ĐƠN ==========

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
        try {
            await api.delete(`/products/${id}`);
            alert("Xóa thành công!");
            fetchProducts();
        } catch (err) {
            console.error("Lỗi xóa sản phẩm:", err);
            alert("Lỗi khi xóa sản phẩm!");
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchProducts();
            return;
        }
        try {
            setLoading(true);
            const res = await api.get('/products/paginated/search', {
                params: {
                    keyword: searchTerm,
                    page: 0,
                    size: pageSize
                }
            });
            if (res.data && res.data.data) {
                const pageData = res.data.data;
                setProducts(pageData.content);
                setTotalPages(pageData.totalPages);
                setTotalElements(pageData.totalElements);
                setCurrentPage(0);
            }
        } catch (err) {
            console.error("Lỗi tìm kiếm:", err);
        } finally {
            setLoading(false);
        }
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

    if (loading && products.length === 0) return <div className="p-6">Đang tải dữ liệu...</div>;

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            {/* Toolbar trên cùng */}
            <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition shadow-sm"
                    >
                        <Download size={18} /> Tải file mẫu
                    </button>
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition shadow-sm"
                    >
                        <FileUp size={18} /> Nhập Excel
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImportExcel} 
                        className="hidden" 
                        accept=".xlsx, .xls" 
                    />
                </div>
                
                <div className="relative w-full xl:max-w-md">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên sản phẩm..."
                        className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                <div className="flex gap-2 w-full xl:w-auto justify-end">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-md"
                        >
                            <Trash2 size={18} /> Xóa ({selectedIds.length})
                        </button>
                    )}
                    <button
                        onClick={handleSearch}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        Tìm kiếm
                    </button>
                    <button
                        onClick={() => navigate('/admin/products/add')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-md"
                    >
                        <Plus size={18} /> Thêm mới
                    </button>
                </div>
            </div>

            {/* Filter & Sort Bar */}
            <div className="flex gap-4 mb-4 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">Sắp xếp theo:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    >
                        <option value="createdAt">Ngày tạo</option>
                        <option value="name">Tên sản phẩm</option>
                        <option value="price">Giá</option>
                        <option value="stockQuantity">Số lượng kho</option>
                    </select>
                </div>

                <select
                    value={sortDir}
                    onChange={(e) => setSortDir(e.target.value)}
                    className="px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                    <option value="asc">Tăng dần ↑</option>
                    <option value="desc">Giảm dần ↓</option>
                </select>
            </div>

            {/* Bảng sản phẩm */}
            <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-4 w-12 text-center">
                                <button onClick={handleSelectAll} className="hover:scale-110 transition">
                                    {selectedIds.length === products.length && products.length > 0 
                                        ? <CheckSquare className="text-blue-600" size={20}/> 
                                        : <Square className="text-gray-400" size={20}/>
                                    }
                                </button>
                            </th>
                            <th className="p-4 font-semibold text-gray-700 text-sm">ID</th>
                            <th className="p-4 font-semibold text-gray-700 text-sm text-center">Ảnh</th>
                            <th className="p-4 font-semibold text-gray-700 text-sm">Tên sản phẩm</th>
                            <th className="p-4 font-semibold text-gray-700 text-sm">Giá niêm yết</th>
                            <th className="p-4 font-semibold text-gray-700 text-sm">Kho</th>
                            <th className="p-4 font-semibold text-gray-700 text-sm">Trạng thái</th>
                            <th className="p-4 font-semibold text-gray-700 text-sm text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-12 text-gray-500 italic">
                                    Không tìm thấy sản phẩm nào phù hợp
                                </td>
                            </tr>
                        ) : (
                            products.map((p) => (
                                <tr key={p.id} className={`border-b hover:bg-blue-50/30 transition-colors ${selectedIds.includes(p.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-4 text-center">
                                        <button onClick={() => handleSelectItem(p.id)} className="hover:scale-110 transition">
                                            {selectedIds.includes(p.id) 
                                                ? <CheckSquare className="text-blue-600" size={20}/> 
                                                : <Square className="text-gray-300" size={20}/>
                                            }
                                        </button>
                                    </td>
                                    <td className="p-4 text-gray-500 text-xs">#{p.id}</td>
                                    <td className="p-4 text-center">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden border mx-auto">
                                            <img
                                                src={p.imageUrls?.[0] || 'https://via.placeholder.com/50'}
                                                alt={p.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-800 text-sm">{p.name}</td>
                                    <td className="p-4 text-blue-700 font-bold text-sm">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(p.price)}
                                    </td>
                                    <td className="p-4 text-sm font-medium">{p.stockQuantity}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {p.isAvailable ? 'Sẵn sàng' : 'Hết hàng'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                                                title="Sửa"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                                title="Xóa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Phân trang */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                <div className="text-sm text-gray-500 font-medium">
                    Hiển thị <span className="text-gray-800">{products.length}</span> trên tổng số <span className="text-gray-800">{totalElements}</span> sản phẩm
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Số dòng:</span>
                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="px-2 py-1 border rounded bg-white text-xs outline-none focus:border-blue-500"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="p-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex gap-1">
                            {[...Array(totalPages)].map((_, index) => {
                                // Logic rút gọn hiển thị số trang nếu quá nhiều (optional)
                                if (totalPages > 7 && Math.abs(index - currentPage) > 2 && index !== 0 && index !== totalPages - 1) {
                                    if (index === 1 || index === totalPages - 2) return <span key={index} className="px-1">...</span>;
                                    return null;
                                }
                                return (
                                    <button
                                        key={index}
                                        onClick={() => handlePageChange(index)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all ${
                                            currentPage === index
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages - 1 || totalPages === 0}
                            className="p-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProduct;
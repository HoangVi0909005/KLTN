import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import { ArrowLeft, Plus, X } from 'lucide-react';

const AdminProductEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        stockQuantity: '',
        categoryId: '',
        imageUrls: [''],
        material: '',
        color: '',
        dimensions: '',
        weight: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCategories();
        fetchProduct();
    }, [id]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            if (res.data && res.data.data) {
                setCategories(res.data.data);
            }
        } catch (err) {
            console.error("Lỗi lấy danh mục:", err);
        }
    };

    const fetchProduct = async () => {
        try {
            setFetchLoading(true);
            const res = await api.get(`/products/${id}`);
            
            if (res.data) {
                const product = res.data;
                setFormData({
                    name: product.name || '',
                    description: product.description || '',
                    price: product.price || '',
                    discountPrice: product.discountPrice || '',
                    stockQuantity: product.stockQuantity || '',
                    categoryId: product.categoryId || '',
                    imageUrls: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [''],
                    material: product.material || '',
                    color: product.color || '',
                    dimensions: product.dimensions || '',
                    weight: product.weight || ''
                });
            }
        } catch (err) {
            console.error("Lỗi lấy sản phẩm:", err);
            alert("Không tìm thấy sản phẩm!");
            navigate('/admin/products');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUrlChange = (index, value) => {
        const newImageUrls = [...formData.imageUrls];
        newImageUrls[index] = value;
        setFormData(prev => ({
            ...prev,
            imageUrls: newImageUrls
        }));
    };

    const addImageUrl = () => {
        setFormData(prev => ({
            ...prev,
            imageUrls: [...prev.imageUrls, '']
        }));
    };

    const removeImageUrl = (index) => {
        if (formData.imageUrls.length > 1) {
            const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                imageUrls: newImageUrls
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên sản phẩm là bắt buộc';
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Giá phải lớn hơn 0';
        }

        if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
            newErrors.stockQuantity = 'Số lượng không hợp lệ';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Vui lòng chọn danh mục';
        }

        if (formData.discountPrice && parseFloat(formData.discountPrice) >= parseFloat(formData.price)) {
            newErrors.discountPrice = 'Giá giảm phải nhỏ hơn giá gốc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
                stockQuantity: parseInt(formData.stockQuantity),
                categoryId: parseInt(formData.categoryId),
                imageUrls: formData.imageUrls.filter(url => url.trim() !== '')
            };

            await api.put(`/products/${id}`, productData);
            alert('Cập nhật sản phẩm thành công!');
            navigate('/admin/products');
        } catch (err) {
            console.error('Lỗi khi cập nhật sản phẩm:', err);
            alert('Lỗi khi cập nhật sản phẩm: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return <div className="p-6">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/admin/products')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Chỉnh Sửa Sản Phẩm</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên sản phẩm <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Nhập tên sản phẩm"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Danh mục <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                                errors.categoryId ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
                    </div>
                </div>

                {/* Mô tả */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả sản phẩm
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Nhập mô tả chi tiết về sản phẩm"
                    />
                </div>

                {/* Giá và số lượng */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giá gốc <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                                errors.price ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                            min="0"
                            step="1000"
                        />
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giá giảm
                        </label>
                        <input
                            type="number"
                            name="discountPrice"
                            value={formData.discountPrice}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                                errors.discountPrice ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                            min="0"
                            step="1000"
                        />
                        {errors.discountPrice && <p className="text-red-500 text-sm mt-1">{errors.discountPrice}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số lượng <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="stockQuantity"
                            value={formData.stockQuantity}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                                errors.stockQuantity ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                            min="0"
                        />
                        {errors.stockQuantity && <p className="text-red-500 text-sm mt-1">{errors.stockQuantity}</p>}
                    </div>
                </div>

                {/* Hình ảnh */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Hình ảnh
                    </label>
                    {formData.imageUrls.map((url, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="https://example.com/image.jpg"
                            />
                            {formData.imageUrls.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeImageUrl(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addImageUrl}
                        className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                        <Plus size={18} /> Thêm URL hình ảnh
                    </button>
                </div>

                {/* Thông tin chi tiết */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chất liệu
                        </label>
                        <input
                            type="text"
                            name="material"
                            value={formData.material}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Gỗ sồi, da, vải..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Màu sắc
                        </label>
                        <input
                            type="text"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Nâu, đen, trắng..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kích thước
                        </label>
                        <input
                            type="text"
                            name="dimensions"
                            value={formData.dimensions}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="200cm x 100cm x 80cm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trọng lượng
                        </label>
                        <input
                            type="text"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="50kg"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 justify-end pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductEdit;
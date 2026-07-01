import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../api/api';

const AdvancedFilter = ({ 
  showAdvancedFilter, 
  setShowAdvancedFilter,
  filters,
  setFilters,
  handleSearch 
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null); // Lưu raw response để debug

  // Fetch danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      if (!showAdvancedFilter) return;
      
      setLoading(true);
      setError(null);
      setRawResponse(null);
      
      try {
        console.log('🔍 [1] Bắt đầu fetch /categories');
        const response = await api.get('/categories');
        
        console.log('📦 [2] Raw Response:', response);
        console.log('📦 [3] Response.data:', response.data);
        console.log('📦 [4] Type of response.data:', typeof response.data);
        console.log('📦 [5] Is Array?', Array.isArray(response.data));
        
        // FIX: Nếu response.data là string, parse nó thành JSON
        let parsedData = response.data;
        if (typeof response.data === 'string') {
          console.log('⚠️ [3.5] Response is STRING, parsing JSON...');
          parsedData = JSON.parse(response.data);
          console.log('✅ [3.6] Parsed data:', parsedData);
        }
        
        // Lưu raw response để debug
        setRawResponse(JSON.stringify(parsedData, null, 2));
        
        // Parse data - thử TẤT CẢ các trường hợp có thể
        let categoriesData = [];
        
        // Trường hợp 1: { success: true, data: [...] }
        if (response.data && response.data.success && response.data.data) {
          categoriesData = response.data.data;
          console.log('✅ [6] Detected format: {success, data}');
        }
        // Trường hợp 2: { data: [...] }
        else if (response.data && response.data.data && !response.data.success) {
          categoriesData = response.data.data;
          console.log('✅ [6] Detected format: {data}');
        }
        // Trường hợp 3: [...]
        else if (Array.isArray(response.data)) {
          categoriesData = response.data;
          console.log('✅ [6] Detected format: Array directly');
        }
        // Trường hợp 4: response.data itself has categories properties
        else if (response.data && typeof response.data === 'object') {
          // Thử tìm key chứa array
          const possibleKeys = ['categories', 'items', 'content', 'results'];
          for (const key of possibleKeys) {
            if (Array.isArray(response.data[key])) {
              categoriesData = response.data[key];
              console.log(`✅ [6] Detected format: {${key}: [...]}`);
              break;
            }
          }
        }
        
        console.log('📋 [7] Parsed categories:', categoriesData);
        console.log('📊 [8] Categories count:', categoriesData.length);
        console.log('📊 [9] First category:', categoriesData[0]);
        
        // Validate data structure
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          // Kiểm tra xem mỗi item có id và name không
          const isValid = categoriesData.every(cat => cat.id && cat.name);
          if (isValid) {
            setCategories(categoriesData);
            console.log('✅ [10] Categories set successfully!');
          } else {
            console.error('❌ [10] Invalid category structure:', categoriesData[0]);
            setError('Cấu trúc dữ liệu category không hợp lệ');
          }
        } else {
          console.warn('⚠️ [10] Categories array is empty or invalid');
          setError('Không có danh mục nào trong database');
        }
        
      } catch (error) {
        console.error('❌ Lỗi khi tải danh mục:', error);
        console.error('❌ Error response:', error.response?.data);
        console.error('❌ Error message:', error.message);
        setError(`Lỗi: ${error.message}`);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [showAdvancedFilter]);

  const handleFilterChange = (key, value) => {
    console.log(`🔄 Filter changed: ${key} = ${value}`);
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilter = () => {
    console.log('🎯 Áp dụng filters:', filters);
    handleSearch();
    setShowAdvancedFilter(false);
  };

  const handleResetFilter = () => {
    setFilters({
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortDir: 'desc'
    });
  };

  if (!showAdvancedFilter) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-4 shadow-lg animate-in slide-in-from-top-2 duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          🎯 Bộ lọc nâng cao
        </h3>
        <button 
          onClick={() => setShowAdvancedFilter(false)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-semibold">⚠️ {error}</p>
          <p className="text-red-600 text-xs mt-1">Kiểm tra Console (F12) để xem chi tiết</p>
        </div>
      )}

      {/* Hiển thị raw response để debug */}
      {rawResponse && categories.length === 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-xs font-bold mb-2">🔍 API trả về data nhưng không parse được:</p>
          <pre className="text-[10px] bg-white p-2 rounded overflow-auto max-h-40 text-gray-700">
            {rawResponse}
          </pre>
          <p className="text-yellow-700 text-xs mt-2">
            → Copy JSON này và gửi cho developer để fix
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Danh mục */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📂 Danh mục
            {loading && ' (Đang tải...)'}
            {!loading && categories.length > 0 && ` (${categories.length})`}
          </label>
          <select
            value={filters.categoryId}
            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            disabled={loading}
          >
            <option value="">Tất cả danh mục</option>
            {loading ? (
              <option disabled>⏳ Đang tải...</option>
            ) : categories.length === 0 ? (
              <option disabled>❌ Không có dữ liệu</option>
            ) : (
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            )}
          </select>
          
          {/* Status */}
          <div className="mt-1 text-[10px] font-medium">
            {loading && <span className="text-blue-600">⏳ Đang tải...</span>}
            {!loading && categories.length > 0 && (
              <span className="text-green-600">✅ Đã tải {categories.length} danh mục</span>
            )}
            {!loading && categories.length === 0 && (
              <span className="text-red-600">❌ Không có danh mục (xem console)</span>
            )}
          </div>
        </div>

        {/* Giá tối thiểu */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            💰 Giá tối thiểu
          </label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Giá tối đa */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            💎 Giá tối đa
          </label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="Không giới hạn"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Sắp xếp */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🔄 Sắp xếp theo
          </label>
          <select
            value={`${filters.sortBy}-${filters.sortDir}`}
            onChange={(e) => {
              const [sortBy, sortDir] = e.target.value.split('-');
              setFilters(prev => ({ ...prev, sortBy, sortDir }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="createdAt-desc">Mới nhất</option>
            <option value="createdAt-asc">Cũ nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="name-asc">Tên A-Z</option>
            <option value="name-desc">Tên Z-A</option>
          </select>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleApplyFilter}
          className="flex-1 bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 active:scale-95 transition-all font-semibold shadow-md"
        >
          ✅ Áp dụng bộ lọc
        </button>
        <button
          onClick={handleResetFilter}
          className="flex-1 bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600 active:scale-95 transition-all font-semibold shadow-md"
        >
          🔄 Đặt lại
        </button>
      </div>

      {/* Hiển thị bộ lọc đang áp dụng */}
      {(filters.categoryId || filters.minPrice || filters.maxPrice) && (
        <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">Đang lọc:</p>
          <div className="flex flex-wrap gap-2">
            {filters.categoryId && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                Danh mục: {categories.find(c => c.id === parseInt(filters.categoryId))?.name || filters.categoryId}
              </span>
            )}
            {filters.minPrice && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                Từ: {new Intl.NumberFormat('vi-VN').format(filters.minPrice)}đ
              </span>
            )}
            {filters.maxPrice && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                Đến: {new Intl.NumberFormat('vi-VN').format(filters.maxPrice)}đ
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;
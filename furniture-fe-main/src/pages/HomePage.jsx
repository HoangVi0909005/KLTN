import React, { useState, useEffect, useCallback } from 'react';
import {
  Star, Filter, TrendingUp, Package, ShoppingCart,
  Loader2, ChevronRight, Search, Tag, RefreshCcw,
  ChevronLeft
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdvancedFilter from '../components/AdvancedFilter';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/api';
import ChatbotWidget from '../components/ChatbotWidget';

const HomePage = () => {
  // --- State Management ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [statistics, setStatistics] = useState(null);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const { addToCart } = useCart();

  // State cho phân trang
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });

  // State cho AdvancedFilter
  const [filters, setFilters] = useState({
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortDir: 'desc'
  });

  // --- HÀM TẢI DỮ LIỆU TỔNG HỢP (Sửa lỗi phân trang không hiện) ---
  const loadData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      let url = '';
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', pagination.itemsPerPage);

      // Xác định URL dựa trên trạng thái hiện tại
      if (activeTab !== 'all') {
        if (activeTab === 'best-selling') url = '/products/best-selling';
        else if (activeTab === 'high-rated') url = '/products/high-rated';
        else if (activeTab === 'discounted') url = '/products/discounted';
        else if (activeTab === 'low-stock') url = '/products/low-stock';
      } else if (searchTerm.trim() || filters.categoryId || filters.minPrice) {
        url = '/products/search';
        if (searchTerm.trim()) params.append('keyword', searchTerm);
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        params.append('sortBy', filters.sortBy);
        params.append('sortDir', filters.sortDir);
      } else if (selectedCategory) {
        url = `/products/category/${selectedCategory}`;
      } else {
        url = '/products';
      }

      const res = await api.get(`${url}?${params.toString()}`);

      if (res.data && res.data.data) {
        const rawData = res.data.data;

        // Trường hợp 1: Backend trả về Page Object (Chuẩn)
        if (res.data.pagination) {
          setProducts(rawData);
          setPagination(prev => ({
            ...prev,
            currentPage: res.data.pagination.currentPage,
            totalPages: res.data.pagination.totalPages,
            totalItems: res.data.pagination.totalItems
          }));
        }
        // Trường hợp 2: Backend trả về mảng phẳng (Ví dụ mảng 30 phần tử)
        else {
          const totalItems = rawData.length;
          const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);

          // Cắt mảng để phân trang trên Frontend
          const start = (page - 1) * pagination.itemsPerPage;
          const paginatedData = rawData.slice(start, start + pagination.itemsPerPage);

          setProducts(paginatedData);
          setPagination(prev => ({
            ...prev,
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems
          }));
        }
      }
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, filters, selectedCategory, pagination.itemsPerPage]);

  // Tải danh mục và thống kê khi vào trang
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, statRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products/statistics').catch(() => null) // Bỏ qua nếu lỗi 400
        ]);
        setCategories(catRes.data.data || []);
        if (statRes) setStatistics(statRes.data.data);
      } catch (e) {
        console.error("Lỗi metadata:", e);
      }
    };
    fetchMetadata();
  }, []);

  // Gọi loadData mỗi khi trang/tab/category thay đổi
  useEffect(() => {
    loadData(1);
  }, [selectedCategory, activeTab, loadData]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    window.scrollTo({ top: 400, behavior: 'smooth' });
    loadData(newPage);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // --- UI Components ---
  const PaginationUI = () => {
    if (pagination.totalPages <= 1) return null;
    return (
      <div className="flex flex-col items-center gap-4 mt-12 pb-8">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="p-2 rounded-xl border border-gray-200 hover:bg-blue-50 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          {[...Array(pagination.totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => handlePageChange(idx + 1)}
              className={`w-10 h-10 rounded-xl font-bold transition-all ${pagination.currentPage === idx + 1
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'
                }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="p-2 rounded-xl border border-gray-200 hover:bg-blue-50 disabled:opacity-30 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col text-gray-800">
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={() => loadData(1)}
        showAdvancedFilter={showAdvancedFilter}
        setShowAdvancedFilter={setShowAdvancedFilter}
      />

      <main className="flex-grow">
        {/* Hero Banner */}
        <div className="relative bg-gray-900 h-[450px] overflow-hidden">
          <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1500&q=80" className="w-full h-full object-cover opacity-50" alt="Hero" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-4">Nâng Tầm Không Gian Sống</h2>
            <p className="text-xl text-gray-200 max-w-2xl">Nội thất cao cấp - Thiết kế tinh tế - Giao hàng tận nơi</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-6">
          <AdvancedFilter
            showAdvancedFilter={showAdvancedFilter}
            filters={filters}
            setFilters={setFilters}
            handleSearch={() => loadData(1)}
          />
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-blue-500">
                <p className="text-xs font-bold text-gray-400 uppercase">Sản phẩm</p>
                <p className="text-2xl font-black">{statistics.totalProducts}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-green-500">
                <p className="text-xs font-bold text-gray-400 uppercase">Trong kho</p>
                <p className="text-2xl font-black">{statistics.totalStock}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-orange-500">
                <p className="text-xs font-bold text-gray-400 uppercase">Giá TB</p>
                <p className="text-lg font-black">{formatPrice(statistics.averagePrice)}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-purple-500">
                <p className="text-xs font-bold text-gray-400 uppercase">Thấp nhất</p>
                <p className="text-lg font-black">{formatPrice(statistics.minPrice)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4">Danh mục</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${!selectedCategory ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}
                >
                  Tất cả sản phẩm
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {['all', 'best-selling', 'high-rated', 'discounted', 'low-stock'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all border ${activeTab === t ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-500'}`}
                >
                  {t === 'all' ? 'Tất cả' : t.replace('-', ' ').toUpperCase()}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="mt-4 font-bold text-gray-400">Đang tìm kiếm sản phẩm...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed">
                <p className="text-gray-400 font-bold">Không tìm thấy sản phẩm nào khớp với yêu cầu.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(p => (
                    /* QUAN TRỌNG: Thêm 'relative' vào className dưới đây */
                    <div key={p.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative">

                      {/* Nhãn số lượng kho - Giờ sẽ nằm đúng góc ảnh */}
                      <div className="absolute top-3 left-3 z-20">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md ${p.stockQuantity > 10
                            ? 'bg-white/90 text-gray-700'
                            : p.stockQuantity > 0
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-red-600 text-white'
                          }`}>
                          <Package size={12} />
                          {p.stockQuantity > 0 ? `Còn ${p.stockQuantity}` : 'Hết hàng'}
                        </span>
                      </div>

                      <Link to={`/products/${p.id}`} className="aspect-square block overflow-hidden">
                        <img
                          src={p.imageUrls?.[0] || 'https://placehold.co/400x400?text=Furniture'}
                          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${p.stockQuantity === 0 ? 'grayscale opacity-60' : ''
                            }`}
                          alt={p.name}
                        />
                      </Link>

                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 line-clamp-1 flex-1">{p.name}</h4>
                          <div className="flex items-center text-yellow-500 text-xs ml-2">
                            <Star size={12} fill="currentColor" /> {p.averageRating?.toFixed(1) || '5.0'}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <span className="text-blue-600 font-black text-lg">{formatPrice(p.price)}</span>

                          {/* Nút giỏ hàng: Khóa khi hết hàng (stockQuantity === 0) */}
                          <button
                            onClick={() => addToCart(p)}
                            disabled={p.stockQuantity === 0}
                            className={`p-3 rounded-2xl transition-all shadow-sm ${p.stockQuantity === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 hover:bg-blue-600 hover:text-white'
                              }`}
                            title={p.stockQuantity === 0 ? "Sản phẩm đã hết hàng" : "Thêm vào giỏ"}
                          >
                            <ShoppingCart size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <PaginationUI />
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default HomePage;
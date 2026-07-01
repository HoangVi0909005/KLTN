import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, ShieldCheck, Truck, MessageSquare, Send, CreditCard } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../api/api';
import HeaderPage from '../components/HeaderPage';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { success, error } = useToast();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // State cho phần đánh giá
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [productReviews, setProductReviews] = useState([]); // Lưu danh sách đánh giá riêng

  // Hàm lấy danh sách đánh giá
  const fetchReviews = async (productId) => {
    try {
      const res = await api.get(`/reviews/product/${productId}`);
      if (res.data.success) {
        setProductReviews(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi fetch reviews:", err);
    }
  };

  useEffect(() => {
    const fetchFullData = async () => {
      try {
        setLoading(true);
        // 1. Lấy chi tiết sản phẩm
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);

        // 2. Lấy sản phẩm liên quan
        const relatedRes = await api.get(`/products/${id}/related`);
        setRelatedProducts(relatedRes.data.data);
        
        // 3. Lấy danh sách đánh giá ban đầu
        fetchReviews(id);
      } catch (error) {
        console.error("Lỗi fetch dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFullData();
      window.scrollTo(0, 0);
    }
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      error("Vui lòng đăng nhập để đánh giá!");
      return;
    }
    const user = JSON.parse(userStr);

    try {
      setSubmittingReview(true);
      const res = await api.post(`/reviews/user/${user.id}`, {
        productId: id,
        rating: rating,
        comment: comment
      });

      if (res.data.success) {
        success("✅ Cảm ơn bạn đã đánh giá sản phẩm!");
        setComment('');
        setRating(5);
        fetchReviews(id); // Gọi lại hàm lấy review để cập nhật danh sách ngay lập tức
      }
    } catch (err) {
      error("❌ " + (err.response?.data?.message || "Không thể gửi đánh giá"));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/checkout');
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Đang tải...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Không tìm thấy sản phẩm!</div>;

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderPage />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-blue-600 mb-6 hover:underline font-medium">
          <ArrowLeft size={18} className="mr-2" /> Quay lại cửa hàng
        </Link>

        {/* THÔNG TIN CHÍNH */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Gallery Ảnh */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border">
                <img
                  src={product.imageUrls?.[activeImage] || 'https://via.placeholder.com/600'}
                  alt={product.name}
                  className="w-full h-full object-center object-cover transition duration-500 hover:scale-105"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.imageUrls?.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${activeImage === index ? 'border-blue-600' : 'border-transparent'}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Thông tin sản phẩm */}
            <div className="flex flex-col">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full text-yellow-700 font-bold">
                  <Star size={18} className="fill-yellow-500 mr-1" />
                  {product.averageRating?.toFixed(1) || 0}
                </div>
                <span className="text-gray-500 font-medium border-l pl-4">{productReviews.length} đánh giá</span>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold text-red-600">
                  {formatPrice(product.discountPrice || product.price)}
                </span>
                {product.discountPrice && (
                  <span className="ml-4 text-xl text-gray-400 line-through font-medium">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-8 leading-relaxed text-lg line-clamp-4">
                {product.description}
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8 p-4 bg-blue-50 rounded-2xl">
                <div className="flex items-center gap-3 text-blue-800 font-medium">
                  <ShieldCheck className="text-blue-600" size={24} /> Bảo hành 2 năm
                </div>
                <div className="flex items-center gap-3 text-blue-800 font-medium">
                  <Truck className="text-blue-600" size={24} /> Miễn phí vận chuyển
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => {
                    addToCart(product);
                    success(`✅ Đã thêm "${product.name}" vào giỏ hàng!`);
                  }}
                  className="flex-1 bg-blue-50 text-blue-600 py-5 rounded-2xl font-bold text-lg hover:bg-blue-100 transition-all flex items-center justify-center gap-3 border-2 border-blue-200"
                >
                  <ShoppingCart size={24} /> Thêm vào giỏ hàng
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-5 rounded-2xl font-bold text-xl hover:from-orange-600 hover:to-red-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-100 active:scale-95"
                >
                  <CreditCard size={24} /> Mua ngay
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-y-2 border-t pt-6 text-gray-600">
                <p>Chất liệu: <span className="font-semibold text-gray-900">{product.material || 'Gỗ sồi'}</span></p>
                <p>Màu sắc: <span className="font-semibold text-gray-900">{product.color || 'Tự nhiên'}</span></p>
                <p>Kích thước: <span className="font-semibold text-gray-900">{product.dimensions || 'N/A'}</span></p>
                <p>Tình trạng: <span className="font-semibold text-green-600">{product.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* ĐÁNH GIÁ CỦA KHÁCH HÀNG */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Form đánh giá */}
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border h-fit sticky top-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="text-blue-600" /> Viết đánh giá
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn số sao</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s} type="button"
                      onClick={() => setRating(s)}
                      className={`p-2 rounded-lg transition ${rating >= s ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      <Star size={28} fill={rating >= s ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bình luận của bạn</label>
                <textarea
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Chia sẻ trải nghiệm về sản phẩm..."
                  required
                ></textarea>
              </div>
              <button
                disabled={submittingReview}
                type="submit"
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2"
              >
                <Send size={18} /> {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          </div>

          {/* Danh sách review - SỬA LẠI Ở ĐÂY */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border">
            <h3 className="text-2xl font-bold mb-8 italic text-gray-800 underline decoration-blue-500 underline-offset-8">Nhận xét từ khách hàng</h3>
            <div className="space-y-8">
              {productReviews && productReviews.length > 0 ? (
                productReviews.map((rev) => (
                  <div key={rev.id} className="border-b pb-6 last:border-0">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{rev.userName || 'Khách hàng'}</h4>
                        <div className="flex text-yellow-500 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                      </span>
                    </div>
                    <p className="text-gray-600 italic">"{rev.comment}"</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-10">Chưa có đánh giá nào cho sản phẩm này.</p>
              )}
            </div>
          </div>
        </div>

        {/* SẢN PHẨM LIÊN QUAN */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h3 className="text-3xl font-bold mb-8">Có thể bạn quan tâm</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <Link to={`/products/${item.id}`} key={item.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img src={item.imageUrls?.[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 truncate mb-1">{item.name}</h4>
                    <p className="text-red-600 font-bold">{formatPrice(item.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
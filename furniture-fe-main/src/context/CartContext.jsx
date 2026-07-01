/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Khởi tạo giỏ hàng từ LocalStorage nếu có
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Lưu giỏ hàng vào LocalStorage mỗi khi cartItems thay đổi
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // 1. Thêm sản phẩm vào giỏ (Xử lý trùng lặp)
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const isExisting = prevItems.find((item) => item.id === product.id);

      if (isExisting) {
        // Nếu sản phẩm đã có, tăng số lượng thêm 1
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      // Nếu sản phẩm mới, thêm vào danh sách với quantity = 1
      return [...prevItems, { ...product, quantity: 1 }];
    });

    // Bạn có thể thay alert bằng một thư viện Toast như react-hot-toast để đẹp hơn
    // alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  // 2. Xóa sản phẩm khỏi giỏ
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // 3. Cập nhật số lượng sản phẩm (Tăng/Giảm)
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return; // Không cho phép nhỏ hơn 1

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // 4. Xóa sạch giỏ hàng (Dùng sau khi thanh toán thành công)
  const clearCart = () => {
    setCartItems([]);
  };

  // 5. Tính tổng số lượng sản phẩm trong giỏ (tổng các quantity)
  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
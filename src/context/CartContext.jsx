import React, { createContext, useContext, useReducer } from 'react';
import { addToCart as addToCartAPI } from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      const quantityToAdd = action.payload.quantity || 1;

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + quantityToAdd }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: quantityToAdd }]
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const { token } = useAuth();

  const addItem = async (product) => {
    // Kiểm tra nếu có variant, lấy productVariantId từ variant.id
    // Nếu không có variant, có thể lấy từ product.variantId hoặc product.id
    const productVariantId = product.variant?.id || product.variantId || product.id;
    const quantity = product.quantity || 1;

    // Nếu không có token, chỉ thêm vào state local (cho trường hợp chưa đăng nhập)
    if (!token) {
      dispatch({ type: 'ADD_ITEM', payload: product });
      return;
    }

    try {
      // Gọi API để thêm vào giỏ hàng trên server
      await addToCartAPI(
        [{ productVariantId, quantity }],
        token
      );
      
      // Nếu API thành công, cập nhật state local
      dispatch({ type: 'ADD_ITEM', payload: product });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      // Nếu API thất bại, vẫn thêm vào state local để UX tốt hơn
      // Hoặc có thể throw error để component xử lý
      throw error;
    }
  };

  const removeItem = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value = {
    items: state.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
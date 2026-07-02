import { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [cartRestaurant, setCartRestaurant] = useState(() => {
    const saved = localStorage.getItem('cartRestaurant');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (cart.length === 0) {
      localStorage.removeItem('cartRestaurant');
      setCartRestaurant(null);
    } else {
      localStorage.setItem('cartRestaurant', JSON.stringify(cartRestaurant));
    }
  }, [cart, cartRestaurant]);

  const addToCart = (menu, restaurant, quantity = 1, notes = '') => {
    if (cartRestaurant && cartRestaurant.id !== restaurant.id) {
      toast.error(`Anda masih memiliki pesanan di ${cartRestaurant.name}. Selesaikan atau kosongkan keranjang terlebih dahulu.`);
      return false;
    }

    if (!cartRestaurant) {
      setCartRestaurant(restaurant);
    }

    setCart(prev => {
      const existing = prev.find(item => item.menuId === menu.id);
      if (existing) {
        return prev.map(item =>
          item.menuId === menu.id
            ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
            : item
        );
      }
      return [...prev, {
        menuId: menu.id,
        name: menu.name,
        price: parseFloat(menu.price),
        image: menu.image,
        quantity,
        notes
      }];
    });

    toast.success(`${menu.name} ditambahkan ke keranjang!`);
    return true;
  };

  const updateQuantity = (menuId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.menuId === menuId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (menuId) => {
    setCart(prev => prev.filter(item => item.menuId !== menuId));
  };

  const clearCart = () => {
    setCart([]);
    setCartRestaurant(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('cartRestaurant');
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartRestaurant,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

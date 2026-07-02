import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      fetchNotifications();
      const socket = io(import.meta.env.VITE_BACKEND_URL || '');
      socket.emit('join_user', user.id);

      socket.on('notification', (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast(notif.message, { icon: '🔔' });
      });

      socket.on('reservation_update', (data) => {
        toast.success(data.message);
        fetchNotifications();
      });

      socket.on('order_status_update', (data) => {
        toast.success(data.message);
        fetchNotifications();
      });

      return () => socket.disconnect();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-xl">
              C+
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">Cari<span className="text-orange-500">Makan+</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">Beranda</Link>
            <Link to="/restaurants" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">Restoran</Link>
          </div>

          <div className="flex items-center gap-4">
            {user?.role === 'CUSTOMER' && (
              <Link to="/cart" className="relative p-2 text-slate-600 hover:text-orange-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            )}

            {user?.role === 'CUSTOMER' && (
              <div className="relative" ref={notifRef}>
                <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 text-slate-600 hover:text-orange-500 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                </button>

                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2">
                    <div className="px-4 py-2 flex justify-between items-center border-b border-slate-100">
                      <h3 className="font-semibold text-sm">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <button onClick={async () => { await api.patch('/notifications/read-all'); fetchNotifications(); }} className="text-xs text-orange-500 hover:text-orange-600">Tandai semua dibaca</button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">Belum ada notifikasi</div>
                      ) : (
                        notifications.map((notif) => {
                          // Extract order number if exists in message (e.g., #CM-230514-12345)
                          const orderMatch = notif.message.match(/#(CM-\d{6}-\d{5})/);
                          const orderNumber = orderMatch ? orderMatch[1] : null;

                          return (
                            <div 
                              key={notif.id} 
                              onClick={() => { 
                                if (!notif.isRead) markAsRead(notif.id); 
                                if (orderNumber) {
                                  setShowNotif(false);
                                  navigate(`/order/${orderNumber}/track`);
                                }
                              }}
                              className={`p-3 border-b border-slate-50 text-sm cursor-pointer hover:bg-slate-50 transition-colors ${!notif.isRead ? 'bg-orange-50/50' : ''}`}
                            >
                              <div className="font-semibold text-slate-800">{notif.title}</div>
                              <div className="text-slate-600 text-xs mt-0.5 line-clamp-2">{notif.message}</div>
                              <div className="text-slate-400 text-xs mt-1">{new Date(notif.createdAt).toLocaleDateString()}</div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 focus:outline-none">
                  <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                    {user.profileImage ? (
                      <img src={`${import.meta.env.VITE_BACKEND_URL || ''}${user.profileImage}`} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-500 font-medium text-sm">{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-slate-700">{user.name}</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1">
                    {user.role === 'CUSTOMER' && (
                      <>
                        <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-orange-500" onClick={() => setShowDropdown(false)}>Profil Saya</Link>
                        <Link to="/my-orders" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-orange-500" onClick={() => setShowDropdown(false)}>Riwayat Pesanan</Link>
                        <div className="divider my-1"></div>
                      </>
                    )}
                    {user.role === 'ADMIN' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-orange-500" onClick={() => setShowDropdown(false)}>Dashboard Admin</Link>
                    )}
                    {user.role === 'RESTAURANT' && (
                      <Link to="/restaurant-dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-orange-500" onClick={() => setShowDropdown(false)}>Dashboard Restoran</Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Keluar</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn-ghost hidden sm:block">Masuk</Link>
                <Link to="/register" className="btn-primary">Daftar</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

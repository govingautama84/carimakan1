import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const RestaurantSidebar = ({ mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    // We assume user.restaurantId is populated from profile if they have one
    if (user?.restaurant?.id) {
      setRestaurantId(user.restaurant.id);
      const socket = io(import.meta.env.VITE_BACKEND_URL || '');
      socket.emit('join_restaurant', user.restaurant.id);

      socket.on('new_reservation', (data) => toast.success(`🔔 ${data.message}`));
      socket.on('new_order', (data) => toast.success(`🍽️ ${data.message}`));

      return () => socket.disconnect();
    }
  }, [user]);

  const navItems = [
    { name: 'Dashboard', path: '/restaurant-dashboard/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Reservasi', path: '/restaurant-dashboard/reservations', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Kelola Menu', path: '/restaurant-dashboard/menus', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { name: 'Pesanan Masuk', path: '/restaurant-dashboard/orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { name: 'Laporan', path: '/restaurant-dashboard/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'Profil Restoran', path: '/restaurant-dashboard/profile', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-white w-64 border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <span className="font-bold text-xl text-slate-800 tracking-tight">Cari<span className="text-orange-500">Makan+</span> <span className="text-sm font-normal text-slate-500">Resto</span></span>
        </div>

        <div className="py-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                    active ? 'text-orange-600 bg-orange-50 border-r-4 border-orange-500' : 'text-slate-600 hover:bg-slate-50 hover:text-orange-500'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                    {item.name === 'Profil Restoran' && <circle cx="12" cy="12" r="3" />}
                  </svg>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default RestaurantSidebar;

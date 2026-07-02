import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="stat-icon bg-orange-100 text-orange-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Pengguna</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.totalCustomers || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Restoran</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.totalRestaurants || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-emerald-100 text-emerald-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Transaksi</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.totalTransactions || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-amber-100 text-amber-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Restoran Menunggu Verifikasi</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.pendingRestaurants || 0}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Restoran Baru / Menunggu</h3>
          <div className="space-y-4">
             {stats?.pendingRestaurantsList?.map(resto => (
               <div key={resto.id} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                     {resto.name.charAt(0)}
                   </div>
                   <div>
                     <p className="font-semibold text-slate-800 text-sm">{resto.name}</p>
                     <p className="text-xs text-slate-500">{resto.user?.email}</p>
                   </div>
                 </div>
                 <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700`}>
                   Menunggu
                 </span>
               </div>
             ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Transaksi Terbaru</h3>
          <div className="space-y-4">
             {stats?.recentOrders?.map(order => (
               <div key={order.id} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                 <div>
                   <p className="font-semibold text-slate-800 text-sm">{order.orderNumber}</p>
                   <p className="text-xs text-slate-500">{order.restaurant.name}</p>
                 </div>
                 <div className="text-right">
                   <p className="font-semibold text-orange-500 text-sm">Rp {Number(order.totalAmount).toLocaleString('id-ID')}</p>
                   <span className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString('id-ID')}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

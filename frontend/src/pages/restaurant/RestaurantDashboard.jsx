import { useState, useEffect } from 'react';
import api from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RestaurantDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/restaurants/my/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Format chart data
  const chartData = stats?.monthlyRevenue?.map(item => ({
    name: new Date(item.createdAt).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
    total: item._sum.amount || 0
  })) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Restoran</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="stat-icon bg-orange-100 text-orange-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Pendapatan</p>
            <h3 className="text-2xl font-bold text-slate-800">Rp {stats?.totalRevenue?.toLocaleString('id-ID') || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Pesanan</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.totalOrders || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-emerald-100 text-emerald-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Reservasi</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.totalReservations || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple-100 text-purple-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Review</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.totalReviews || 0}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Tren Pendapatan</h3>
          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} tickFormatter={(val) => `Rp ${val / 1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                  <Area type="monotone" dataKey="total" stroke="#FF6B35" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Belum ada data pendapatan</div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Pesanan Masuk (Terbaru)</h3>
          </div>
          <div className="space-y-4">
            {stats?.recentOrders?.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">Belum ada pesanan terbaru.</p>
            ) : (
              stats?.recentOrders?.map(order => (
                <div key={order.id} className="flex items-start justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{order.customer.name}</p>
                    <p className="text-xs text-slate-500">{order.orderNumber} • {order.items.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-500 text-sm">Rp {Number(order.totalAmount).toLocaleString('id-ID')}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;

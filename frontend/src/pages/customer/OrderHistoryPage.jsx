import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // orders | reservations

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, resRes] = await Promise.all([
        api.get('/orders/my'),
        api.get('/reservations/my')
      ]);

      if (orderRes.data.success) setOrders(orderRes.data.data);
      if (resRes.data.success) setReservations(resRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'COMPLETED': return <span className="badge-success">Selesai</span>;
      case 'CANCELLED': 
      case 'REJECTED': return <span className="badge-danger">Dibatalkan</span>;
      case 'PENDING': return <span className="badge-warning">Menunggu</span>;
      default: return <span className="badge-primary">Diproses</span>;
    }
  };

  return (
    <div className="page-container max-w-5xl py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Riwayat Aktivitas</h1>

      <div className="flex border-b border-slate-200 mb-6">
        <button 
          className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'orders' ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/50' : 'text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveTab('orders')}
        >
          Riwayat Pesanan
        </button>
        <button 
          className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'reservations' ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/50' : 'text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveTab('reservations')}
        >
          Riwayat Reservasi
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 skeleton h-32"></div>
          ))}
        </div>
      ) : activeTab === 'orders' ? (
        // --- ORDERS LIST ---
        orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p className="text-slate-500 font-medium">Belum ada riwayat pesanan makanan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="card p-6 flex flex-col sm:flex-row justify-between gap-4 sm:items-center hover:border-orange-200 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-slate-800">{order.restaurant.name}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs text-slate-500 font-medium">{order.orderNumber}</span>
                  </div>
                  <div className="text-sm text-slate-500 mb-3">
                    {new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} • {order.items.length} Menu
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(order.status)}
                    <span className="badge-gray">{order.serviceType}</span>
                  </div>
                </div>
                
                <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end gap-3 sm:gap-2 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                  <div className="font-bold text-lg text-slate-800">Rp {Number(order.totalAmount).toLocaleString('id-ID')}</div>
                  <Link to={`/order/${order.orderNumber}/track`} className="btn-secondary text-sm px-4 py-1.5">Lacak & Detail</Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // --- RESERVATIONS LIST ---
        reservations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-slate-500 font-medium">Belum ada riwayat reservasi meja.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reservations.map(res => (
              <div key={res.id} className="card p-6 border-l-4 border-l-orange-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{res.restaurant.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Ref: RES-{res.id}</p>
                  </div>
                  {getStatusBadge(res.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 text-sm bg-slate-50 p-4 rounded-xl mb-4">
                  <div className="text-slate-500">Tanggal</div>
                  <div className="font-semibold text-slate-800">{new Date(res.reservationDate).toLocaleDateString('id-ID')}</div>
                  <div className="text-slate-500">Waktu</div>
                  <div className="font-semibold text-slate-800">{res.reservationTime}</div>
                  <div className="text-slate-500">Tamu</div>
                  <div className="font-semibold text-slate-800">{res.numberOfPeople} Orang</div>
                </div>

                {res.status === 'ACCEPTED' && (
                   <Link to={`/reservation/${res.id}/service`} className="btn-primary w-full block text-center py-2 text-sm shadow-orange">
                     Pesan Makanan Sekarang
                   </Link>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default OrderHistoryPage;

import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RestaurantOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Status flow mapping
  const nextStatusMap = {
    'VERIFIED': { status: 'ACCEPTED', label: 'Terima Pesanan', color: 'btn-info' },
    'ACCEPTED': { status: 'PREPARING', label: 'Mulai Masak', color: 'btn-warning' },
    'PREPARING': { status: 'READY', label: 'Siap (Ambil/Kirim)', color: 'btn-success' },
    'READY': { status: 'DELIVERING', label: 'Sedang Dikirim', color: 'btn-primary' }, // Only if delivery
    'DELIVERING': { status: 'COMPLETED', label: 'Selesai', color: 'btn-success' }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/restaurant/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data pesanan');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await api.patch(`/orders/${id}/status`, { status });
      if (res.data.success) {
        toast.success(`Status pesanan diperbarui menjadi ${status}`);
        fetchOrders();
        if (selectedOrder?.id === id) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      }
    } catch (error) {
      toast.error('Gagal update status pesanan');
    }
  };

  const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status));
  const pastOrders = orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status));

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex-shrink-0">Pesanan Aktif</h1>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Orders List */}
        <div className="w-1/3 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
            <h3 className="font-bold text-slate-800">Menunggu Diproses ({activeOrders.length})</h3>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {loading ? (
              <div className="flex justify-center p-4"><div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div></div>
            ) : activeOrders.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">Tidak ada pesanan aktif saat ini.</p>
            ) : (
              activeOrders.map(order => (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedOrder?.id === order.id ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-slate-100 hover:border-orange-200'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-800 text-sm">{order.orderNumber}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      order.status === 'CREATED' ? 'bg-slate-200 text-slate-600' :
                      order.status === 'VERIFIED' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">{order.customer.name}</span>
                    <span className="font-bold text-slate-800">Rp {Number(order.totalAmount).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2 flex gap-2">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">{order.serviceType}</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">{order.items.length} Menu</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          {selectedOrder ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex-shrink-0 flex justify-between items-start bg-slate-50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">{selectedOrder.orderNumber}</h2>
                  <p className="text-sm text-slate-500">{new Date(selectedOrder.createdAt).toLocaleString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500 mb-1">Status Pembayaran</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedOrder.payment?.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedOrder.payment?.status || 'UNPAID'} ({selectedOrder.payment?.paymentMethod || '-'})
                  </span>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-6">
                <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pelanggan</h4>
                    <p className="font-semibold text-slate-800">{selectedOrder.customer.name}</p>
                    <p className="text-sm text-slate-500">{selectedOrder.customer.phone}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Layanan</h4>
                    <p className="font-semibold text-slate-800">{selectedOrder.serviceType}</p>
                    {selectedOrder.reservationId && <p className="text-sm text-orange-600">Ref: RES-{selectedOrder.reservationId}</p>}
                    {selectedOrder.serviceType === 'DELIVERY' && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{selectedOrder.deliveryAddress}</p>}
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Daftar Menu ({selectedOrder.items.length})</h4>
                <div className="space-y-4 mb-8">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <span className="font-bold text-orange-500">{item.quantity}x</span>
                        <div>
                          <p className="font-semibold text-slate-800">{item.menu.name}</p>
                          {item.notes && <p className="text-xs text-slate-500 mt-1 italic">Catatan: {item.notes}</p>}
                        </div>
                      </div>
                      <p className="font-semibold text-slate-700">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                  
                  {selectedOrder.notes && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mt-4 text-sm">
                      <span className="font-bold text-amber-800">Catatan Pesanan: </span>
                      <span className="text-amber-700">{selectedOrder.notes}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>Rp {(selectedOrder.totalAmount - selectedOrder.tax - selectedOrder.deliveryFee).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Pajak</span>
                    <span>Rp {Number(selectedOrder.tax).toLocaleString('id-ID')}</span>
                  </div>
                  {Number(selectedOrder.deliveryFee) > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Ongkos Kirim</span>
                      <span>Rp {Number(selectedOrder.deliveryFee).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100 font-bold text-lg">
                    <span>Total</span>
                    <span className="text-orange-500">Rp {Number(selectedOrder.totalAmount).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex-shrink-0 flex gap-3">
                {selectedOrder.payment?.status !== 'SUCCESS' ? (
                  <div className="w-full text-center text-sm font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                    Menunggu Pembayaran / Verifikasi
                  </div>
                ) : nextStatusMap[selectedOrder.status] ? (
                  <div className="w-full flex gap-3">
                    <button onClick={() => updateOrderStatus(selectedOrder.id, 'CANCELLED')} className="btn-secondary w-1/3">Batalkan</button>
                    <button 
                      onClick={() => {
                        let nextStatus = nextStatusMap[selectedOrder.status].status;
                        // Skip DELIVERING if not delivery
                        if (nextStatus === 'DELIVERING' && selectedOrder.serviceType !== 'DELIVERY') {
                          nextStatus = 'COMPLETED';
                        }
                        updateOrderStatus(selectedOrder.id, nextStatus);
                      }} 
                      className={`btn-primary w-2/3 !bg-emerald-500 hover:!bg-emerald-600 shadow-emerald-500/20`}
                    >
                      {nextStatusMap[selectedOrder.status].label}
                    </button>
                  </div>
                ) : (
                  <div className="w-full text-center text-sm font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    Pesanan Selesai
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              <p>Pilih pesanan dari daftar di samping untuk melihat detail.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantOrderPage;

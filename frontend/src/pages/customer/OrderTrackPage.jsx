import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../services/api';
import OrderTimeline from '../../components/OrderTimeline';
import { QRCodeSVG } from 'qrcode.react';

const OrderTrackPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    
    // Socket.IO for real-time order tracking
    const socket = io(import.meta.env.VITE_BACKEND_URL || '');
    
    // The server emits 'order_status_update' to the customer's room
    // For this public tracking page, if the user isn't logged in we can't join their user room.
    // However, if they are logged in, Navbar handles the global toast.
    // For this specific order tracking, we can just poll occasionally or listen if we join a specific order room.
    // To simplify and use existing structure, we'll listen globally if we joined user room in Navbar,
    // and just refresh data if an update occurs.
    
    socket.on('order_status_update', (data) => {
      if (data.orderId === order?.id || data.message.includes(orderNumber)) {
        fetchOrder();
      }
    });

    return () => socket.disconnect();
    // eslint-disable-next-line
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/track/${orderNumber}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await api.get(`/invoices/order/${order.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Pesanan Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-6">Pastikan nomor pesanan yang Anda masukkan benar.</p>
        <Link to="/my-orders" className="btn-primary">Kembali ke Riwayat</Link>
      </div>
    );
  }

  const isCompleted = order.status === 'COMPLETED';

  return (
    <div className="page-container max-w-4xl py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Lacak Pesanan</h1>
          <p className="text-slate-500">Nomor Pesanan: <span className="font-semibold text-slate-700">{order.orderNumber}</span></p>
        </div>
        <div className="flex gap-2">
          {order.payment?.status === 'SUCCESS' && (
             <button onClick={handleDownloadInvoice} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               Unduh Invoice
             </button>
          )}
          <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
            order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
            'bg-orange-100 text-orange-700'
          }`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="card p-6 mb-8 shadow-sm border-t-4 border-t-orange-500">
        <OrderTimeline currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-4">Detail Restoran & Layanan</h3>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-slate-500">Restoran</div>
              <div className="font-semibold text-slate-800">{order.restaurant.name}</div>
              
              <div className="text-slate-500">Jenis Layanan</div>
              <div className="font-semibold text-slate-800">{order.serviceType}</div>
              
              {order.serviceType === 'DELIVERY' && (
                <>
                  <div className="text-slate-500">Alamat Pengiriman</div>
                  <div className="font-semibold text-slate-800">{order.deliveryAddress}</div>
                </>
              )}
              
              <div className="text-slate-500">Waktu Pesanan</div>
              <div className="font-semibold text-slate-800">{new Date(order.createdAt).toLocaleString('id-ID')}</div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-4">Daftar Menu</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-800">{item.quantity}x {item.menu.name}</p>
                    {item.notes && <p className="text-xs text-slate-500 mt-1 italic">Catatan: {item.notes}</p>}
                  </div>
                  <p className="font-semibold text-slate-700">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card p-6 sticky top-24 bg-slate-900 text-white border-0 shadow-xl">
            <h3 className="font-bold text-lg mb-4 text-slate-200">Ringkasan Pembayaran</h3>
            
            <div className="space-y-3 mb-6 border-b border-slate-700 pb-6 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-200">Rp {Number(order.totalAmount - order.tax - order.deliveryFee).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pajak (10%)</span>
                <span className="text-slate-200">Rp {Number(order.tax).toLocaleString('id-ID')}</span>
              </div>
              {Number(order.deliveryFee) > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Ongkir</span>
                  <span className="text-slate-200">Rp {Number(order.deliveryFee).toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="font-bold">Total Pembayaran</span>
              <span className="font-bold text-xl text-orange-400">Rp {Number(order.totalAmount).toLocaleString('id-ID')}</span>
            </div>
            
            <div className="bg-slate-800 p-4 rounded-xl flex flex-col items-center">
              <span className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-semibold">Tunjukkan QR ke Kasir</span>
              <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG value={`CariMakan+|ORDER:${order.orderNumber}`} size={120} />
              </div>
              <p className="text-xs text-center text-slate-400 mt-3">Status: <strong className={order.payment?.status === 'SUCCESS' ? 'text-emerald-400' : 'text-amber-400'}>{order.payment?.status || 'UNPAID'}</strong></p>
            </div>
          </div>
          
          {isCompleted && (
            <div className="mt-4">
               <button className="btn-secondary w-full py-3" onClick={() => document.getElementById('review-modal').showModal()}>Beri Ulasan Restoran</button>
            </div>
          )}
        </div>
      </div>
      
      {/* Review Modal Placeholder */}
      <dialog id="review-modal" className="modal">
        <div className="modal-box rounded-2xl">
          <h3 className="font-bold text-lg mb-4">Nilai Pesanan Ini</h3>
          <p className="py-4 text-slate-500 text-sm">Fitur ulasan akan segera hadir.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn-primary">Tutup</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default OrderTrackPage;

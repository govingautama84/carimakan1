import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cart, cartRestaurant, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState('DINE_IN');
  const [reservationId, setReservationId] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [notes, setNotes] = useState('');

  const tax = cartTotal * 0.1;
  const deliveryFee = serviceType === 'DELIVERY' ? 15000 : 0;
  const finalTotal = cartTotal + tax + deliveryFee;

  useEffect(() => {
    if (cart.length === 0) navigate('/cart');

    // Retrieve temporary reservation context if navigating from ServiceTypePage
    const savedServiceType = sessionStorage.getItem('currentServiceType');
    const savedReservationId = sessionStorage.getItem('currentReservationId');
    if (savedServiceType) setServiceType(savedServiceType);
    if (savedReservationId) setReservationId(savedReservationId);
  }, [cart, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (serviceType === 'DELIVERY' && !deliveryAddress) {
      toast.error('Alamat pengiriman harus diisi untuk layanan Delivery.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Order
      const orderPayload = {
        restaurantId: cartRestaurant.id,
        reservationId: reservationId ? parseInt(reservationId) : null,
        serviceType,
        deliveryAddress: serviceType === 'DELIVERY' ? deliveryAddress : null,
        notes,
        items: cart.map(item => ({ menuId: item.menuId, quantity: item.quantity, notes: item.notes }))
      };
      
      const orderRes = await api.post('/orders', orderPayload);
      
      if (orderRes.data.success) {
        const orderId = orderRes.data.data.id;
        
        // 2. Process Payment (Mock)
        const paymentRes = await api.post('/payments', {
          orderId,
          paymentMethod,
          amount: finalTotal
        });

        if (paymentRes.data.success) {
          clearCart();
          sessionStorage.removeItem('currentServiceType');
          sessionStorage.removeItem('currentReservationId');
          
          toast.success('Pesanan berhasil dibuat!');
          navigate(`/order/${orderRes.data.data.orderNumber}/track`);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memproses pesanan.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="page-container max-w-5xl py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Checkout Pesanan</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          {/* Service Type Selection */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Jenis Layanan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['DINE_IN', 'TAKE_AWAY', 'DELIVERY'].map(type => (
                <label key={type} className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${serviceType === type ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 hover:border-orange-200'}`}>
                  <input type="radio" name="service" value={type} className="sr-only" checked={serviceType === type} onChange={() => setServiceType(type)} />
                  <span className="font-semibold block mb-1">{type === 'DINE_IN' ? 'Dine In' : type === 'TAKE_AWAY' ? 'Takeaway' : 'Delivery'}</span>
                </label>
              ))}
            </div>

            {serviceType === 'DINE_IN' && (
              <div className="mt-4">
                <label className="input-label">Nomor Reservasi (ID)</label>
                <input 
                  type="number"
                  className="input-field" 
                  placeholder="Contoh: 1 (Kosongkan jika pesan langsung di kasir)"
                  value={reservationId}
                  onChange={(e) => setReservationId(e.target.value)}
                />
                {!reservationId && (
                  <p className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                    <strong>Perhatian:</strong> Anda memilih Dine In tanpa Nomor Reservasi. Pastikan Anda memesan saat sudah berada di restoran.
                  </p>
                )}
              </div>
            )}

            {serviceType === 'DELIVERY' && (
              <div className="mt-4">
                <label className="input-label">Alamat Pengiriman</label>
                <textarea 
                  className="textarea-field" 
                  rows="3" 
                  placeholder="Masukkan alamat lengkap pengiriman..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                ></textarea>
              </div>
            )}
          </div>

          {/* Review Items */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Pesanan ({cartRestaurant?.name})</h2>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.menuId} className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    {item.image && <img src={item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_BACKEND_URL || ''}${item.image}`} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{item.name}</h4>
                    <p className="text-sm text-slate-500">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                    {item.notes && <p className="text-xs text-slate-400 mt-1 italic">"{item.notes}"</p>}
                  </div>
                  <div className="font-bold text-slate-800">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100">
              <label className="input-label">Catatan Tambahan untuk Restoran (Opsional)</label>
              <input type="text" className="input-field" placeholder="Cth: Jangan pakai bawang..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="lg:w-[360px]">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Pembayaran</h2>
            
            <div className="space-y-3 mb-6">
              <label className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition-all ${paymentMethod === 'QRIS' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" value="QRIS" className="w-4 h-4 text-orange-500" checked={paymentMethod === 'QRIS'} onChange={() => setPaymentMethod('QRIS')} />
                  <span className="font-semibold text-slate-700">QRIS</span>
                </div>
                <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">GPN</div>
              </label>
              <label className={`cursor-pointer rounded-xl border p-3 flex items-center gap-3 transition-all ${paymentMethod === 'CASH' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="payment" value="CASH" className="w-4 h-4 text-orange-500" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} />
                <span className="font-semibold text-slate-700">Tunai / Bayar di Tempat</span>
              </label>
            </div>

            <div className="divider"></div>

            <div className="space-y-2 mb-4 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal Pesanan</span>
                <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Pajak (10%)</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              {serviceType === 'DELIVERY' && (
                <div className="flex justify-between">
                  <span>Ongkos Kirim</span>
                  <span>Rp {deliveryFee.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-100">
              <span className="font-bold text-slate-800">Total Pembayaran</span>
              <span className="font-bold text-xl text-orange-500">Rp {finalTotal.toLocaleString('id-ID')}</span>
            </div>

            <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary w-full shadow-orange py-3.5 text-lg flex justify-center items-center">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : `Bayar Rp ${finalTotal.toLocaleString('id-ID')}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

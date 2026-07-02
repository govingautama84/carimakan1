import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const { cart, cartRestaurant, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="page-container max-w-3xl flex flex-col items-center justify-center py-20">
        <div className="w-32 h-32 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-6">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Keranjang Anda Kosong</h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">Sepertinya Anda belum menambahkan menu makanan ke dalam keranjang. Yuk, cari restoran favoritmu!</p>
        <Link to="/restaurants" className="btn-primary">Mulai Cari Makanan</Link>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Keranjang Pesanan</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="card mb-6">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <img 
                    src={cartRestaurant?.logo?.startsWith('http') ? cartRestaurant.logo : `${import.meta.env.VITE_BACKEND_URL || ''}${cartRestaurant?.logo}`} 
                    alt="Restoran" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Resto&background=f1f5f9'; }}
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Memesan dari</p>
                  <h3 className="font-bold text-slate-800">{cartRestaurant?.name}</h3>
                </div>
              </div>
              <button onClick={clearCart} className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">Kosongkan</button>
            </div>

            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.menuId} className="p-4 sm:p-6 flex gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                    {item.image && (
                      <img 
                        src={item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_BACKEND_URL || ''}${item.image}`} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.menuId)} className="text-slate-400 hover:text-red-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      <p className="text-orange-500 font-semibold text-sm mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                      {item.notes && (
                        <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg italic">Catatan: {item.notes}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <p className="font-bold text-slate-800">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                      
                      <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-lg border border-slate-200">
                        <button 
                          onClick={() => updateQuantity(item.menuId, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-orange-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                        </button>
                        <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.menuId, 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-orange-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-orange-50/50 rounded-b-2xl flex justify-between items-center">
              <Link to={`/restaurant/${cartRestaurant?.id}`} className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Tambah Menu Lain
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:w-80">
          <div className="card p-6 sticky top-24">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Ringkasan Belanja</h3>
            
            <div className="space-y-3 mb-6 border-b border-slate-100 pb-6">
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Total Harga ({cart.reduce((a,c) => a + c.quantity, 0)} barang)</span>
                <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-6">
              <span className="font-bold text-slate-800">Total</span>
              <span className="font-bold text-xl text-orange-500">Rp {cartTotal.toLocaleString('id-ID')}</span>
            </div>

            <button onClick={handleCheckout} className="btn-primary w-full shadow-orange py-3">
              Lanjut ke Pembayaran
            </button>
            <p className="text-xs text-center text-slate-500 mt-4">Pajak & Biaya Pengiriman dihitung pada saat checkout.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

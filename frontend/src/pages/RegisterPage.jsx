import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [isRestaurant, setIsRestaurant] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Customer Form
  const [customerData, setCustomerData] = useState({
    name: '', email: '', password: '', phone: ''
  });

  // Restaurant Form
  const [restaurantData, setRestaurantData] = useState({
    ownerName: '', email: '', password: '', phone: '',
    restaurantName: '', address: '', city: '',
    openingTime: '08:00', closingTime: '22:00'
  });

  const handleCustomerChange = (e) => setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  const handleRestaurantChange = (e) => setRestaurantData({ ...restaurantData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRestaurant) {
        await api.post('/auth/register-restoran', restaurantData);
        toast.success('Pendaftaran restoran berhasil! Silakan login.', { duration: 5000 });
      } else {
        await api.post('/auth/register', customerData);
        toast.success('Pendaftaran berhasil! Silakan login.');
      }
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            C+
          </div>
          <span className="font-bold text-3xl text-white tracking-tight">Cari<span className="text-orange-500">Makan+</span></span>
        </Link>
        <h2 className="text-center text-2xl font-bold tracking-tight text-white mb-2">
          Bergabung bersama kami
        </h2>
        <p className="text-center text-slate-300 max-w-xl mx-auto">
          Mulai jelajahi ribuan rasa, atau daftarkan restoranmu dan jangkau lebih banyak pelanggan.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-100">
          
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${!isRestaurant ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setIsRestaurant(false)}
            >
              Sebagai Customer
            </button>
            <button
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${isRestaurant ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setIsRestaurant(true)}
            >
              Sebagai Partner Restoran
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isRestaurant ? (
              // --- CUSTOMER FORM ---
              <>
                <div className="input-group">
                  <label className="input-label">Nama Lengkap</label>
                  <input type="text" name="name" required className="input-field" value={customerData.name} onChange={handleCustomerChange} />
                </div>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input type="email" name="email" required className="input-field" value={customerData.email} onChange={handleCustomerChange} />
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">Password</label>
                    <input type="password" name="password" required className="input-field" value={customerData.password} onChange={handleCustomerChange} minLength={6} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Nomor Telepon</label>
                    <input type="text" name="phone" required className="input-field" value={customerData.phone} onChange={handleCustomerChange} />
                  </div>
                </div>
              </>
            ) : (
              // --- RESTAURANT FORM ---
              <>
                <div className="bg-orange-50 p-4 rounded-xl mb-6 text-sm text-orange-800 border border-orange-100">
                  <span className="font-bold block mb-1">Informasi Penting</span>
                  Akun Anda akan ditinjau oleh Admin sebelum dapat menerima pesanan.
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">Nama Pemilik</label>
                    <input type="text" name="ownerName" required className="input-field" value={restaurantData.ownerName} onChange={handleRestaurantChange} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Nomor Telepon HP/Resto</label>
                    <input type="text" name="phone" required className="input-field" value={restaurantData.phone} onChange={handleRestaurantChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">Email Pemilik / Restoran</label>
                    <input type="email" name="email" required className="input-field" value={restaurantData.email} onChange={handleRestaurantChange} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Password</label>
                    <input type="password" name="password" required className="input-field" value={restaurantData.password} onChange={handleRestaurantChange} minLength={6} />
                  </div>
                </div>
                
                <div className="divider"></div>
                <h3 className="font-bold text-slate-800 mb-4">Informasi Restoran</h3>

                <div className="input-group">
                  <label className="input-label">Nama Restoran</label>
                  <input type="text" name="restaurantName" required className="input-field" value={restaurantData.restaurantName} onChange={handleRestaurantChange} />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Alamat Lengkap</label>
                  <textarea name="address" required className="textarea-field h-24" value={restaurantData.address} onChange={handleRestaurantChange}></textarea>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">Kota</label>
                    <input type="text" name="city" required className="input-field" value={restaurantData.city} onChange={handleRestaurantChange} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Jam Operasional</label>
                    <div className="flex items-center gap-2">
                      <input type="time" name="openingTime" required className="input-field" value={restaurantData.openingTime} onChange={handleRestaurantChange} />
                      <span className="text-slate-500">-</span>
                      <input type="time" name="closingTime" required className="input-field" value={restaurantData.closingTime} onChange={handleRestaurantChange} />
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-8 flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed scale-[0.98]' : 'hover:-translate-y-0.5'}`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </div>
              ) : (
                isRestaurant ? 'Daftarkan Restoran' : 'Daftar Akun'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        toast.success(`Selamat datang kembali, ${res.data.data.user.name}!`);
        
        // Redirect based on role or originally intended URL
        if (res.data.data.user.role === 'ADMIN') {
          navigate('/admin');
        } else if (res.data.data.user.role === 'RESTAURANT') {
          navigate('/restaurant-dashboard');
        } else {
          navigate(from === '/login' ? '/' : from);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1934&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            C+
          </div>
          <span className="font-bold text-3xl text-white tracking-tight">Cari<span className="text-orange-500">Makan+</span></span>
        </Link>
        <h2 className="text-center text-2xl font-bold tracking-tight text-white">
          Masuk ke Akun Anda
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                className="input-field"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Belum punya akun?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors">
                Daftar sekarang
              </Link>
            </div>
            
            {/* Demo Accounts Section */}
            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <p className="font-semibold text-slate-800 mb-2 text-center flex items-center justify-center gap-1">
                <span className="text-orange-500">💡</span> Akun Demo
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="font-medium text-slate-700">Admin</span>
                  <div className="text-right">
                    <div>admin@carimakan.com</div>
                    <div className="text-slate-400">admin123</div>
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="font-medium text-slate-700">Restoran</span>
                  <div className="text-right">
                    <div>warung.nusantara@carimakan.com</div>
                    <div className="text-slate-400">resto123</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">Pelanggan</span>
                  <div className="text-right">
                    <div>customer@carimakan.com</div>
                    <div className="text-slate-400">customer123</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdRestaurant, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import Swal from 'sweetalert2';

const AdminLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Email dan password wajib diisi.', confirmButtonColor: '#7B1A1A' });
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal. Periksa email dan password.';
      Swal.fire({ icon: 'error', title: 'Login Gagal', text: msg, confirmButtonColor: '#7B1A1A' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #7B1A1A 0%, #5C1212 50%, #2C0A0A 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,107,53,0.1)' }} />
      <div style={{ position: 'absolute', bottom: '-150px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,165,0,0.08)' }} />

      <div style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 24,
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #7B1A1A, #A52A2A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MdRestaurant size={32} color="white" />
          </div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#7B1A1A', fontWeight: 700, marginBottom: 4 }}>
            Demail Restaurant
          </h2>
          <p style={{ color: '#666', fontSize: '0.875rem' }}>Admin Panel — Masuk untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label-custom">Email</label>
            <div className="position-relative">
              <MdEmail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9E9E9E' }} />
              <input
                type="email"
                className="form-control-custom"
                style={{ paddingLeft: 36 }}
                placeholder="admin@demail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label-custom">Password</label>
            <div className="position-relative">
              <MdLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9E9E9E' }} />
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control-custom"
                style={{ paddingLeft: 36, paddingRight: 40 }}
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
              <button type="button" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9E9E9E', padding: 0 }}
                onClick={() => setShowPass(!showPass)}>
                {showPass ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-2"
            style={{ padding: '14px', fontSize: '1rem', borderRadius: 12 }}
            disabled={loading}
          >
            {loading ? <><div className="spinner-border spinner-border-sm" /> Masuk...</> : '🔐 Masuk'}
          </button>
        </form>

        <div className="text-center mt-4" style={{ fontSize: '0.78rem', color: '#9E9E9E' }}>
          Default: <strong>admin@demail.com</strong> / <strong>admin123</strong>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

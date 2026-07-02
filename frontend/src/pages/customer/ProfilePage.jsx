import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [passData, setPassData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        updateProfile(res.data.data);
        toast.success('Profil berhasil diperbarui!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak cocok!');
      return;
    }
    setLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        oldPassword: passData.oldPassword,
        newPassword: passData.newPassword
      });
      if (res.data.success) {
        toast.success('Password berhasil diubah!');
        setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-4xl py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Profil Saya</h1>
          <p className="text-slate-500">{user?.email}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Informasi Pribadi</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="input-group">
              <label className="input-label">Nama Lengkap</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input type="email" className="input-field bg-slate-50 text-slate-500" value={user?.email || ''} disabled />
              <p className="text-xs text-slate-400 mt-1">Email tidak dapat diubah.</p>
            </div>
            <div className="input-group">
              <label className="input-label">Nomor Telepon</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Alamat Default</label>
              <textarea 
                className="textarea-field" 
                rows="3"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Alamat ini akan digunakan sebagai default saat delivery."
              ></textarea>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">Simpan Perubahan</button>
          </form>
        </div>

        <div className="card p-6 h-fit">
          <h3 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Ubah Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="input-group">
              <label className="input-label">Password Saat Ini</label>
              <input 
                type="password" 
                className="input-field" 
                value={passData.oldPassword}
                onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Password Baru</label>
              <input 
                type="password" 
                className="input-field" 
                value={passData.newPassword}
                onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                minLength={6}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Konfirmasi Password Baru</label>
              <input 
                type="password" 
                className="input-field" 
                value={passData.confirmPassword}
                onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                minLength={6}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-secondary w-full">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

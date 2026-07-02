import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RestaurantProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '', description: '', address: '', city: '',
    phone: '', openingTime: '', closingTime: '', category: '', capacity: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/restaurants/my/profile');
      if (res.data.success) {
        setProfile(res.data.data);
        const r = res.data.data;
        setFormData({
          name: r.name || '', description: r.description || '', address: r.address || '',
          city: r.city || '', phone: r.phone || '', openingTime: r.openingTime || '',
          closingTime: r.closingTime || '', category: r.category || '', capacity: r.capacity || ''
        });
      }
    } catch (error) {
      toast.error('Gagal memuat profil restoran');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (imageFile) data.append('logo', imageFile);

    try {
      const res = await api.put('/restaurants/my/profile', data);
      if (res.data.success) {
        toast.success('Profil restoran berhasil diperbarui');
        fetchProfile();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal update profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Profil Restoran</h1>

      <div className="card overflow-hidden mb-8">
        <div className="h-40 bg-slate-900 relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974')] bg-cover bg-center"></div>
        </div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 mb-8">
            <div className="w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden flex-shrink-0 relative group cursor-pointer">
              {profile?.logo ? (
                <img src={profile.logo.startsWith('http') ? profile.logo : `${import.meta.env.VITE_BACKEND_URL || ''}${profile.logo}`} alt="Logo" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
              ) : (
                <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-4xl group-hover:opacity-50 transition-opacity">
                  {profile?.name?.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800">{profile?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${profile?.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {profile?.isVerified ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                </span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${profile?.status ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                  {profile?.status ? 'Aktif (Buka)' : 'Tutup Sementara'}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="input-group">
                <label className="input-label">Nama Restoran</label>
                <input type="text" name="name" required className="input-field" value={formData.name} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Kategori Makanan Utama</label>
                <input type="text" name="category" className="input-field" placeholder="Cth: Indonesian, Japanese, Seafood" value={formData.category} onChange={handleChange} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Deskripsi Restoran</label>
              <textarea name="description" rows="3" className="textarea-field" value={formData.description} onChange={handleChange}></textarea>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="input-group">
                <label className="input-label">Alamat Lengkap</label>
                <input type="text" name="address" required className="input-field" value={formData.address} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Kota</label>
                <input type="text" name="city" required className="input-field" value={formData.city} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Nomor Telepon</label>
                <input type="text" name="phone" required className="input-field" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Kapasitas Orang Maksimal</label>
                <input type="number" name="capacity" className="input-field" value={formData.capacity} onChange={handleChange} />
              </div>
            </div>

            <div className="divider"></div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="input-group">
                <label className="input-label">Jam Buka</label>
                <input type="time" name="openingTime" required className="input-field" value={formData.openingTime} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Jam Tutup</label>
                <input type="time" name="closingTime" required className="input-field" value={formData.closingTime} onChange={handleChange} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Simpan Perubahan Profil'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfilePage;

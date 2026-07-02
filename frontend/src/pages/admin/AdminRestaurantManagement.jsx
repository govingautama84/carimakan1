import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminRestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/restaurants');
      if (res.data.success) {
        setRestaurants(res.data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data restoran');
    } finally {
      setLoading(false);
    }
  };

  const verifyRestaurant = async (id) => {
    try {
      const res = await api.patch(`/admin/restaurants/${id}/verify`);
      if (res.data.success) {
        toast.success('Restoran berhasil diverifikasi');
        fetchRestaurants();
      }
    } catch (error) {
      toast.error('Gagal verifikasi restoran');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Manajemen Restoran</h1>

      <div className="card">
        {loading ? (
          <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Restoran</th>
                  <th>Pemilik (User ID)</th>
                  <th>Lokasi</th>
                  <th>Status Verifikasi</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500">Belum ada restoran yang terdaftar.</td>
                  </tr>
                ) : (
                  restaurants.map(resto => (
                    <tr key={resto.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                            {resto.logo && <img src={resto.logo.startsWith('http') ? resto.logo : `${import.meta.env.VITE_BACKEND_URL || ''}${resto.logo}`} alt={resto.name} className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{resto.name}</p>
                            <p className="text-xs text-slate-500">{resto.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-medium text-slate-800">User ID: {resto.userId}</span>
                      </td>
                      <td>
                        <p className="text-sm text-slate-800">{resto.city}</p>
                      </td>
                      <td>
                        {resto.isVerified ? (
                          <span className="badge badge-success">Terverifikasi</span>
                        ) : (
                          <span className="badge badge-warning">Menunggu</span>
                        )}
                      </td>
                      <td className="text-right">
                        {!resto.isVerified ? (
                          <button onClick={() => verifyRestaurant(resto.id)} className="btn-primary text-xs px-3 py-1.5 shadow-orange">
                            Verifikasi Restoran
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium px-3 py-1.5">Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRestaurantManagement;

import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RestaurantReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reservations/restaurant');
      if (res.data.success) {
        setReservations(res.data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data reservasi');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/reservations/${id}/status`, { status });
      if (res.data.success) {
        toast.success(`Reservasi ${status === 'ACCEPTED' ? 'disetujui' : status === 'REJECTED' ? 'ditolak' : 'selesai'}`);
        fetchReservations();
      }
    } catch (error) {
      toast.error('Gagal mengubah status');
    }
  };

  const filteredReservations = statusFilter === 'ALL' 
    ? reservations 
    : reservations.filter(r => r.status === statusFilter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Manajemen Reservasi</h1>

      <div className="card mb-6">
        <div className="flex overflow-x-auto border-b border-slate-200">
          {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED', 'CANCELLED'].map(status => (
            <button
              key={status}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status 
                  ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'ALL' ? 'Semua Reservasi' : 
               status === 'PENDING' ? 'Menunggu' :
               status === 'ACCEPTED' ? 'Disetujui' :
               status === 'COMPLETED' ? 'Selesai' :
               status === 'REJECTED' ? 'Ditolak' : 'Dibatalkan'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>
        ) : (
          <div className="table-container border-0 rounded-none">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pelanggan</th>
                  <th>Waktu Reservasi</th>
                  <th>Jumlah</th>
                  <th>Catatan</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">Tidak ada reservasi untuk filter ini.</td>
                  </tr>
                ) : (
                  filteredReservations.map(res => (
                    <tr key={res.id}>
                      <td>
                        <div className="font-semibold text-slate-800">{res.customer?.name || 'Pelanggan'}</div>
                        <div className="text-xs text-slate-500">{res.customer?.phone || '-'}</div>
                      </td>
                      <td>
                        <div className="font-medium text-slate-800">{new Date(res.reservationDate).toLocaleDateString('id-ID')}</div>
                        <div className="text-xs text-slate-500">{res.reservationTime}</div>
                      </td>
                      <td><span className="font-semibold bg-slate-100 px-2 py-1 rounded">{res.guestCount} Org</span></td>
                      <td>
                        <p className="text-xs text-slate-500 max-w-[200px] truncate" title={res.notes || '-'}>
                          {res.notes || '-'}
                        </p>
                      </td>
                      <td>
                        <span className={`badge ${
                          res.status === 'PENDING' ? 'badge-warning' :
                          res.status === 'ACCEPTED' ? 'badge-info' :
                          res.status === 'COMPLETED' ? 'badge-success' : 'badge-danger'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="text-right">
                        {res.status === 'PENDING' && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => updateStatus(res.id, 'ACCEPTED')} className="btn-success text-xs px-3 py-1.5">Setujui</button>
                            <button onClick={() => updateStatus(res.id, 'REJECTED')} className="btn-danger text-xs px-3 py-1.5">Tolak</button>
                          </div>
                        )}
                        {res.status === 'ACCEPTED' && (
                          <button onClick={() => updateStatus(res.id, 'COMPLETED')} className="btn-primary text-xs px-3 py-1.5">Tandai Selesai</button>
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

export default RestaurantReservationPage;

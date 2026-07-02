import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReservationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    reservationDate: '',
    reservationTime: '',
    numberOfPeople: 2,
    specialRequests: ''
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await api.get(`/restaurants/${id}`);
        if (res.data.success) {
          setRestaurant(res.data.data);
        }
      } catch (error) {
        toast.error('Gagal mengambil data restoran');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, reservationDate: dateStr, reservationTime: '18:00' }));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        restaurantId: parseInt(id),
        reservationDate: formData.reservationDate,
        reservationTime: formData.reservationTime,
        guestCount: parseInt(formData.numberOfPeople),
        notes: formData.specialRequests
      };

      const res = await api.post('/reservations', payload);
      
      if (res.data.success) {
        toast.success('Reservasi berhasil diajukan! Menunggu konfirmasi restoran.');
        // Lanjut ke pemilihan jenis layanan
        navigate(`/reservation/${res.data.data.id}/service`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal melakukan reservasi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="page-container max-w-3xl py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <svg className="w-64 h-64 -mt-10 -mr-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 relative z-10">Reservasi Meja</h1>
          <p className="text-slate-300 relative z-10">di <span className="font-semibold text-orange-400">{restaurant.name}</span></p>
        </div>

        <div className="p-8">
          <div className="alert-info mb-8">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p className="font-semibold mb-1">Informasi Penting</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>Reservasi wajib dilakukan minimal H-1.</li>
                <li>Restoran beroperasi pukul {restaurant.openingTime} - {restaurant.closingTime}.</li>
                <li>Pemesanan makanan dilakukan setelah reservasi dikonfirmasi (untuk DINE_IN).</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Tanggal Reservasi</label>
                <input 
                  type="date" 
                  name="reservationDate" 
                  required 
                  className="input-field"
                  value={formData.reservationDate}
                  onChange={handleChange}
                  min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]} // H-1 Minimum
                />
              </div>
              <div className="input-group">
                <label className="input-label">Waktu</label>
                <input 
                  type="time" 
                  name="reservationTime" 
                  required 
                  className="input-field"
                  value={formData.reservationTime}
                  onChange={handleChange}
                  min={restaurant.openingTime}
                  max={restaurant.closingTime}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Jumlah Orang</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  name="numberOfPeople" 
                  min="1" max={restaurant.capacity || 20} 
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  value={formData.numberOfPeople}
                  onChange={handleChange}
                />
                <span className="font-bold text-lg text-slate-700 w-12 text-center">{formData.numberOfPeople}</span>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Catatan Khusus (Opsional)</label>
              <textarea 
                name="specialRequests" 
                rows="3" 
                className="textarea-field"
                placeholder="Cth: Meja dekat jendela, ada anak kecil, alergi kacang..."
                value={formData.specialRequests}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="pt-4 flex gap-4">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Batal</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Memproses...' : 'Ajukan Reservasi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;

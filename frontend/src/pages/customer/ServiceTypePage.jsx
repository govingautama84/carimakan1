import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ServiceTypePage = () => {
  const { id } = useParams(); // reservationId
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceType, setServiceType] = useState('DINE_IN'); // default

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const res = await api.get(`/reservations/my/${id}`);
        if (res.data.success) {
          setReservation(res.data.data);
          if (res.data.data.status === 'REJECTED' || res.data.data.status === 'CANCELLED') {
             toast.error('Reservasi ini sudah dibatalkan atau ditolak.');
             navigate('/my-orders');
          }
        }
      } catch (error) {
        toast.error('Gagal memuat reservasi');
        navigate('/my-orders');
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [id, navigate]);

  const handleProceed = () => {
    if (reservation.status === 'PENDING') {
      toast('Pesanan Anda akan ditunda sampai reservasi disetujui restoran.', { icon: '⏳' });
    }
    // Proceed to restaurant menu with reservation context
    // Store selected service type in sessionStorage temporarily
    sessionStorage.setItem('currentServiceType', serviceType);
    sessionStorage.setItem('currentReservationId', reservation.id);
    navigate(`/restaurant/${reservation.restaurantId}`);
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center pt-32">
      <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"></div>
    </div>
  );

  if (!reservation) return null;

  return (
    <div className="page-container max-w-2xl py-12">
      <div className="card p-8 text-center border-orange-200 border-t-4 border-t-orange-500 shadow-xl">
        <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Reservasi Diterima!</h2>
        <p className="text-slate-600 mb-6">
          Reservasi Anda di <strong>{reservation.restaurant?.name}</strong> sedang menunggu konfirmasi restoran.
        </p>

        <div className="bg-slate-50 p-4 rounded-xl text-left mb-8 text-sm">
          <div className="grid grid-cols-2 gap-y-2">
            <div className="text-slate-500">Nomor Ref</div>
            <div className="font-semibold text-slate-800">RES-{reservation.id}</div>
            <div className="text-slate-500">Tanggal</div>
            <div className="font-semibold text-slate-800">{new Date(reservation.reservationDate).toLocaleDateString('id-ID')}</div>
            <div className="text-slate-500">Waktu</div>
            <div className="font-semibold text-slate-800">{reservation.reservationTime}</div>
            <div className="text-slate-500">Jumlah Orang</div>
            <div className="font-semibold text-slate-800">{reservation.guestCount} Orang</div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-orange-800 text-sm mb-8">
          <p>Karena Anda melakukan reservasi meja, pesanan Anda otomatis diatur sebagai <strong>Dine In (Makan di Tempat)</strong>.</p>
        </div>

        <div className="flex gap-4">
          <Link to="/my-orders" className="btn-secondary flex-1 py-3">Pesan Nanti</Link>
          <button onClick={handleProceed} className="btn-primary flex-1 py-3 shadow-orange">Pesan Makanan Sekarang</button>
        </div>
      </div>
    </div>
  );
};

export default ServiceTypePage;

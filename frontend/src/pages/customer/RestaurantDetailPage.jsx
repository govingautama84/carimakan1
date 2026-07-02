import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import MenuCard from '../../components/MenuCard';
import RatingStars from '../../components/RatingStars';
import toast from 'react-hot-toast';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [restoRes, menuRes, reviewRes] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/menus/restaurant/${id}`),
          api.get(`/reviews/restaurant/${id}`)
        ]);

        if (restoRes.data.success) setRestaurant(restoRes.data.data);
        if (menuRes.data.success) setMenus(menuRes.data.data);
        if (reviewRes.data.success) setReviews(reviewRes.data.data.reviews);
      } catch (error) {
        console.error(error);
        toast.error('Gagal mengambil data restoran');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="page-container text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Restoran Tidak Ditemukan</h2>
        <Link to="/restaurants" className="btn-primary">Kembali ke Daftar Restoran</Link>
      </div>
    );
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div>
      {/* Resto Hero Section */}
      <div className="relative h-80 md:h-96 w-full bg-slate-900">
        <img 
          src={restaurant.logo && restaurant.logo.startsWith('http') ? restaurant.logo : `${import.meta.env.VITE_BACKEND_URL || ''}${restaurant.logo}`} 
          alt={restaurant.name} 
          className="w-full h-full object-cover opacity-60"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(restaurant.name)}&background=1E293B&color=fff&size=800`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-3">
                  {restaurant.status ? (
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">Buka</span>
                  ) : (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">Tutup</span>
                  )}
                  {restaurant.category && (
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-semibold">{restaurant.category}</span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{restaurant.name}</h1>
                <div className="flex items-center gap-4 text-slate-200 mb-4 text-sm md:text-base">
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{restaurant.openingTime} - {restaurant.closingTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <RatingStars rating={avgRating} size="w-5 h-5" />
                    <span className="font-semibold ml-1">{avgRating > 0 ? avgRating : 'Baru'}</span>
                    <span>({reviews.length} ulasan)</span>
                  </div>
                </div>
                <p className="text-slate-300 max-w-2xl line-clamp-2 md:line-clamp-none">
                  {restaurant.description}
                </p>
              </div>

              <div className="flex-shrink-0">
                <Link to={`/restaurant/${restaurant.id}/reserve`} className="btn-primary shadow-orange block text-center px-8 py-3.5 text-lg w-full md:w-auto">
                  Reservasi Meja
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container -mt-4">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10">
          <div className="card p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Lokasi</p>
              <p className="font-semibold text-slate-800 line-clamp-1">{restaurant.address}, {restaurant.city}</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Kontak</p>
              <p className="font-semibold text-slate-800">{restaurant.phone || '-'}</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Kapasitas</p>
              <p className="font-semibold text-slate-800">{restaurant.capacity} Orang</p>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-12">
          <div className="flex border-b border-slate-200">
            <button 
              className={`flex-1 py-4 font-semibold text-center transition-colors ${activeTab === 'menu' ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/30' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              onClick={() => setActiveTab('menu')}
            >
              Menu Tersedia ({menus.length})
            </button>
            <button 
              className={`flex-1 py-4 font-semibold text-center transition-colors ${activeTab === 'reviews' ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/30' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              onClick={() => setActiveTab('reviews')}
            >
              Ulasan ({reviews.length})
            </button>
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'menu' && (
              menus.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">Restoran ini belum memiliki menu yang tersedia.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {menus.map(menu => (
                    <MenuCard key={menu.id} menu={menu} restaurant={restaurant} />
                  ))}
                </div>
              )
            )}

            {activeTab === 'reviews' && (
              reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">Belum ada ulasan untuk restoran ini.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                          {review.user.profileImage ? (
                            <img src={`${import.meta.env.VITE_BACKEND_URL || ''}${review.user.profileImage}`} alt={review.user.name} className="w-full h-full object-cover" />
                          ) : (
                            review.user.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{review.user.name}</div>
                          <div className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        </div>
                        <div className="ml-auto">
                          <RatingStars rating={review.rating} size="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm ml-14">{review.comment || '-'}</p>
                      {review.image && (
                        <div className="mt-3 ml-14">
                          <img src={`${import.meta.env.VITE_BACKEND_URL || ''}${review.image}`} alt="Review" className="h-24 rounded-lg object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailPage;

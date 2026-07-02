import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  const rating = restaurant.reviews?.length > 0 
    ? (restaurant.reviews.reduce((acc, curr) => acc + curr.rating, 0) / restaurant.reviews.length).toFixed(1)
    : 0;
  const reviewCount = restaurant.reviews?.length || 0;

  return (
    <Link to={`/restaurant/${restaurant.id}`} className="restaurant-card block h-full">
      <div className="restaurant-image-wrap">
        <img 
          src={restaurant.logo && restaurant.logo.startsWith('http') ? restaurant.logo : `${import.meta.env.VITE_BACKEND_URL || ''}${restaurant.logo}`} 
          alt={restaurant.name} 
          className="restaurant-img"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(restaurant.name)}&background=FF6B35&color=fff&size=400`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${
            restaurant.status 
              ? 'bg-emerald-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}>
            {restaurant.status ? 'Buka' : 'Tutup'}
          </span>
        </div>

        {/* Category Badge */}
        {restaurant.category && (
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              {restaurant.category}
            </span>
          </div>
        )}

        {/* Bottom Info in Image */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-xl font-bold mb-1 truncate">{restaurant.name}</h3>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold">{rating > 0 ? rating : 'Baru'}</span>
              {reviewCount > 0 && <span className="text-white/80 text-xs">({reviewCount})</span>}
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-white/90">{restaurant.openingTime} - {restaurant.closingTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white flex flex-col justify-between h-[calc(100%-12rem)]">
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
          {restaurant.description || 'Restoran ini belum menambahkan deskripsi.'}
        </p>
        
        <div className="flex items-center text-xs text-slate-400 gap-1 pt-3 border-t border-slate-100">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{restaurant.address}, {restaurant.city}</span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;

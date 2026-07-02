import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import RestaurantCard from '../../components/RestaurantCard';

const RestaurantListPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/restaurants');
      if (res.data.success) {
        // Only show verified and active restaurants to customers
        const activeRestos = res.data.data.filter(r => r.isVerified && r.status);
        setRestaurants(activeRestos);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(restaurants.map(r => r.category).filter(Boolean))];

  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Eksplorasi Restoran</h1>
        <p className="text-slate-500">Temukan tempat makan terbaik di sekitarmu</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="search-bar">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Cari nama restoran atau kota..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                categoryFilter === cat 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card h-[340px] flex flex-col">
              <div className="skeleton h-48 w-full"></div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="skeleton h-6 w-3/4 mb-2"></div>
                  <div className="skeleton h-4 w-1/4 mb-4"></div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-full mt-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <svg className="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Restoran tidak ditemukan</h3>
          <p className="text-slate-500">Coba gunakan kata kunci pencarian atau kategori lain.</p>
          <button 
            onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}
            className="mt-6 btn-secondary"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRestaurants.map((restaurant, idx) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <RestaurantCard restaurant={restaurant} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantListPage;

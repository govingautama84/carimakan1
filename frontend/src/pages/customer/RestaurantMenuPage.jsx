import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restoranAPI, kategoriAPI, getImageUrl } from '../../services/api';
import { useCart } from '../../context/CartContext';
import CustomerNavbar from '../../components/CustomerNavbar';
import { MdRestaurant, MdAddShoppingCart, MdArrowBack } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';
import Swal from 'sweetalert2';

const RestaurantMenuPage = () => {
  const { restoranId } = useParams();
  const navigate = useNavigate();
  const { setCurrentRestoran, addToCart, restoranId: currentRestoranId, clearCart } = useCart();

  const [restoran, setRestoran] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allMenu, setAllMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const restoRes = await restoranAPI.getById(restoranId);
        const foundResto = restoRes.data.data;
        setRestoran(foundResto);
        
        // Handle switching restaurants
        if (currentRestoranId && currentRestoranId != restoranId) {
          Swal.fire({
            title: 'Ganti Restoran?',
            text: "Keranjang Anda sebelumnya akan dikosongkan.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Ganti',
            cancelButtonText: 'Batal'
          }).then((result) => {
            if (result.isConfirmed) {
              clearCart();
              setCurrentRestoran(restoranId);
            } else {
              navigate('/');
              return;
            }
          });
        } else {
          setCurrentRestoran(restoranId);
        }

        const [katRes, menuRes] = await Promise.all([
          kategoriAPI.getAll(),
          restoranAPI.getMenu(restoranId)
        ]);
        setCategories(katRes.data.data);
        setAllMenu(menuRes.data.data);
      } catch (err) {
        setError('Restoran tidak ditemukan atau terjadi kesalahan.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [restoranId, currentRestoranId]);

  const filteredMenu = allMenu.filter((item) => {
    const matchCategory = activeCategory === 'all' || item.kategori_id == activeCategory;
    const matchSearch = item.nama_menu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) return (
    <div>
      <CustomerNavbar />
      <div className="page-loader"><div className="spinner-border" style={{ color: 'var(--primary)' }}></div></div>
    </div>
  );

  if (error) return (
    <div>
      <CustomerNavbar />
      <div className="container py-5 text-center">
        <div style={{ fontSize: '4rem' }}>😕</div>
        <h3 className="mt-3">{error}</h3>
        <button className="btn btn-primary mt-3 rounded-pill px-4" onClick={() => navigate('/')}>
          <MdArrowBack className="me-2" /> Kembali ke Beranda
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--light)' }}>
      <CustomerNavbar />

      {/* Hero */}
      <div className="customer-hero position-relative">
        {restoran?.gambar && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${getImageUrl(restoran.gambar)})`,
            backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3, zIndex: 0
          }} />
        )}
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center">
            <div className="col">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button className="btn btn-sm btn-outline-light rounded-pill" onClick={() => navigate('/')}>
                  <MdArrowBack /> Kembali
                </button>
                <button className="btn btn-sm btn-light rounded-pill fw-bold text-primary px-4" onClick={() => navigate(`/restaurant/${restoranId}/reserve`)}>
                  📅 Reservasi Meja
                </button>
              </div>
              <h1 className="mb-2 fw-bold text-white">{restoran?.nama}</h1>
              <p className="mb-3 text-white-50">{restoran?.alamat}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ background: 'white', padding: '16px 0', borderBottom: '1px solid var(--gray-200)' }}>
        <div className="container">
          <div className="search-input-group">
            <FiSearch className="search-icon" size={16} />
            <input
              type="text"
              className="form-control"
              placeholder="Cari menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <div className="container">
          <div className="category-tabs-scroll">
            <button
              className={`category-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              🍽️ Semua Menu
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-tab-btn ${activeCategory == cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.nama}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="container py-4">
        {filteredMenu.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <h5>Tidak ada menu ditemukan</h5>
            <p>Coba kata kunci atau kategori lain</p>
          </div>
        ) : (
          <div className="row g-3">
            {filteredMenu.map((item) => (
              <div key={item.id} className="col-6 col-sm-4 col-md-3 col-lg-3">
                <div className="menu-card position-relative" style={{ cursor: 'default' }}>
                  {item.gambar ? (
                    <img src={getImageUrl(item.gambar)} alt={item.nama_menu} className="menu-card-img" />
                  ) : (
                    <div className="menu-card-img-placeholder">
                      <MdRestaurant />
                    </div>
                  )}
                  <div className="menu-card-body">
                    <div className="menu-card-title">{item.nama_menu}</div>
                    <div className="menu-card-desc">{item.deskripsi || 'Hidangan lezat dari dapur kami'}</div>
                    <div className="menu-card-price">
                      Rp {Number(item.harga).toLocaleString('id-ID')}
                    </div>
                    <button
                      className="btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => addToCart(item)}
                    >
                      <MdAddShoppingCart size={16} />
                      Tambah
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: 'var(--dark)', color: 'rgba(255,255,255,0.6)', padding: '20px 0', textAlign: 'center', fontSize: '0.8rem', marginTop: '40px' }}>
        <div className="container">
          <p className="mb-0">© 2024 Demail Restaurant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default RestaurantMenuPage;

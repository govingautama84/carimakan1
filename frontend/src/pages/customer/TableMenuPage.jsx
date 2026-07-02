import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mejaAPI, menuAPI, kategoriAPI, getImageUrl } from '../../services/api';
import { useCart } from '../../context/CartContext';
import CustomerNavbar from '../../components/CustomerNavbar';
import { MdRestaurant, MdAddShoppingCart } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';

const TableMenuPage = () => {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const { setTable, addToCart, tableNumber: currentTable } = useCart();

  const [meja, setMeja] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allMenu, setAllMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const mejaRes = await mejaAPI.getByNomor(tableNumber);
        const foundMeja = mejaRes.data.data;
        setMeja(foundMeja);
        setTable(foundMeja.nomor_meja, foundMeja.id);

        const [katRes, menuRes] = await Promise.all([
          kategoriAPI.getAll(),
          menuAPI.getAll({ tersedia: 'true' })
        ]);
        setCategories(katRes.data.data);
        setAllMenu(menuRes.data.data);
      } catch (err) {
        setError('Meja tidak ditemukan atau terjadi kesalahan.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [tableNumber]);

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
        <p className="text-muted">Pastikan Anda memindai QR Code yang benar.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--light)' }}>
      <CustomerNavbar />

      {/* Hero */}
      <div className="customer-hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="mb-2">Selamat Datang! 👋</h1>
              <p className="mb-3">Pilih menu favoritmu dan nikmati pengalaman makan yang menyenangkan</p>
              <div className="hero-table-info">
                <MdRestaurant size={18} />
                <span>Anda berada di <strong>Meja Nomor {meja?.nomor_meja}</strong></span>
              </div>
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

export default TableMenuPage;

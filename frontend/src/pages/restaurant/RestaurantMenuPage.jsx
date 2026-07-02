import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RestaurantMenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [mealCategories, setMealCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', category: '', price: '', stock: '50', description: ''
  });
  const [imageFile, setImageFile] = useState(null);

  // Import State
  const [importCategory, setImportCategory] = useState('');
  const [importPrice, setImportPrice] = useState('35000');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchMenus();
    fetchMealCategories();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/menus/my');
      if (res.data.success) setMenus(res.data.data);
    } catch (error) {
      toast.error('Gagal memuat menu');
    } finally {
      setLoading(false);
    }
  };

  const fetchMealCategories = async () => {
    try {
      const res = await api.get('/menus/mealdb/categories');
      if (res.data.success) setMealCategories(res.data.data);
    } catch (error) {
      console.error('Failed to load TheMealDB categories');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ name: '', category: '', price: '', stock: '50', description: '' });
    setImageFile(null);
    setShowModal(true);
  };

  const openEditModal = (menu) => {
    setIsEditing(true);
    setCurrentId(menu.id);
    setFormData({
      name: menu.name,
      category: menu.category || '',
      price: menu.price.toString(),
      stock: menu.stock.toString(),
      description: menu.description || ''
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (imageFile) data.append('image', imageFile);

    try {
      if (isEditing) {
        await api.put(`/menus/${currentId}`, data);
        toast.success('Menu berhasil diupdate');
      } else {
        await api.post('/menus', data);
        toast.success('Menu berhasil ditambahkan');
      }
      setShowModal(false);
      fetchMenus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan menu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus menu ini?')) {
      try {
        await api.delete(`/menus/${id}`);
        toast.success('Menu dihapus');
        fetchMenus();
      } catch (error) {
        toast.error('Gagal menghapus menu');
      }
    }
  };

  const toggleAvailability = async (id) => {
    try {
      await api.patch(`/menus/${id}/toggle`);
      fetchMenus();
    } catch (error) {
      toast.error('Gagal update status');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importCategory) return toast.error('Pilih kategori terlebih dahulu');
    
    setImporting(true);
    try {
      const res = await api.post('/menus/import-mealdb', { category: importCategory, price: importPrice });
      toast.success(res.data.message);
      setShowImportModal(false);
      fetchMenus();
    } catch (error) {
      toast.error('Gagal import dari TheMealDB');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Kelola Menu</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowImportModal(true)} className="btn-secondary text-sm px-4">
            Import TheMealDB
          </button>
          <button onClick={openAddModal} className="btn-primary text-sm px-4 flex items-center gap-2 shadow-orange">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Tambah Menu
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Menu</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th>Stok</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {menus.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">Belum ada menu. Silakan tambah atau import.</td>
                  </tr>
                ) : (
                  menus.map(menu => (
                    <tr key={menu.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                            {menu.image && <img src={menu.image.startsWith('http') ? menu.image : `${import.meta.env.VITE_BACKEND_URL || ''}${menu.image}`} alt={menu.name} className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 line-clamp-1">{menu.name}</p>
                            {menu.mealdbId && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">TheMealDB</span>}
                          </div>
                        </div>
                      </td>
                      <td>{menu.category || '-'}</td>
                      <td className="font-medium text-slate-800">Rp {Number(menu.price).toLocaleString('id-ID')}</td>
                      <td>{menu.stock}</td>
                      <td>
                        <button 
                          onClick={() => toggleAvailability(menu.id)}
                          className={`badge ${menu.isAvailable ? 'badge-success' : 'badge-danger'} cursor-pointer hover:opacity-80`}
                        >
                          {menu.isAvailable ? 'Tersedia' : 'Habis'}
                        </button>
                      </td>
                      <td className="text-right">
                        <button onClick={() => openEditModal(menu)} className="btn-icon text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(menu.id)} className="btn-icon text-red-500 hover:text-red-700 hover:bg-red-50 ml-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit Menu */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold text-slate-800">{isEditing ? 'Edit Menu' : 'Tambah Menu Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div className="input-group">
                  <label className="input-label">Nama Menu</label>
                  <input type="text" name="name" required className="input-field" value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">Kategori</label>
                    <input type="text" name="category" className="input-field" value={formData.category} onChange={handleInputChange} placeholder="Cth: Minuman, Makanan Utama" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Harga (Rp)</label>
                    <input type="number" name="price" required className="input-field" value={formData.price} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Stok / Porsi per Hari</label>
                  <input type="number" name="stock" required className="input-field" value={formData.stock} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label className="input-label">Deskripsi</label>
                  <textarea name="description" rows="2" className="textarea-field" value={formData.description} onChange={handleInputChange}></textarea>
                </div>
                <div className="input-group">
                  <label className="input-label">Gambar Menu</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Batal</button>
                <button type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import TheMealDB */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header bg-slate-50">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <h3 className="text-lg font-bold text-slate-800">Import dari TheMealDB</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleImport}>
              <div className="modal-body space-y-4">
                <p className="text-sm text-slate-500 mb-4">Fitur ini akan mengambil maksimal 10 menu acak berdasarkan kategori dari API TheMealDB beserta gambar dan deskripsinya.</p>
                
                <div className="input-group">
                  <label className="input-label">Pilih Kategori Makanan</label>
                  <select required className="select-field" value={importCategory} onChange={(e) => setImportCategory(e.target.value)}>
                    <option value="">-- Pilih Kategori --</option>
                    {mealCategories.map(cat => (
                      <option key={cat.idCategory} value={cat.strCategory}>{cat.strCategory}</option>
                    ))}
                  </select>
                </div>
                
                <div className="input-group">
                  <label className="input-label">Harga Default (Rp)</label>
                  <input type="number" required className="input-field" value={importPrice} onChange={(e) => setImportPrice(e.target.value)} />
                  <p className="text-xs text-slate-400 mt-1">Harga dapat diubah nanti di manajemen menu.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowImportModal(false)} className="btn-ghost">Batal</button>
                <button type="submit" disabled={importing} className="btn-primary flex items-center gap-2">
                  {importing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                  {importing ? 'Mengimpor...' : 'Mulai Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenuPage;

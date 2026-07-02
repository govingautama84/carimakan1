import { useEffect, useState, useRef } from 'react';
import { menuAPI, kategoriAPI, getImageUrl } from '../../services/api';
import { MdAdd, MdEdit, MdDelete, MdRestaurant, MdToggleOn, MdToggleOff } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';
import Swal from 'sweetalert2';

const MenuPage = () => {
  const [menuList, setMenuList] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKat, setFilterKat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const fileRef = useRef(null);

  const initForm = { category: '', name: '', description: '', price: '', isAvailable: 'true', image: null };
  const [form, setForm] = useState(initForm);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [menuRes, katRes] = await Promise.all([menuAPI.getAll(), kategoriAPI.getAll()]);
      setMenuList(menuRes.data.data);
      setKategori(katRes.data.data);
    } catch { Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal memuat data.', confirmButtonColor: '#7B1A1A' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => {
    setEditData(null); setForm(initForm); setPreviewImg(null);
    if (fileRef.current) fileRef.current.value = '';
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditData(item);
    setForm({ category: item.category || '', name: item.name, description: item.description || '', price: item.price, isAvailable: item.isAvailable ? 'true' : 'false', image: null });
    setPreviewImg(item.image ? getImageUrl(item.image) : null);
    if (fileRef.current) fileRef.current.value = '';
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.category || !form.name || !form.price) {
      return Swal.fire({ icon: 'warning', title: 'Peringatan', text: 'Kategori, nama, dan harga wajib diisi.', confirmButtonColor: '#7B1A1A' });
    }
    setSaving(true);
    const fd = new FormData();
    fd.append('category', form.category);
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('isAvailable', form.isAvailable);
    if (form.image) fd.append('image', form.image);

    try {
      if (editData) {
        await menuAPI.update(editData.id, fd);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Menu diperbarui.', timer: 1500, showConfirmButton: false });
      } else {
        await menuAPI.create(fd);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Menu ditambahkan.', timer: 1500, showConfirmButton: false });
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Terjadi kesalahan.', confirmButtonColor: '#7B1A1A' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, nama) => {
    const result = await Swal.fire({ title: `Hapus "${nama}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#E74C3C', cancelButtonColor: '#6c757d', confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal' });
    if (!result.isConfirmed) return;
    try {
      await menuAPI.delete(id);
      Swal.fire({ icon: 'success', title: 'Dihapus!', timer: 1500, showConfirmButton: false });
      fetchAll();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Gagal menghapus.', confirmButtonColor: '#7B1A1A' });
    }
  };

  const handleToggle = async (id) => {
    try {
      await menuAPI.toggleTersedia(id);
      fetchAll();
    } catch { Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal mengubah status.', confirmButtonColor: '#7B1A1A' }); }
  };

  const filtered = menuList.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    // Fallback if category string match or ID match if the category API is still sending ID
    const matchKat = !filterKat || m.category === filterKat;
    return matchSearch && matchKat;
  });

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--dark)', marginBottom: 4 }}>Menu</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', margin: 0 }}>{menuList.length} menu terdaftar</p>
        </div>
        <button className="btn-primary-custom d-flex align-items-center gap-2" onClick={openAdd}>
          <MdAdd size={18} /> Tambah Menu
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header flex-wrap gap-2">
          <h5 className="admin-card-title">🍽️ Daftar Menu</h5>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <select className="form-select form-select-sm" style={{ width: 160 }} value={filterKat} onChange={e => setFilterKat(e.target.value)}>
              <option value="">Semua Kategori</option>
              {kategori.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
            <div className="search-input-group" style={{ width: 220 }}>
              <FiSearch className="search-icon" size={14} />
              <input type="text" placeholder="Cari menu..." value={search} onChange={e => setSearch(e.target.value)} className="form-control" style={{ paddingLeft: 32 }} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="page-loader" style={{ minHeight: 200 }}><div className="spinner-border" style={{ color: 'var(--primary)' }}></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><MdRestaurant /></div>
            <h5>Belum ada menu</h5>
            <p>Tambahkan menu pertama Anda</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Gambar</th>
                  <th>Nama Menu</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td>
                      {item.image ? (
                        <img src={getImageUrl(item.image)} alt={item.name} className="menu-img-table" />
                      ) : (
                        <div className="menu-img-placeholder"><MdRestaurant /></div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{item.description?.substring(0, 40)}{item.description?.length > 40 ? '...' : ''}</div>
                    </td>
                    <td><span className="badge bg-light text-dark" style={{ fontSize: '0.78rem' }}>{item.category}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>Rp {Number(item.price).toLocaleString('id-ID')}</td>
                    <td>
                      <button onClick={() => handleToggle(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', padding: 0 }}
                        title={item.isAvailable ? 'Nonaktifkan' : 'Aktifkan'}>
                        {item.isAvailable ? <MdToggleOn color="var(--success)" /> : <MdToggleOff color="var(--gray-400)" />}
                      </button>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn-action btn-edit" onClick={() => openEdit(item)} title="Edit"><MdEdit size={14} /></button>
                        <button className="btn-action btn-delete" onClick={() => handleDelete(item.id, item.name)} title="Hapus"><MdDelete size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050, overflowY: 'auto' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" style={{ borderRadius: 16, overflow: 'hidden', border: 'none' }}>
              <div className="modal-header-custom">
                <h5 className="modal-title fw-bold">{editData ? '✏️ Edit Menu' : '➕ Tambah Menu'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label-custom">Kategori *</label>
                          <select className="form-select form-control-custom" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                            <option value="">Pilih Kategori</option>
                            {kategori.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="form-label-custom">Nama Menu *</label>
                          <input type="text" className="form-control-custom" placeholder="Masukkan nama menu" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="col-12">
                          <label className="form-label-custom">Deskripsi</label>
                          <textarea className="form-control-custom" rows={3} placeholder="Deskripsi singkat menu..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
                        </div>
                        <div className="col-6">
                          <label className="form-label-custom">Harga (Rp) *</label>
                          <input type="number" className="form-control-custom" placeholder="0" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                        </div>
                        <div className="col-6">
                          <label className="form-label-custom">Status</label>
                          <select className="form-select form-control-custom" value={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.value })}>
                            <option value="true">Tersedia</option>
                            <option value="false">Tidak Tersedia</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label-custom">Gambar Menu</label>
                      <div style={{ border: '2px dashed var(--gray-300)', borderRadius: 12, padding: 16, textAlign: 'center', cursor: 'pointer', minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => fileRef.current.click()}>
                        {previewImg ? (
                          <img src={previewImg} alt="preview" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }} />
                        ) : (
                          <>
                            <MdRestaurant size={40} color="var(--gray-300)" />
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 8 }}>Klik untuk upload gambar</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--gray-300)' }}>JPG, PNG, WEBP (max 5MB)</div>
                          </>
                        )}
                      </div>
                      <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                      {previewImg && (
                        <button type="button" className="btn btn-sm btn-outline-danger mt-2 w-100" onClick={() => { setPreviewImg(null); setForm({ ...form, image: null }); if (fileRef.current) fileRef.current.value = ''; }}>
                          Hapus Gambar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn-primary-custom" disabled={saving}>
                    {saving ? <><div className="spinner-border spinner-border-sm me-2" />Menyimpan...</> : '💾 Simpan Menu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;

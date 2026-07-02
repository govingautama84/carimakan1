import { useEffect, useState } from 'react';
import { kategoriAPI } from '../../services/api';
import { MdAdd, MdEdit, MdDelete, MdCategory } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';
import Swal from 'sweetalert2';

const KategoriPage = () => {
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ nama: '' });
  const [saving, setSaving] = useState(false);

  const fetchKategori = async () => {
    try {
      const res = await kategoriAPI.getAll();
      setKategori(res.data.data);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal memuat kategori.', confirmButtonColor: '#7B1A1A' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKategori(); }, []);

  const openAdd = () => { setEditData(null); setForm({ nama: '' }); setShowModal(true); };
  const openEdit = (item) => { setEditData(item); setForm({ nama: item.nama }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nama.trim()) return Swal.fire({ icon: 'warning', title: 'Peringatan', text: 'Nama kategori wajib diisi.', confirmButtonColor: '#7B1A1A' });
    setSaving(true);
    try {
      if (editData) {
        await kategoriAPI.update(editData.id, form);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Kategori diperbarui.', timer: 1500, showConfirmButton: false });
      } else {
        await kategoriAPI.create(form);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Kategori ditambahkan.', timer: 1500, showConfirmButton: false });
      }
      setShowModal(false);
      fetchKategori();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Terjadi kesalahan.', confirmButtonColor: '#7B1A1A' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, nama) => {
    const result = await Swal.fire({
      title: `Hapus kategori "${nama}"?`,
      text: 'Menu dalam kategori ini juga akan terhapus!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E74C3C',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });
    if (!result.isConfirmed) return;
    try {
      await kategoriAPI.delete(id);
      Swal.fire({ icon: 'success', title: 'Dihapus!', text: 'Kategori berhasil dihapus.', timer: 1500, showConfirmButton: false });
      fetchKategori();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Gagal menghapus.', confirmButtonColor: '#7B1A1A' });
    }
  };

  const filtered = kategori.filter(k => k.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--dark)', marginBottom: 4 }}>Kategori Menu</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', margin: 0 }}>{kategori.length} kategori terdaftar</p>
        </div>
        <button className="btn-primary-custom d-flex align-items-center gap-2" onClick={openAdd}>
          <MdAdd size={18} /> Tambah Kategori
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h5 className="admin-card-title">📂 Daftar Kategori</h5>
          <div className="search-input-group" style={{ width: 240 }}>
            <FiSearch className="search-icon" size={14} />
            <input type="text" placeholder="Cari kategori..." value={search} onChange={e => setSearch(e.target.value)} className="form-control" style={{ paddingLeft: 32 }} />
          </div>
        </div>

        {loading ? (
          <div className="page-loader" style={{ minHeight: 200 }}><div className="spinner-border" style={{ color: 'var(--primary)' }}></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><MdCategory /></div>
            <h5>Belum ada kategori</h5>
            <p>Tambahkan kategori menu pertama Anda</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama Kategori</th>
                  <th>Dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>{idx + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(123,26,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MdCategory color="var(--primary)" size={18} />
                        </div>
                        <strong>{item.nama}</strong>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn-action btn-edit" onClick={() => openEdit(item)} title="Edit"><MdEdit size={14} /></button>
                        <button className="btn-action btn-delete" onClick={() => handleDelete(item.id, item.nama)} title="Hapus"><MdDelete size={14} /></button>
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
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16, overflow: 'hidden', border: 'none' }}>
              <div className="modal-header-custom">
                <h5 className="modal-title fw-bold">{editData ? '✏️ Edit Kategori' : '➕ Tambah Kategori'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  <label className="form-label-custom">Nama Kategori</label>
                  <input
                    type="text"
                    className="form-control-custom"
                    placeholder="Contoh: Makanan Utama"
                    value={form.nama}
                    onChange={e => setForm({ ...form, nama: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn-primary-custom" disabled={saving}>
                    {saving ? <><div className="spinner-border spinner-border-sm me-2" />Menyimpan...</> : '💾 Simpan'}
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

export default KategoriPage;

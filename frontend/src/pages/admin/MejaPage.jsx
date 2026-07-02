import { useEffect, useState, useRef } from 'react';
import { mejaAPI } from '../../services/api';
import { MdAdd, MdEdit, MdDelete, MdTableBar, MdQrCode2, MdDownload, MdContentCopy } from 'react-icons/md';
import QRCode from 'qrcode';
import Swal from 'sweetalert2';

const statusOptions = ['tersedia', 'terisi', 'reserved'];
const statusCls = { tersedia: 'badge-tersedia', terisi: 'badge-terisi', reserved: 'badge-diproses' };

const MejaPage = () => {
  const [mejaList, setMejaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedMeja, setSelectedMeja] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [form, setForm] = useState({ nomor_meja: '', status: 'tersedia' });
  const [saving, setSaving] = useState(false);
  const qrRef = useRef(null);

  const fetchMeja = async () => {
    setLoading(true);
    try {
      const res = await mejaAPI.getAll();
      setMejaList(res.data.data);
    } catch { Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal memuat data meja.', confirmButtonColor: '#7B1A1A' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMeja(); }, []);

  const openAdd = () => { setEditData(null); setForm({ nomor_meja: '', status: 'tersedia' }); setShowModal(true); };
  const openEdit = (item) => { setEditData(item); setForm({ nomor_meja: item.nomor_meja, status: item.status }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nomor_meja) return Swal.fire({ icon: 'warning', title: 'Peringatan', text: 'Nomor meja wajib diisi.', confirmButtonColor: '#7B1A1A' });
    setSaving(true);
    try {
      if (editData) {
        await mejaAPI.update(editData.id, form);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Meja diperbarui.', timer: 1500, showConfirmButton: false });
      } else {
        await mejaAPI.create(form);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Meja ditambahkan.', timer: 1500, showConfirmButton: false });
      }
      setShowModal(false);
      fetchMeja();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Terjadi kesalahan.', confirmButtonColor: '#7B1A1A' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, nomor) => {
    const result = await Swal.fire({ title: `Hapus Meja ${nomor}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#E74C3C', cancelButtonColor: '#6c757d', confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal' });
    if (!result.isConfirmed) return;
    try {
      await mejaAPI.delete(id);
      Swal.fire({ icon: 'success', title: 'Dihapus!', timer: 1500, showConfirmButton: false });
      fetchMeja();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Gagal menghapus.', confirmButtonColor: '#7B1A1A' });
    }
  };

  const openQR = async (meja) => {
    setSelectedMeja(meja);
    try {
      const url = meja.qr_code || `http://localhost:5173/order/table/${meja.nomor_meja}`;
      const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#7B1A1A', light: '#FFFFFF' } });
      setQrDataUrl(dataUrl);
      setShowQRModal(true);
    } catch { Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal generate QR Code.', confirmButtonColor: '#7B1A1A' }); }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `QR-Meja-${selectedMeja.nomor_meja}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const copyUrl = () => {
    const url = selectedMeja.qr_code || `http://localhost:5173/order/table/${selectedMeja.nomor_meja}`;
    navigator.clipboard.writeText(url);
    Swal.fire({ icon: 'success', title: 'Disalin!', text: 'URL berhasil disalin.', timer: 1200, showConfirmButton: false });
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--dark)', marginBottom: 4 }}>Meja & QR Code</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', margin: 0 }}>{mejaList.length} meja terdaftar</p>
        </div>
        <button className="btn-primary-custom d-flex align-items-center gap-2" onClick={openAdd}>
          <MdAdd size={18} /> Tambah Meja
        </button>
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner-border" style={{ color: 'var(--primary)' }}></div></div>
      ) : mejaList.length === 0 ? (
        <div className="admin-card">
          <div className="empty-state">
            <div className="empty-state-icon"><MdTableBar /></div>
            <h5>Belum ada meja</h5>
            <p>Tambahkan meja pertama Anda</p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {mejaList.map(meja => (
            <div key={meja.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
              <div className="admin-card" style={{ padding: 0, textAlign: 'center', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', padding: '20px 16px 12px', color: 'white' }}>
                  <MdTableBar size={32} />
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>
                    {meja.nomor_meja}
                  </div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Nomor Meja</div>
                </div>
                <div style={{ padding: '12px 12px 16px' }}>
                  <span className={`badge-status ${statusCls[meja.status] || ''}`} style={{ fontSize: '0.72rem', marginBottom: 12, display: 'inline-block' }}>
                    {meja.status}
                  </span>
                  <div className="d-flex gap-1 justify-content-center mt-2">
                    <button className="btn-action btn-view" onClick={() => openQR(meja)} title="QR Code"><MdQrCode2 size={14} /></button>
                    <button className="btn-action btn-edit" onClick={() => openEdit(meja)} title="Edit"><MdEdit size={14} /></button>
                    <button className="btn-action btn-delete" onClick={() => handleDelete(meja.id, meja.nomor_meja)} title="Hapus"><MdDelete size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16, overflow: 'hidden', border: 'none' }}>
              <div className="modal-header-custom">
                <h5 className="modal-title fw-bold">{editData ? '✏️ Edit Meja' : '➕ Tambah Meja'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label-custom">Nomor Meja *</label>
                    <input type="number" className="form-control-custom" placeholder="Contoh: 1" min="1" value={form.nomor_meja} onChange={e => setForm({ ...form, nomor_meja: e.target.value })} required autoFocus />
                  </div>
                  {editData && (
                    <div>
                      <label className="form-label-custom">Status</label>
                      <select className="form-select form-control-custom" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
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

      {/* QR Modal */}
      {showQRModal && selectedMeja && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16, overflow: 'hidden', border: 'none' }}>
              <div className="modal-header-custom">
                <h5 className="modal-title fw-bold">📱 QR Code — Meja {selectedMeja.nomor_meja}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowQRModal(false)} />
              </div>
              <div className="modal-body p-4 text-center">
                <div className="qr-container d-inline-block">
                  {qrDataUrl && <img src={qrDataUrl} alt="QR Code" style={{ width: 240, height: 240 }} />}
                  <div className="qr-url-text mt-2">
                    {selectedMeja.qr_code || `http://localhost:5173/order/table/${selectedMeja.nomor_meja}`}
                  </div>
                </div>
                <p className="text-muted mt-3" style={{ fontSize: '0.85rem' }}>
                  Pelanggan dapat memindai QR Code ini untuk mengakses menu pesanan.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button className="btn-primary-custom d-flex align-items-center gap-2" onClick={downloadQR}>
                    <MdDownload size={16} /> Download QR
                  </button>
                  <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={copyUrl}>
                    <MdContentCopy size={16} /> Salin URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MejaPage;

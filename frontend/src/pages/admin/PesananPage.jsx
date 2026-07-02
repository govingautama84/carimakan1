import { useEffect, useState } from 'react';
import { pesananAPI } from '../../services/api';
import { MdReceiptLong, MdRefresh, MdVisibility, MdDelete } from 'react-icons/md';
import Swal from 'sweetalert2';

// Matches Prisma OrderStatus
const statusPesananList = ['CREATED', 'VERIFIED', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERING', 'COMPLETED'];
const statusCls = { 
  CREATED: 'badge-menunggu', 
  VERIFIED: 'badge-menunggu',
  ACCEPTED: 'badge-diproses', 
  PREPARING: 'badge-diproses', 
  READY: 'badge-siap_diantar', 
  DELIVERING: 'badge-siap_diantar', 
  COMPLETED: 'badge-selesai' 
};
const statusLabels = { 
  CREATED: 'Menunggu', 
  VERIFIED: 'Terverifikasi',
  ACCEPTED: 'Diterima', 
  PREPARING: 'Diproses', 
  READY: 'Siap', 
  DELIVERING: 'Diantar', 
  COMPLETED: 'Selesai' 
};
const pembayaranCls = { UNPAID: 'badge-belum_bayar', VERIFYING: 'badge-belum_bayar', SUCCESS: 'badge-lunas', FAILED: 'badge-belum_bayar' };
const formatRp = (v) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;

const PesananPage = () => {
  const [pesananList, setPesananList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedPesanan, setSelectedPesanan] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchPesanan = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDate) params.date = filterDate;
      const res = await pesananAPI.getAllAdmin(params);
      setPesananList(res.data.data);
    } catch { 
      Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal memuat pesanan.', confirmButtonColor: '#7B1A1A' }); 
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPesanan(); }, [filterStatus, filterDate]);

  const updateStatus = async (id, field, value) => {
    try {
      // In the Prisma backend, we update order status via patch.
      // Payment status is usually handled differently, but if we need to update it, we might need a different endpoint.
      // For now, order status is what's exposed in the backend.
      if (field === 'status') {
        await pesananAPI.updateStatus(id, { status: value });
      }
      fetchPesanan();
      if (selectedPesanan?.id === id) {
        setSelectedPesanan(prev => ({ ...prev, [field]: value }));
      }
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Status diperbarui.', timer: 1200, showConfirmButton: false, toast: true, position: 'top-end' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Gagal mengubah status.', confirmButtonColor: '#7B1A1A' });
    }
  };

  const handleDelete = async (id, nomor) => {
    const result = await Swal.fire({ title: `Hapus pesanan ${nomor}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#E74C3C', cancelButtonColor: '#6c757d', confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal' });
    if (!result.isConfirmed) return;
    try {
      await pesananAPI.delete(id);
      Swal.fire({ icon: 'success', title: 'Dihapus!', timer: 1500, showConfirmButton: false });
      fetchPesanan();
      if (showDetail && selectedPesanan?.id === id) setShowDetail(false);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Gagal menghapus.', confirmButtonColor: '#7B1A1A' });
    }
  };

  const openDetail = (pesanan) => { setSelectedPesanan(pesanan); setShowDetail(true); };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--dark)', marginBottom: 4 }}>Manajemen Pesanan</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', margin: 0 }}>{pesananList.length} pesanan ditemukan</p>
        </div>
        <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={fetchPesanan}>
          <MdRefresh /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card mb-4">
        <div className="admin-card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label-custom">Filter Status</label>
              <select className="form-select form-control-custom" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Semua Status</option>
                {statusPesananList.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label-custom">Filter Tanggal</label>
              <input type="date" className="form-control-custom" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            </div>
            <div className="col-md-4">
              <button className="btn btn-outline-secondary w-100" onClick={() => { setFilterStatus(''); setFilterDate(''); }}>Reset Filter</button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h5 className="admin-card-title">📋 Daftar Pesanan</h5>
        </div>
        {loading ? (
          <div className="page-loader" style={{ minHeight: 200 }}><div className="spinner-border" style={{ color: 'var(--primary)' }}></div></div>
        ) : pesananList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><MdReceiptLong /></div>
            <h5>Belum ada pesanan</h5>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>No. Pesanan</th>
                  <th>Meja/Tipe</th>
                  <th>Total</th>
                  <th>Metode</th>
                  <th>Status Pesanan</th>
                  <th>Status Bayar</th>
                  <th>Waktu</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pesananList.map(p => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.82rem' }}>{p.orderNumber}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{p.customer?.name}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {p.serviceType === 'DINE_IN' ? (p.tableId ? `Meja #${p.tableId}` : 'Dine In') : p.serviceType}
                      </span>
                    </td>
                    <td><strong style={{ fontSize: '0.875rem' }}>{formatRp(p.totalAmount)}</strong></td>
                    <td style={{ fontSize: '0.8rem' }}>{p.payment?.paymentMethod || '-'}</td>
                    <td>
                      <select className="form-select form-select-sm" style={{ fontSize: '0.78rem', border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px 4px', minWidth: 110 }}
                        value={p.status} onChange={e => updateStatus(p.id, 'status', e.target.value)}>
                        {statusPesananList.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                      </select>
                    </td>
                    <td>
                      {/* Read-only for payment status since it's managed by Payment Gateway / Verification */}
                      <span className={`badge-status ${pembayaranCls[p.payment?.status] || 'badge-belum_bayar'}`} style={{ display: 'inline-block' }}>
                        {p.payment?.status || 'UNPAID'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>
                      {new Date(p.createdAt).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn-action btn-view" onClick={() => openDetail(p)} title="Detail"><MdVisibility size={14} /></button>
                        <button className="btn-action btn-delete" onClick={() => handleDelete(p.id, p.orderNumber)} title="Hapus"><MdDelete size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedPesanan && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050, overflowY: 'auto' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" style={{ borderRadius: 16, overflow: 'hidden', border: 'none' }}>
              <div className="modal-header-custom">
                <h5 className="modal-title fw-bold">📋 Detail Pesanan — {selectedPesanan.orderNumber}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetail(false)} />
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-3">
                  <div className="col-6 col-md-3">
                    <div style={{ background: 'var(--gray-100)', borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>Tipe/Meja</div>
                      <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>
                        {selectedPesanan.serviceType === 'DINE_IN' ? (selectedPesanan.tableId ? `#${selectedPesanan.tableId}` : 'Dine In') : selectedPesanan.serviceType}
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div style={{ background: 'var(--gray-100)', borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>Total</div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>{formatRp(selectedPesanan.totalAmount)}</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div style={{ background: 'var(--gray-100)', borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>Status Pesanan</div>
                      <span className={`badge-status ${statusCls[selectedPesanan.status]}`} style={{ marginTop: 4, display: 'inline-block' }}>
                        {statusLabels[selectedPesanan.status]}
                      </span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div style={{ background: 'var(--gray-100)', borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>Pembayaran</div>
                      <span className={`badge-status ${pembayaranCls[selectedPesanan.payment?.status] || 'badge-belum_bayar'}`} style={{ marginTop: 4, display: 'inline-block' }}>
                        {selectedPesanan.payment?.status || 'UNPAID'}
                      </span>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-2">Item Pesanan</h6>
                {selectedPesanan.items?.map(item => (
                  <div key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ fontSize: '0.875rem' }}>
                    <div>
                      <span>{item.menu?.name} × {item.quantity}</span>
                      {item.notes && <div className="text-muted" style={{ fontSize: '0.75rem' }}>Catatan: {item.notes}</div>}
                    </div>
                    <span style={{ fontWeight: 600 }}>{formatRp(item.subtotal)}</span>
                  </div>
                ))}
                
                {selectedPesanan.serviceType === 'DELIVERY' && (
                  <div className="mt-3 p-3 bg-light rounded">
                    <h6 className="fw-bold mb-1">Info Pengiriman</h6>
                    <div style={{ fontSize: '0.875rem' }}>
                      <div>Penerima: {selectedPesanan.customer?.name} ({selectedPesanan.deliveryPhone})</div>
                      <div>Alamat: {selectedPesanan.deliveryAddress}</div>
                      {selectedPesanan.deliveryNote && <div>Catatan: {selectedPesanan.deliveryNote}</div>}
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-between mt-3 pt-2">
                  <strong>Total Pembayaran</strong>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{formatRp(selectedPesanan.totalAmount)}</strong>
                </div>

                <div className="mt-4 row g-2">
                  <div className="col-12">
                    <label className="form-label-custom">Update Status Pesanan</label>
                    <select className="form-select form-control-custom" value={selectedPesanan.status}
                      onChange={e => { updateStatus(selectedPesanan.id, 'status', e.target.value); }}>
                      {statusPesananList.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetail(false)}>Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PesananPage;


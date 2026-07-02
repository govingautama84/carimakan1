import { useState } from 'react';
import { pesananAPI } from '../../services/api';
import { MdAssessment, MdSearch } from 'react-icons/md';
import Swal from 'sweetalert2';

const formatRp = (v) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;

const LaporanPage = () => {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLaporan = async (start = startDate, end = endDate) => {
    if (!start || !end) {
      return Swal.fire({ icon: 'warning', title: 'Peringatan', text: 'Pilih tanggal mulai dan akhir.', confirmButtonColor: '#7B1A1A' });
    }
    if (start > end) {
      return Swal.fire({ icon: 'warning', title: 'Peringatan', text: 'Tanggal mulai tidak boleh lebih dari tanggal akhir.', confirmButtonColor: '#7B1A1A' });
    }
    setLoading(true);
    try {
      const res = await pesananAPI.getLaporan({ startDate: start, endDate: end });
      const { payments, summary } = res.data.data;
      
      // Group by day
      const grouped = payments.reduce((acc, p) => {
        const date = new Date(p.createdAt).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = { tanggal: date, total_pesanan: 0, pesanan_lunas: 0, total_pendapatan: 0 };
        acc[date].total_pesanan += 1;
        if (p.status === 'SUCCESS') {
          acc[date].pesanan_lunas += 1;
          acc[date].total_pendapatan += Number(p.amount);
        }
        return acc;
      }, {});

      const groupedArray = Object.values(grouped).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

      setLaporan({
        summary: {
          total_pendapatan: summary.totalRevenue,
          total_pesanan: summary.totalTransactions
        },
        laporan: groupedArray
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Gagal memuat laporan.', confirmButtonColor: '#7B1A1A' });
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--dark)', marginBottom: 4 }}>Laporan Penjualan</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', margin: 0 }}>Analisis pendapatan berdasarkan periode</p>
      </div>

      {/* Filter */}
      <div className="admin-card mb-4">
        <div className="admin-card-header">
          <h5 className="admin-card-title">📅 Filter Periode</h5>
        </div>
        <div className="admin-card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label-custom">Tanggal Mulai</label>
              <input type="date" className="form-control-custom" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label-custom">Tanggal Akhir</label>
              <input type="date" className="form-control-custom" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div className="col-md-4">
              <button className="btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-2" onClick={() => fetchLaporan()} disabled={loading}>
                {loading ? <><div className="spinner-border spinner-border-sm" /> Memuat...</> : <><MdSearch size={18} /> Tampilkan Laporan</>}
              </button>
            </div>
          </div>

          {/* Quick Ranges */}
          <div className="d-flex gap-2 flex-wrap mt-3">
            {[
              { label: 'Hari Ini', start: today, end: today },
              { label: 'Minggu Ini', start: (() => {
                  const d = new Date();
                  const mon = new Date(d);
                  mon.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
                  return mon.toISOString().split('T')[0];
                })(), end: today },
              { label: 'Bulan Ini', start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], end: today }
            ].map(b => (
              <button key={b.label} className="btn btn-sm btn-outline-secondary" onClick={() => {
                setStartDate(b.start);
                setEndDate(b.end);
                fetchLaporan(b.start, b.end);
              }}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {laporan && (
        <>
          {/* Summary Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="stat-card success">
                <div className="stat-icon success"><MdAssessment /></div>
                <div className="stat-value" style={{ fontSize: '1.6rem' }}>{formatRp(laporan.summary.total_pendapatan)}</div>
                <div className="stat-label">Total Pendapatan</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="stat-card primary">
                <div className="stat-icon primary"><MdAssessment /></div>
                <div className="stat-value">{laporan.summary.total_pesanan}</div>
                <div className="stat-label">Total Pesanan</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h5 className="admin-card-title">📊 Rincian per Hari</h5>
            </div>
            {laporan.laporan.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><MdAssessment /></div>
                <h5>Tidak ada data</h5>
                <p>Tidak ada pesanan pada periode ini</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Total Transaksi</th>
                      <th>Transaksi Lunas</th>
                      <th>Total Pendapatan</th>
                      <th>Rata-rata per Transaksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laporan.laporan.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>
                          {new Date(row.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
                        </td>
                        <td><span className="badge bg-light text-dark">{row.total_pesanan}</span></td>
                        <td><span className="badge" style={{ background: '#d1e7dd', color: '#0f5132' }}>{row.pesanan_lunas}</span></td>
                        <td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatRp(row.total_pendapatan)}</td>
                        <td style={{ color: 'var(--gray-500)' }}>
                          {row.total_pesanan > 0 ? formatRp(row.total_pendapatan / row.total_pesanan) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'var(--gray-100)', fontWeight: 700 }}>
                      <td>TOTAL</td>
                      <td>{laporan.summary.total_pesanan}</td>
                      <td>{laporan.laporan.reduce((s, r) => s + r.pesanan_lunas, 0)}</td>
                      <td style={{ color: 'var(--success)' }}>{formatRp(laporan.summary.total_pendapatan)}</td>
                      <td style={{ color: 'var(--gray-500)' }}>
                        {laporan.summary.total_pesanan > 0
                          ? formatRp(laporan.summary.total_pendapatan / laporan.summary.total_pesanan)
                          : '-'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LaporanPage;

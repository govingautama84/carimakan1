import { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button } from 'react-bootstrap';
import { reservasiAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { MdCheck, MdClose } from 'react-icons/md';

const AdminReservasiPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const res = await reservasiAPI.getAdminReservations();
      setReservations(res.data.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal memuat reservasi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await reservasiAPI.updateStatus(id, status);
      Swal.fire('Sukses', `Reservasi berhasil ${status}`, 'success');
      fetchReservations();
    } catch (err) {
      Swal.fire('Error', 'Gagal mengubah status reservasi', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'menunggu': return <Badge bg="warning">Menunggu</Badge>;
      case 'disetujui': return <Badge bg="success">Disetujui</Badge>;
      case 'ditolak': return <Badge bg="danger">Ditolak</Badge>;
      case 'selesai': return <Badge bg="info">Selesai</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) return <div>Memuat...</div>;

  return (
    <Container fluid>
      <h2 className="mb-4 fw-bold">Manajemen Reservasi Meja</h2>
      
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="py-3">Waktu Reservasi</th>
                <th className="py-3">Jumlah Orang</th>
                <th className="py-3">Catatan</th>
                <th className="py-3">Status</th>
                <th className="px-4 py-3 text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">Belum ada reservasi</td>
                </tr>
              ) : (
                reservations.map(res => (
                  <tr key={res.id} className="align-middle">
                    <td className="px-4 py-3">
                      <div className="fw-bold">{res.nama_pelanggan}</div>
                      <div className="text-muted small">{res.email_pelanggan}</div>
                    </td>
                    <td className="py-3">{new Date(res.waktu_reservasi).toLocaleString('id-ID')}</td>
                    <td className="py-3">{res.jumlah_orang} Orang</td>
                    <td className="py-3" style={{ maxWidth: '200px' }}>{res.catatan || '-'}</td>
                    <td className="py-3">{getStatusBadge(res.status)}</td>
                    <td className="px-4 py-3 text-end">
                      {res.status === 'menunggu' && (
                        <div className="d-flex gap-2 justify-content-end">
                          <Button variant="success" size="sm" onClick={() => handleUpdateStatus(res.id, 'disetujui')}>
                            <MdCheck /> Terima
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(res.id, 'ditolak')}>
                            <MdClose /> Tolak
                          </Button>
                        </div>
                      )}
                      {res.status === 'disetujui' && (
                        <Button variant="info" size="sm" onClick={() => handleUpdateStatus(res.id, 'selesai')}>
                          Tandai Selesai
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminReservasiPage;

const db = require('../config/database');
const crypto = require('crypto');

const getAllMeja = (req, res) => {
  db.all('SELECT * FROM meja ORDER BY nomor_meja ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error.' });
    res.json({ success: true, data: rows });
  });
};

const getMejaById = (req, res) => {
  db.get('SELECT * FROM meja WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error.' });
    if (!row) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan.' });
    res.json({ success: true, data: row });
  });
};

const getMejaByNomor = (req, res) => {
  db.get('SELECT * FROM meja WHERE nomor_meja = ?', [req.params.nomor], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error.' });
    if (!row) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan.' });
    res.json({ success: true, data: row });
  });
};

const createMeja = (req, res) => {
  const { nomor_meja } = req.body;
  if (!nomor_meja) return res.status(400).json({ success: false, message: 'Nomor meja wajib diisi.' });

  const qr_code = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/table/${nomor_meja}`;

  db.run(
    'INSERT INTO meja (nomor_meja, qr_code, status) VALUES (?, ?, ?)',
    [nomor_meja, qr_code, 'tersedia'],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ success: false, message: 'Nomor meja sudah ada.' });
        }
        return res.status(500).json({ success: false, message: 'Gagal menambah meja.' });
      }
      res.status(201).json({
        success: true,
        message: 'Meja berhasil ditambahkan.',
        data: { id: this.lastID, nomor_meja, qr_code, status: 'tersedia' }
      });
    }
  );
};

const updateMeja = (req, res) => {
  const { nomor_meja, status } = req.body;
  const id = req.params.id;

  db.get('SELECT * FROM meja WHERE id = ?', [id], (err, existing) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error.' });
    if (!existing) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan.' });

    const newNomor = nomor_meja || existing.nomor_meja;
    const newStatus = status || existing.status;
    const newQr = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/table/${newNomor}`;

    db.run(
      'UPDATE meja SET nomor_meja = ?, status = ?, qr_code = ? WHERE id = ?',
      [newNomor, newStatus, newQr, id],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ success: false, message: 'Nomor meja sudah ada.' });
          }
          return res.status(500).json({ success: false, message: 'Gagal mengubah meja.' });
        }
        res.json({ success: true, message: 'Meja berhasil diubah.' });
      }
    );
  });
};

const deleteMeja = (req, res) => {
  db.run('DELETE FROM meja WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: 'Gagal menghapus meja.' });
    if (this.changes === 0) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan.' });
    res.json({ success: true, message: 'Meja berhasil dihapus.' });
  });
};

const generateQRCode = (req, res) => {
  db.get('SELECT * FROM meja WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error.' });
    if (!row) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan.' });

    const qr_code = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/table/${row.nomor_meja}`;
    db.run('UPDATE meja SET qr_code = ? WHERE id = ?', [qr_code, row.id], (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Gagal generate QR Code.' });
      res.json({ success: true, message: 'QR Code berhasil di-generate.', data: { qr_code } });
    });
  });
};

module.exports = { getAllMeja, getMejaById, getMejaByNomor, createMeja, updateMeja, deleteMeja, generateQRCode };

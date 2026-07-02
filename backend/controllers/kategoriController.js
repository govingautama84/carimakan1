const db = require('../config/database');

const getAllKategori = (req, res) => {
  db.all('SELECT * FROM kategori_menu ORDER BY nama ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error.' });
    res.json({ success: true, data: rows });
  });
};

const getKategoriById = (req, res) => {
  db.get('SELECT * FROM kategori_menu WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error.' });
    if (!row) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
    res.json({ success: true, data: row });
  });
};

const createKategori = (req, res) => {
  const { nama } = req.body;
  if (!nama) return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi.' });

  db.run('INSERT INTO kategori_menu (nama) VALUES (?)', [nama], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ success: false, message: 'Nama kategori sudah ada.' });
      }
      return res.status(500).json({ success: false, message: 'Gagal menambah kategori.' });
    }
    res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan.', data: { id: this.lastID, nama } });
  });
};

const updateKategori = (req, res) => {
  const { nama } = req.body;
  if (!nama) return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi.' });

  db.run('UPDATE kategori_menu SET nama = ? WHERE id = ?', [nama, req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: 'Gagal mengubah kategori.' });
    if (this.changes === 0) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
    res.json({ success: true, message: 'Kategori berhasil diubah.', data: { id: req.params.id, nama } });
  });
};

const deleteKategori = (req, res) => {
  db.run('DELETE FROM kategori_menu WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: 'Gagal menghapus kategori.' });
    if (this.changes === 0) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
    res.json({ success: true, message: 'Kategori berhasil dihapus.' });
  });
};

module.exports = { getAllKategori, getKategoriById, createKategori, updateKategori, deleteKategori };

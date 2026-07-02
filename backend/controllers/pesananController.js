const db = require('../config/database');

// Generate unique order number
const generateNomorPesanan = () => {
  const now = new Date();
  const dateStr = now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `ORD-${dateStr}-${random}`;
};

const getAllPesanan = (req, res) => {
  const { status_pesanan, status_pembayaran, date } = req.query;
  const { id: userId, role } = req.user;

  // Find admin's restaurant if role is admin_resto
  const getRestoranQuery = role === 'admin_resto' 
    ? new Promise((resolve, reject) => {
        db.get('SELECT id FROM restoran WHERE user_id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.id : null);
        });
      })
    : Promise.resolve(null);

  getRestoranQuery.then(restoranId => {
    let query = `
      SELECT p.*, m.nomor_meja, r.nama as nama_restoran
      FROM pesanan p
      LEFT JOIN meja m ON p.meja_id = m.id
      LEFT JOIN restoran r ON p.restoran_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (role === 'admin_resto' && restoranId) {
      query += ' AND p.restoran_id = ?';
      params.push(restoranId);
    }

    if (status_pesanan) {
      query += ' AND p.status_pesanan = ?';
      params.push(status_pesanan);
    }
    if (status_pembayaran) {
      query += ' AND p.status_pembayaran = ?';
      params.push(status_pembayaran);
    }
    if (date) {
      query += ' AND DATE(p.created_at) = ?';
      params.push(date);
    }

    query += ' ORDER BY p.created_at DESC';

    db.all(query, params, (err, pesananList) => {
      if (err) return res.status(500).json({ success: false, message: 'Server error.' });

      if (pesananList.length === 0) return res.json({ success: true, data: [] });

      // Get detail for each pesanan
      const promises = pesananList.map(
        (p) =>
          new Promise((resolve, reject) => {
            db.all(
              `SELECT dp.*, mn.nama_menu, mn.gambar
               FROM detail_pesanan dp
               JOIN menu mn ON dp.menu_id = mn.id
               WHERE dp.pesanan_id = ?`,
              [p.id],
              (err, details) => {
                if (err) reject(err);
                else resolve({ ...p, items: details });
              }
            );
          })
      );

      Promise.all(promises)
        .then((data) => res.json({ success: true, data }))
        .catch(() => res.status(500).json({ success: false, message: 'Server error.' }));
    });
  }).catch(() => res.status(500).json({ success: false, message: 'Server error.' }));
};

const getPesananByNomor = (req, res) => {
  db.get(
    `SELECT p.*, m.nomor_meja FROM pesanan p JOIN meja m ON p.meja_id = m.id WHERE p.nomor_pesanan = ?`,
    [req.params.nomor],
    (err, pesanan) => {
      if (err) return res.status(500).json({ success: false, message: 'Server error.' });
      if (!pesanan) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });

      db.all(
        `SELECT dp.*, mn.nama_menu, mn.gambar
         FROM detail_pesanan dp
         JOIN menu mn ON dp.menu_id = mn.id
         WHERE dp.pesanan_id = ?`,
        [pesanan.id],
        (err, details) => {
          if (err) return res.status(500).json({ success: false, message: 'Server error.' });
          res.json({ success: true, data: { ...pesanan, items: details } });
        }
      );
    }
  );
};

const getPesananById = (req, res) => {
  db.get(
    `SELECT p.*, m.nomor_meja FROM pesanan p JOIN meja m ON p.meja_id = m.id WHERE p.id = ?`,
    [req.params.id],
    (err, pesanan) => {
      if (err) return res.status(500).json({ success: false, message: 'Server error.' });
      if (!pesanan) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });

      db.all(
        `SELECT dp.*, mn.nama_menu, mn.gambar
         FROM detail_pesanan dp
         JOIN menu mn ON dp.menu_id = mn.id
         WHERE dp.pesanan_id = ?`,
        [pesanan.id],
        (err, details) => {
          if (err) return res.status(500).json({ success: false, message: 'Server error.' });
          res.json({ success: true, data: { ...pesanan, items: details } });
        }
      );
    }
  );
};

const createPesanan = (req, res) => {
  const { meja_id, restoran_id, items, metode_pembayaran, tipe_pesanan, alamat_pengiriman, user_id } = req.body;

  if (!restoran_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'restoran_id dan items wajib diisi.' });
  }

  const validMetode = ['qris', 'kasir', 'transfer'];
  if (!validMetode.includes(metode_pembayaran)) {
    return res.status(400).json({ success: false, message: 'Metode pembayaran tidak valid.' });
  }

  const validTipe = ['delivery', 'pickup', 'dine_in'];
  const tipe = tipe_pesanan || 'dine_in';
  
  if (!validTipe.includes(tipe)) {
    return res.status(400).json({ success: false, message: 'Tipe pesanan tidak valid.' });
  }

  if (tipe === 'delivery' && !alamat_pengiriman) {
    return res.status(400).json({ success: false, message: 'Alamat pengiriman wajib diisi untuk delivery.' });
  }

  // Get menu prices
  const menuIds = items.map((i) => i.menu_id);
  const placeholders = menuIds.map(() => '?').join(',');
  db.all(`SELECT id, harga, tersedia FROM menu WHERE id IN (${placeholders})`, menuIds, (err, menuRows) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error.' });

    const menuMap = {};
    menuRows.forEach((m) => (menuMap[m.id] = m));

    // Validate all menu items
    for (const item of items) {
      if (!menuMap[item.menu_id]) {
        return res.status(400).json({ success: false, message: `Menu ID ${item.menu_id} tidak ditemukan.` });
      }
      if (!menuMap[item.menu_id].tersedia) {
        return res.status(400).json({ success: false, message: `Menu tidak tersedia saat ini.` });
      }
    }

    const nomor_pesanan = generateNomorPesanan();
    let total_harga = 0;
    const detailItems = items.map((item) => {
      const harga = menuMap[item.menu_id].harga;
      const subtotal = harga * item.jumlah;
      total_harga += subtotal;
      return { menu_id: item.menu_id, jumlah: item.jumlah, harga, subtotal };
    });

    const finalUserId = user_id || null;
    const finalMejaId = tipe === 'dine_in' ? meja_id : null;

    db.run(
      'INSERT INTO pesanan (nomor_pesanan, restoran_id, user_id, meja_id, tipe_pesanan, alamat_pengiriman, total_harga, metode_pembayaran, status_pembayaran, status_pesanan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nomor_pesanan, restoran_id, finalUserId, finalMejaId, tipe, alamat_pengiriman || null, total_harga, metode_pembayaran, 'belum_bayar', 'menunggu'],
      function (err) {
        if (err) return res.status(500).json({ success: false, message: 'Gagal membuat pesanan.' });

        const pesanan_id = this.lastID;
        const stmt = db.prepare(
          'INSERT INTO detail_pesanan (pesanan_id, menu_id, jumlah, harga, subtotal) VALUES (?, ?, ?, ?, ?)'
        );
        detailItems.forEach((item) => {
          stmt.run([pesanan_id, item.menu_id, item.jumlah, item.harga, item.subtotal]);
        });
        stmt.finalize((err) => {
          if (err) return res.status(500).json({ success: false, message: 'Gagal menyimpan detail pesanan.' });

          // Update meja status if dine in
          if (tipe === 'dine_in' && meja_id) {
            db.run('UPDATE meja SET status = ? WHERE id = ?', ['terisi', meja_id]);
          }

          res.status(201).json({
            success: true,
            message: 'Pesanan berhasil dibuat.',
            data: { pesanan_id, nomor_pesanan, total_harga, metode_pembayaran, tipe_pesanan: tipe }
          });
        });
      }
    );
  });
};

const updateStatusPesanan = (req, res) => {
  const { status_pesanan, status_pembayaran } = req.body;
  const id = req.params.id;

  const validStatusPesanan = ['menunggu', 'diproses', 'siap_diantar', 'selesai'];
  const validStatusPembayaran = ['belum_bayar', 'lunas'];

  if (status_pesanan && !validStatusPesanan.includes(status_pesanan)) {
    return res.status(400).json({ success: false, message: 'Status pesanan tidak valid.' });
  }
  if (status_pembayaran && !validStatusPembayaran.includes(status_pembayaran)) {
    return res.status(400).json({ success: false, message: 'Status pembayaran tidak valid.' });
  }

  db.get('SELECT * FROM pesanan WHERE id = ?', [id], (err, pesanan) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error.' });
    if (!pesanan) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });

    const newStatusPesanan = status_pesanan || pesanan.status_pesanan;
    const newStatusPembayaran = status_pembayaran || pesanan.status_pembayaran;

    db.run(
      'UPDATE pesanan SET status_pesanan = ?, status_pembayaran = ? WHERE id = ?',
      [newStatusPesanan, newStatusPembayaran, id],
      function (err) {
        if (err) return res.status(500).json({ success: false, message: 'Gagal mengubah status pesanan.' });

        // If selesai, update table status back to tersedia
        if (newStatusPesanan === 'selesai') {
          db.run('UPDATE meja SET status = ? WHERE id = ?', ['tersedia', pesanan.meja_id]);
        }

        res.json({ success: true, message: 'Status pesanan berhasil diubah.' });
      }
    );
  });
};

const deletePesanan = (req, res) => {
  db.run('DELETE FROM pesanan WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: 'Gagal menghapus pesanan.' });
    if (this.changes === 0) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    res.json({ success: true, message: 'Pesanan berhasil dihapus.' });
  });
};

const getDashboard = (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const { id: userId, role } = req.user;

  const getRestoranQuery = role === 'admin_resto' 
    ? new Promise((resolve, reject) => {
        db.get('SELECT id FROM restoran WHERE user_id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.id : null);
        });
      })
    : Promise.resolve(null);

  getRestoranQuery.then(restoranId => {
    let whereClauseMenu = 'WHERE 1=1';
    let whereClausePesanan = 'WHERE 1=1';
    let paramsMenu = [];
    let paramsPesanan = [];

    if (role === 'admin_resto' && restoranId) {
      whereClauseMenu += ' AND restoran_id = ?';
      whereClausePesanan += ' AND restoran_id = ?';
      paramsMenu.push(restoranId);
      paramsPesanan.push(restoranId);
    }

    const queries = {
      totalMenu: `SELECT COUNT(*) as count FROM menu ${whereClauseMenu}`,
      totalPesanan: `SELECT COUNT(*) as count FROM pesanan ${whereClausePesanan}`,
      pendapatanHariIni: `SELECT COALESCE(SUM(total_harga), 0) as total FROM pesanan ${whereClausePesanan} AND DATE(created_at) = ? AND status_pembayaran = 'lunas'`,
      pesananHariIni: `SELECT COUNT(*) as count FROM pesanan ${whereClausePesanan} AND DATE(created_at) = ?`,
      pesananTerbaru: `SELECT p.*, m.nomor_meja, r.nama as nama_restoran FROM pesanan p LEFT JOIN meja m ON p.meja_id = m.id LEFT JOIN restoran r ON p.restoran_id = r.id ${whereClausePesanan.replace('restoran_id', 'p.restoran_id')} ORDER BY p.created_at DESC LIMIT 5`
    };

    Promise.all([
      new Promise((resolve, reject) => db.get(queries.totalMenu, paramsMenu, (err, r) => err ? reject(err) : resolve(r))),
      new Promise((resolve, reject) => db.get(queries.totalPesanan, paramsPesanan, (err, r) => err ? reject(err) : resolve(r))),
      new Promise((resolve, reject) => db.get(queries.pendapatanHariIni, [...paramsPesanan, today], (err, r) => err ? reject(err) : resolve(r))),
      new Promise((resolve, reject) => db.get(queries.pesananHariIni, [...paramsPesanan, today], (err, r) => err ? reject(err) : resolve(r))),
      new Promise((resolve, reject) => db.all(queries.pesananTerbaru, paramsPesanan, (err, r) => err ? reject(err) : resolve(r)))
    ])
      .then(([totalMenu, totalPesanan, pendapatanHariIni, pesananHariIni, pesananTerbaru]) => {
        res.json({
          success: true,
          data: {
            total_menu: totalMenu.count,
            total_pesanan: totalPesanan.count,
            pendapatan_hari_ini: pendapatanHariIni.total,
            pesanan_hari_ini: pesananHariIni.count,
            pesanan_terbaru: pesananTerbaru
          }
        });
      })
      .catch(() => res.status(500).json({ success: false, message: 'Server error.' }));
  }).catch(() => res.status(500).json({ success: false, message: 'Server error.' }));
};

const getLaporan = (req, res) => {
  const { start_date, end_date } = req.query;
  const { id: userId, role } = req.user;

  if (!start_date || !end_date) {
    return res.status(400).json({ success: false, message: 'start_date dan end_date wajib diisi.' });
  }

  const getRestoranQuery = role === 'admin_resto' 
    ? new Promise((resolve, reject) => {
        db.get('SELECT id FROM restoran WHERE user_id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.id : null);
        });
      })
    : Promise.resolve(null);

  getRestoranQuery.then(restoranId => {
    let whereClause = 'WHERE DATE(p.created_at) BETWEEN ? AND ?';
    let params = [start_date, end_date];

    if (role === 'admin_resto' && restoranId) {
      whereClause += ' AND p.restoran_id = ?';
      params.push(restoranId);
    }

    const query = `
      SELECT
        DATE(p.created_at) as tanggal,
        COUNT(p.id) as total_pesanan,
        COALESCE(SUM(p.total_harga), 0) as total_pendapatan,
        SUM(CASE WHEN p.status_pembayaran = 'lunas' THEN 1 ELSE 0 END) as pesanan_lunas
      FROM pesanan p
      ${whereClause}
      GROUP BY DATE(p.created_at)
      ORDER BY tanggal ASC
    `;

    db.all(query, params, (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: 'Server error.' });

      const totalPendapatan = rows.reduce((sum, r) => sum + r.total_pendapatan, 0);
      const totalPesanan = rows.reduce((sum, r) => sum + r.total_pesanan, 0);

      res.json({
        success: true,
        data: {
          laporan: rows,
          summary: { total_pesanan: totalPesanan, total_pendapatan: totalPendapatan }
        }
      });
    });
  }).catch(() => res.status(500).json({ success: false, message: 'Server error.' }));
};

module.exports = {
  getAllPesanan,
  getPesananByNomor,
  getPesananById,
  createPesanan,
  updateStatusPesanan,
  deletePesanan,
  getDashboard,
  getLaporan
};

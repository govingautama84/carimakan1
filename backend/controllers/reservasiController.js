const prisma = require('../config/database');

// Helper: cek apakah tanggal valid (H-1 sampai H-30 dari sekarang)
const isValidReservationDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  return targetDate >= tomorrow && targetDate <= maxDate;
};

// Customer: Buat reservasi
const createReservasi = async (req, res) => {
  const { restaurantId, reservationDate, reservationTime, guestCount, serviceType, notes } = req.body;
  const customerId = req.user.id;

  if (!restaurantId || !reservationDate || !reservationTime || !guestCount) {
    return res.status(400).json({ success: false, message: 'Restaurant, tanggal, jam, dan jumlah tamu wajib diisi.' });
  }

  if (!isValidReservationDate(reservationDate)) {
    return res.status(400).json({ success: false, message: 'Tanggal reservasi harus antara H-1 sampai H-30.' });
  }

  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: { id: parseInt(restaurantId), isVerified: true, status: true }
    });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restoran tidak ditemukan atau belum buka.' });
    }

    const reservation = await prisma.reservation.create({
      data: {
        customerId,
        restaurantId: parseInt(restaurantId),
        reservationDate: new Date(reservationDate),
        reservationTime,
        guestCount: parseInt(guestCount),
        serviceType: serviceType || 'DINE_IN',
        notes,
        status: 'PENDING'
      },
      include: {
        restaurant: { select: { name: true, address: true, logo: true } }
      }
    });

    // Notifikasi ke restoran via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${restaurantId}`).emit('new_reservation', {
        type: 'new_reservation',
        message: `Reservasi baru dari ${req.user.name} untuk ${guestCount} tamu`,
        reservation
      });
    }

    res.status(201).json({ success: true, message: 'Reservasi berhasil dibuat. Menunggu konfirmasi restoran.', data: reservation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal membuat reservasi.' });
  }
};

// Customer: Lihat riwayat reservasi
const getMyReservations = async (req, res) => {
  const customerId = req.user.id;
  try {
    const reservations = await prisma.reservation.findMany({
      where: { customerId },
      include: {
        restaurant: { select: { id: true, name: true, address: true, logo: true, phone: true } },
        table: true,
        orders: { select: { id: true, status: true, orderNumber: true, totalAmount: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: reservations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat reservasi.' });
  }
};

// Customer: Detail satu reservasi
const getReservationById = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;
  try {
    const reservation = await prisma.reservation.findFirst({
      where: { id: parseInt(id), customerId },
      include: {
        restaurant: { select: { id: true, name: true, address: true, logo: true, phone: true, openingTime: true, closingTime: true } },
        table: true,
        orders: {
          include: {
            items: { include: { menu: true } },
            payment: true
          }
        }
      }
    });
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan.' });
    }
    res.json({ success: true, data: reservation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Restoran: Lihat semua reservasi milik restoran
const getRestaurantReservations = async (req, res) => {
  const { status, date } = req.query;
  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { userId: req.user.id } });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restoran tidak ditemukan.' });

    const where = { restaurantId: restaurant.id };
    if (status) where.status = status;
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.reservationDate = { gte: targetDate, lt: nextDay };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true, profileImage: true } },
        table: true,
        orders: { select: { id: true, status: true, orderNumber: true } }
      },
      orderBy: [{ reservationDate: 'asc' }, { reservationTime: 'asc' }]
    });
    res.json({ success: true, data: reservations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil reservasi.' });
  }
};

// Restoran: Update status reservasi (ACCEPTED/REJECTED/COMPLETED)
const updateReservationStatus = async (req, res) => {
  const { id } = req.params;
  const { status, tableId, rejectionReason } = req.body;

  const validStatuses = ['ACCEPTED', 'REJECTED', 'COMPLETED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Status tidak valid.' });
  }

  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { userId: req.user.id } });
    if (!restaurant) return res.status(403).json({ success: false, message: 'Akses ditolak.' });

    const reservation = await prisma.reservation.findFirst({
      where: { id: parseInt(id), restaurantId: restaurant.id }
    });
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan.' });

    const updated = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: {
        status,
        tableId: tableId ? parseInt(tableId) : undefined,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null
      },
      include: { customer: { select: { id: true, name: true } } }
    });

    // Buat notifikasi untuk customer
    const notifMessage = status === 'ACCEPTED'
      ? `Reservasi Anda di ${restaurant.name} telah diterima!`
      : status === 'REJECTED'
      ? `Reservasi Anda di ${restaurant.name} ditolak. ${rejectionReason || ''}`
      : `Reservasi Anda di ${restaurant.name} telah selesai.`;

    await prisma.notification.create({
      data: {
        userId: reservation.customerId,
        title: `Reservasi ${status === 'ACCEPTED' ? 'Diterima' : status === 'REJECTED' ? 'Ditolak' : 'Selesai'}`,
        message: notifMessage
      }
    });

    // Emit Socket.IO ke customer
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${reservation.customerId}`).emit('reservation_update', {
        type: 'reservation_update',
        status,
        message: notifMessage,
        reservationId: parseInt(id)
      });
    }

    res.json({ success: true, message: 'Status reservasi berhasil diubah.', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status reservasi.' });
  }
};

// Admin: Lihat semua reservasi
const getAllReservationsAdmin = async (req, res) => {
  const { status, restaurantId, date } = req.query;
  try {
    const where = {};
    if (status) where.status = status;
    if (restaurantId) where.restaurantId = parseInt(restaurantId);
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.reservationDate = { gte: targetDate, lt: nextDay };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        restaurant: { select: { id: true, name: true } },
        table: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: reservations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createReservasi,
  getMyReservations,
  getReservationById,
  getRestaurantReservations,
  updateReservationStatus,
  getAllReservationsAdmin
};

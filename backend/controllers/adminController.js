const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

// ---- USER MANAGEMENT ----

// Semua user
const getAllUsers = async (req, res) => {
  const { role, search } = req.query;
  try {
    const where = {};
    if (role) where.role = role;
    if (search) where.OR = [
      { name: { contains: search } },
      { email: { contains: search } }
    ];

    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, phone: true, role: true, profileImage: true, createdAt: true, restaurant: { select: { id: true, name: true, isVerified: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Detail user
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, name: true, email: true, phone: true, role: true, profileImage: true, address: true, createdAt: true, restaurant: true, _count: { select: { reservations: true, orders: true, reviews: true } } }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Edit user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email, phone, role },
      select: { id: true, name: true, email: true, phone: true, role: true }
    });
    res.json({ success: true, message: 'User berhasil diperbarui.', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui user.' });
  }
};

// Hapus user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'User berhasil dihapus.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menghapus user.' });
  }
};

// ---- RESTAURANT MANAGEMENT ----

// Semua restoran (admin)
const getAllRestaurantsAdmin = async (req, res) => {
  const { search, isVerified } = req.query;
  try {
    const where = {};
    if (search) where.name = { contains: search };
    if (isVerified !== undefined) where.isVerified = isVerified === 'true';

    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        _count: { select: { menus: true, reservations: true, orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: restaurants });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Verifikasi / suspend restoran
const updateRestaurantStatus = async (req, res) => {
  const { id } = req.params;
  const { isVerified, status } = req.body;
  try {
    const data = {};
    if (isVerified !== undefined) data.isVerified = isVerified === true || isVerified === 'true';
    if (status !== undefined) data.status = status === true || status === 'true';

    const updated = await prisma.restaurant.update({ where: { id: parseInt(id) }, data });
    res.json({ success: true, message: 'Status restoran berhasil diubah.', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status restoran.' });
  }
};

// Hapus restoran
const deleteRestaurant = async (req, res) => {
  const { id } = req.params;
  try {
    const resto = await prisma.restaurant.findUnique({ where: { id: parseInt(id) } });
    if (!resto) return res.status(404).json({ success: false, message: 'Restoran tidak ditemukan.' });
    await prisma.user.delete({ where: { id: resto.userId } });
    res.json({ success: true, message: 'Restoran berhasil dihapus.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menghapus restoran.' });
  }
};

// ---- DASHBOARD STATISTIK ----

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCustomers, totalRestaurants, totalVerifiedRestaurants,
      totalReservations, totalOrders, successPayments,
      recentOrders, recentRestaurants
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.restaurant.count(),
      prisma.restaurant.count({ where: { isVerified: true } }),
      prisma.reservation.count(),
      prisma.order.count(),
      prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true }, _count: true }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true } },
          restaurant: { select: { name: true } },
          payment: { select: { status: true, amount: true } }
        }
      }),
      prisma.restaurant.findMany({
        take: 5,
        where: { isVerified: false },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Revenue per bulan (6 bulan terakhir)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: { status: 'SUCCESS', createdAt: { gte: sixMonthsAgo } },
      _sum: { amount: true }
    });

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalRestaurants,
        totalVerifiedRestaurants,
        pendingRestaurants: totalRestaurants - totalVerifiedRestaurants,
        totalReservations,
        totalOrders,
        totalRevenue: successPayments._sum.amount || 0,
        totalTransactions: successPayments._count,
        recentOrders,
        pendingRestaurantsList: recentRestaurants,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Laporan penjualan admin
const getSalesReport = async (req, res) => {
  const { startDate, endDate, restaurantId } = req.query;
  try {
    const where = { status: 'SUCCESS' };
    if (startDate && endDate) {
      where.createdAt = { gte: new Date(startDate), lte: new Date(endDate + 'T23:59:59') };
    }
    if (restaurantId) {
      where.order = { restaurantId: parseInt(restaurantId) };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        order: {
          include: {
            restaurant: { select: { name: true } },
            customer: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    res.json({
      success: true,
      data: { payments, summary: { totalRevenue, totalTransactions: payments.length } }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getAllUsers, getUserById, updateUser, deleteUser,
  getAllRestaurantsAdmin, updateRestaurantStatus, deleteRestaurant,
  getDashboardStats, getSalesReport
};

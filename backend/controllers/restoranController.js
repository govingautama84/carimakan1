const prisma = require('../config/database');

// Customer Actions
const getAllRestoran = async (req, res) => {
  const { search, location, rating } = req.query;
  try {
    const where = { isVerified: true };
    
    if (search) {
      where.name = { contains: search };
    }
    
    if (location) {
      where.address = { contains: location };
    }

    let restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        reviews: {
          select: { rating: true }
        }
      }
    });

    // Calculate rating dynamically and filter if rating specified
    restaurants = restaurants.map(resto => {
      const totalReviews = resto.reviews.length;
      const averageRating = totalReviews > 0 
        ? resto.reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews 
        : 0;
      return {
        ...resto,
        rating: parseFloat(averageRating.toFixed(1))
      };
    });

    if (rating) {
      const targetRating = parseFloat(rating);
      restaurants = restaurants.filter(resto => resto.rating >= targetRating);
    }

    res.json({ success: true, data: restaurants });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data restoran.' });
  }
};

const getRestoranById = async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(id) },
      include: {
        reviews: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restoran tidak ditemukan.' });
    }

    const totalReviews = restaurant.reviews.length;
    const averageRating = totalReviews > 0 
      ? restaurant.reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews 
      : 0;

    res.json({ 
      success: true, 
      data: {
        ...restaurant,
        rating: parseFloat(averageRating.toFixed(1))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail restoran.' });
  }
};

const getMenuByRestoran = async (req, res) => {
  const { id } = req.params;
  try {
    const menus = await prisma.menu.findMany({
      where: { 
        restaurantId: parseInt(id),
        isAvailable: true
      }
    });
    res.json({ success: true, data: menus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil menu restoran.' });
  }
};

// Restaurant Owner Actions
const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: req.user.id }
    });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Profil restoran belum dibuat.' });
    }
    res.json({ success: true, data: restaurant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateMyRestaurant = async (req, res) => {
  const { name, description, address, phone, openingTime, closingTime, status } = req.body;
  const logo = req.file ? req.file.path : undefined;

  try {
    const existing = await prisma.restaurant.findUnique({
      where: { userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Profil restoran tidak ditemukan.' });
    }

    const updated = await prisma.restaurant.update({
      where: { userId: req.user.id },
      data: {
        name,
        description,
        address,
        phone,
        openingTime,
        closingTime,
        status: status !== undefined ? (status === 'true' || status === true) : undefined,
        logo: logo || undefined
      }
    });

    res.json({ success: true, message: 'Profil restoran berhasil diperbarui.', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui profil restoran.' });
  }
};

// Admin Actions
const getAllRestaurantsAdmin = async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    res.json({ success: true, data: restaurants });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const verifyRestaurant = async (req, res) => {
  const { id } = req.params;
  const { isVerified } = req.body;
  try {
    const updated = await prisma.restaurant.update({
      where: { id: parseInt(id) },
      data: { isVerified: isVerified === true || isVerified === 'true' }
    });
    res.json({ success: true, message: 'Status verifikasi restoran berhasil diubah.', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status verifikasi.' });
  }
};

const deleteRestaurantAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const resto = await prisma.restaurant.findUnique({ where: { id: parseInt(id) } });
    if (!resto) return res.status(404).json({ success: false, message: 'Restoran tidak ditemukan.' });
    
    // Delete user and associated restaurant cascade
    await prisma.user.delete({ where: { id: resto.userId } });
    res.json({ success: true, message: 'Restoran berhasil dihapus.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menghapus restoran.' });
  }
};

const getDashboardStatsAdmin = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalRestaurants = await prisma.restaurant.count();
    const totalReservations = await prisma.reservation.count();
    const totalOrders = await prisma.order.count();
    const totalTransactions = await prisma.payment.count({ where: { status: 'SUCCESS' } });
    
    const revenueSum = await prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalRestaurants,
        totalReservations,
        totalOrders,
        totalTransactions,
        totalRevenue: revenueSum._sum.amount || 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik admin.' });
  }
};

const getDashboardStatsRestaurant = async (req, res) => {
  try {
    const resto = await prisma.restaurant.findUnique({
      where: { userId: req.user.id }
    });
    if (!resto) {
      return res.status(404).json({ success: false, message: 'Restoran tidak ditemukan.' });
    }

    const totalReservations = await prisma.reservation.count({
      where: { restaurantId: resto.id }
    });
    
    const totalOrders = await prisma.order.count({
      where: { restaurantId: resto.id }
    });

    const activeOrders = await prisma.order.count({
      where: { 
        restaurantId: resto.id,
        status: { notIn: ['COMPLETED'] }
      }
    });

    const revenueSum = await prisma.payment.aggregate({
      where: { 
        order: { restaurantId: resto.id },
        status: 'SUCCESS' 
      },
      _sum: { amount: true }
    });

    res.json({
      success: true,
      data: {
        totalReservations,
        totalOrders,
        activeOrders,
        revenue: revenueSum._sum.amount || 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik restoran.' });
  }
};

module.exports = {
  getAllRestoran,
  getRestoranById,
  getMenuByRestoran,
  getMyRestaurant,
  updateMyRestaurant,
  getAllRestaurantsAdmin,
  verifyRestaurant,
  deleteRestaurantAdmin,
  getDashboardStatsAdmin,
  getDashboardStatsRestaurant
};

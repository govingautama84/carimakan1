const prisma = require('../config/database');

// Customer: Buat review setelah pesanan selesai
const createReview = async (req, res) => {
  const { orderId, rating, comment } = req.body;
  const userId = req.user.id;
  const image = req.file ? req.file.path : null;

  if (!orderId || !rating) {
    return res.status(400).json({ success: false, message: 'Order ID dan rating wajib diisi.' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Rating harus antara 1–5.' });
  }

  try {
    const order = await prisma.order.findFirst({
      where: { id: parseInt(orderId), customerId: userId, status: 'COMPLETED' }
    });

    if (!order) {
      return res.status(400).json({ success: false, message: 'Pesanan tidak ditemukan atau belum selesai.' });
    }

    // Cek apakah sudah ada review
    const existing = await prisma.review.findUnique({ where: { orderId: parseInt(orderId) } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Anda sudah memberikan review untuk pesanan ini.' });
    }

    const review = await prisma.review.create({
      data: {
        orderId: parseInt(orderId),
        userId,
        restaurantId: order.restaurantId,
        rating: parseInt(rating),
        comment: comment || null,
        image
      },
      include: {
        user: { select: { name: true, profileImage: true } },
        restaurant: { select: { name: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Review berhasil dikirim. Terima kasih!', data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengirim review.' });
  }
};

// Public: Lihat semua review per restoran
const getRestaurantReviews = async (req, res) => {
  const { restaurantId } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { restaurantId: parseInt(restaurantId) },
      include: {
        user: { select: { name: true, profileImage: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        reviews,
        summary: { totalReviews, averageRating: parseFloat(avgRating) }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil review.' });
  }
};

// Customer: Review milik saya
const getMyReviews = async (req, res) => {
  const userId = req.user.id;
  try {
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        restaurant: { select: { name: true, logo: true } },
        order: { select: { orderNumber: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createReview, getRestaurantReviews, getMyReviews };

const prisma = require('../config/database');

// Customer: Buat atau update pembayaran
const createOrUpdatePayment = async (req, res) => {
  const { orderId, paymentMethod } = req.body;
  const customerId = req.user.id;

  const validMethods = ['QRIS', 'TRANSFER_BANK', 'E_WALLET', 'CASH'];
  if (!validMethods.includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: 'Metode pembayaran tidak valid.' });
  }

  try {
    const order = await prisma.order.findFirst({
      where: { id: parseInt(orderId), customerId }
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    // Update payment method dan set status VERIFYING (untuk non-cash)
    const newStatus = paymentMethod === 'CASH' ? 'VERIFYING' : 'VERIFYING';
    
    const payment = await prisma.payment.upsert({
      where: { orderId: parseInt(orderId) },
      update: {
        paymentMethod,
        status: newStatus
      },
      create: {
        orderId: parseInt(orderId),
        paymentMethod,
        amount: order.totalAmount,
        status: newStatus
      }
    });

    // Update order status ke VERIFIED setelah pembayaran disubmit
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: 'VERIFIED' }
    });

    res.json({ success: true, message: 'Pembayaran berhasil disubmit. Menunggu verifikasi.', data: payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal memproses pembayaran.' });
  }
};

// Restoran/Admin: Verifikasi pembayaran
const verifyPayment = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // SUCCESS or FAILED

  if (!['SUCCESS', 'FAILED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status tidak valid.' });
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: { order: { include: { customer: true, restaurant: true } } }
    });
    if (!payment) return res.status(404).json({ success: false, message: 'Pembayaran tidak ditemukan.' });

    // Jika role RESTAURANT, verifikasi kepemilikan
    if (req.user.role === 'RESTAURANT') {
      const resto = await prisma.restaurant.findUnique({ where: { userId: req.user.id } });
      if (!resto || resto.id !== payment.order.restaurantId) {
        return res.status(403).json({ success: false, message: 'Akses ditolak.' });
      }
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    // Update order status
    if (status === 'SUCCESS') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'ACCEPTED' }
      });

      // Generate invoice setelah pembayaran sukses
      const invoiceNumber = `INV-${Date.now()}-${payment.orderId}`;
      await prisma.invoice.upsert({
        where: { orderId: payment.orderId },
        update: { invoiceNumber },
        create: { orderId: payment.orderId, invoiceNumber }
      });

      // Notifikasi customer
      await prisma.notification.create({
        data: {
          userId: payment.order.customerId,
          title: 'Pembayaran Berhasil',
          message: `Pembayaran pesanan #${payment.order.orderNumber} telah berhasil dikonfirmasi.`
        }
      });

      // Emit Socket.IO
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${payment.order.customerId}`).emit('payment_verified', {
          type: 'payment_success',
          orderId: payment.orderId,
          orderNumber: payment.order.orderNumber,
          message: 'Pembayaran Anda telah dikonfirmasi!'
        });
      }
    } else {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CREATED' }
      });
    }

    res.json({ success: true, message: `Pembayaran berhasil ${status === 'SUCCESS' ? 'dikonfirmasi' : 'ditolak'}.`, data: updatedPayment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal memverifikasi pembayaran.' });
  }
};

// Customer/Restoran: Lihat detail pembayaran by order
const getPaymentByOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const payment = await prisma.payment.findUnique({
      where: { orderId: parseInt(orderId) },
      include: {
        order: {
          include: {
            customer: { select: { name: true, email: true } },
            restaurant: { select: { name: true, logo: true } },
            items: { include: { menu: { select: { name: true, price: true } } } }
          }
        }
      }
    });
    if (!payment) return res.status(404).json({ success: false, message: 'Data pembayaran tidak ditemukan.' });
    res.json({ success: true, data: payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin: Semua transaksi
const getAllPaymentsAdmin = async (req, res) => {
  const { status, startDate, endDate } = req.query;
  try {
    const where = {};
    if (status) where.status = status;
    if (startDate && endDate) {
      where.createdAt = { gte: new Date(startDate), lte: new Date(endDate + 'T23:59:59') };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        order: {
          include: {
            customer: { select: { name: true, email: true } },
            restaurant: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createOrUpdatePayment,
  verifyPayment,
  getPaymentByOrder,
  getAllPaymentsAdmin
};

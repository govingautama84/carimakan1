const prisma = require('../config/database');

// Generate unique order number
const generateOrderNumber = () => {
  const now = new Date();
  const dateStr = now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `CM-${dateStr}-${random}`;
};

// TAX rate 10%
const TAX_RATE = 0.10;
const DELIVERY_FEE = 15000;

// Customer: Buat order setelah reservasi diterima
const createOrder = async (req, res) => {
  const { 
    reservationId, restaurantId, serviceType, items,
    deliveryAddress, deliveryPhone, deliveryNote,
    pickupTime, tableId, notes
  } = req.body;
  const customerId = req.user.id;

  if (!restaurantId || !serviceType || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Restaurant, jenis layanan, dan item wajib diisi.' });
  }

  try {
    // Verifikasi reservasi jika ada
    if (reservationId) {
      const reservation = await prisma.reservation.findFirst({
        where: { id: parseInt(reservationId), customerId, status: 'ACCEPTED' }
      });
      if (!reservation) {
        return res.status(400).json({ success: false, message: 'Reservasi tidak ditemukan atau belum diterima.' });
      }
    }

    // Ambil data menu dan hitung harga
    const menuIds = items.map(i => parseInt(i.menuId));
    const menus = await prisma.menu.findMany({
      where: { id: { in: menuIds }, restaurantId: parseInt(restaurantId), isAvailable: true }
    });

    if (menus.length !== menuIds.length) {
      return res.status(400).json({ success: false, message: 'Beberapa menu tidak tersedia.' });
    }

    const menuMap = {};
    menus.forEach(m => { menuMap[m.id] = m; });

    let subtotal = 0;
    const orderItemsData = items.map(item => {
      const menu = menuMap[parseInt(item.menuId)];
      const price = parseFloat(menu.price);
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;
      return {
        menuId: parseInt(item.menuId),
        quantity: item.quantity,
        price,
        subtotal: itemSubtotal,
        notes: item.notes || null
      };
    });

    const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const deliveryFee = serviceType === 'DELIVERY' ? DELIVERY_FEE : 0;
    const totalAmount = parseFloat((subtotal + tax + deliveryFee).toFixed(2));

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        restaurantId: parseInt(restaurantId),
        reservationId: reservationId ? parseInt(reservationId) : null,
        serviceType,
        status: 'CREATED',
        totalAmount,
        tax,
        deliveryFee,
        deliveryAddress: serviceType === 'DELIVERY' ? deliveryAddress : null,
        deliveryPhone: serviceType === 'DELIVERY' ? deliveryPhone : null,
        deliveryNote: serviceType === 'DELIVERY' ? deliveryNote : null,
        pickupTime: serviceType === 'TAKE_AWAY' ? pickupTime : null,
        tableId: serviceType === 'DINE_IN' && tableId ? parseInt(tableId) : null,
        notes,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: { include: { menu: { select: { name: true, image: true } } } },
        restaurant: { select: { name: true, logo: true, address: true } },
        customer: { select: { name: true, email: true, phone: true } }
      }
    });

    // Buat pembayaran awal (UNPAID)
    await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: 'PENDING',
        amount: totalAmount,
        status: 'UNPAID'
      }
    });

    // Notifikasi ke restoran
    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${restaurantId}`).emit('new_order', {
        type: 'new_order',
        message: `Pesanan baru #${orderNumber} dari ${req.user.name}`,
        order: { id: order.id, orderNumber, totalAmount }
      });
    }

    // Notifikasi ke customer
    await prisma.notification.create({
      data: {
        userId: customerId,
        title: 'Pesanan Dibuat',
        message: `Pesanan #${orderNumber} berhasil dibuat. Menunggu konfirmasi restoran.`
      }
    });

    res.status(201).json({ success: true, message: 'Pesanan berhasil dibuat.', data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal membuat pesanan.' });
  }
};

// Customer: Riwayat pesanan
const getMyOrders = async (req, res) => {
  const customerId = req.user.id;
  const { status } = req.query;
  try {
    const where = { customerId };
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        restaurant: { select: { id: true, name: true, logo: true, address: true } },
        items: { include: { menu: { select: { name: true, image: true } } } },
        payment: true,
        review: { select: { id: true, rating: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat pesanan.' });
  }
};

// Customer + Restoran: Detail pesanan by ID
const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        restaurant: { select: { id: true, name: true, logo: true, address: true, phone: true } },
        customer: { select: { id: true, name: true, email: true, phone: true, profileImage: true } },
        items: { include: { menu: true } },
        payment: true,
        invoice: true,
        review: true,
        reservation: { select: { id: true, reservationDate: true, reservationTime: true, guestCount: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    // RBAC: hanya customer pemilik, restoran yg relevan, atau admin
    const userId = req.user.id;
    const role = req.user.role;
    if (role === 'CUSTOMER' && order.customerId !== userId) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }
    if (role === 'RESTAURANT') {
      const resto = await prisma.restaurant.findUnique({ where: { userId } });
      if (!resto || resto.id !== order.restaurantId) {
        return res.status(403).json({ success: false, message: 'Akses ditolak.' });
      }
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Customer: Cari order by order number
const getOrderByNumber = async (req, res) => {
  const { orderNumber } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        restaurant: { select: { id: true, name: true, logo: true, address: true, phone: true } },
        customer: { select: { id: true, name: true, phone: true } },
        items: { include: { menu: { select: { name: true, image: true, price: true } } } },
        payment: true,
        invoice: true
      }
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Restoran: Lihat pesanan restoran
const getRestaurantOrders = async (req, res) => {
  const { status } = req.query;
  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { userId: req.user.id } });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restoran tidak ditemukan.' });

    const where = { restaurantId: restaurant.id };
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true, profileImage: true } },
        items: { include: { menu: { select: { name: true, image: true } } } },
        payment: { select: { status: true, paymentMethod: true } },
        reservation: { select: { reservationDate: true, guestCount: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil pesanan.' });
  }
};

// Restoran: Update status pesanan
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['CREATED', 'VERIFIED', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Status tidak valid.' });
  }

  try {
    let order;
    if (req.user.role === 'ADMIN') {
      order = await prisma.order.findUnique({
        where: { id: parseInt(id) }
      });
    } else {
      const restaurant = await prisma.restaurant.findUnique({ where: { userId: req.user.id } });
      if (!restaurant) return res.status(403).json({ success: false, message: 'Akses ditolak.' });

      order = await prisma.order.findFirst({
        where: { id: parseInt(id), restaurantId: restaurant.id }
      });
    }

    if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });

    const updated = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { customer: { select: { id: true, name: true } }, restaurant: { select: { name: true } } }
    });

    // Jika selesai, update status reservasi
    if (status === 'COMPLETED' && order.reservationId) {
      await prisma.reservation.update({
        where: { id: order.reservationId },
        data: { status: 'COMPLETED' }
      });
    }

    // Pesan notifikasi berdasarkan status
    const statusMessages = {
      ACCEPTED: 'Pesanan Anda telah diterima oleh restoran.',
      PREPARING: 'Makanan Anda sedang disiapkan.',
      READY: order.serviceType === 'DELIVERY' ? 'Pesanan Anda siap untuk dikirim.' : 'Pesanan Anda siap diambil.',
      DELIVERING: 'Pesanan Anda sedang dalam perjalanan.',
      COMPLETED: 'Pesanan Anda telah selesai. Terima kasih!'
    };

    const notifMessage = `#${order.orderNumber}: ${statusMessages[status]}`;

    await prisma.notification.create({
      data: {
        userId: order.customerId,
        title: `Update Pesanan — ${status}`,
        message: notifMessage
      }
    });

    // Emit Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${order.customerId}`).emit('order_status_update', {
        type: 'order_update',
        orderId: parseInt(id),
        orderNumber: order.orderNumber,
        status,
        message: notifMessage
      });
    }

    res.json({ success: true, message: 'Status pesanan berhasil diubah.', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status pesanan.' });
  }
};

// Admin: Semua pesanan
const getAllOrdersAdmin = async (req, res) => {
  const { status, restaurantId, startDate, endDate } = req.query;
  try {
    const where = {};
    if (status) where.status = status;
    if (restaurantId) where.restaurantId = parseInt(restaurantId);
    if (startDate && endDate) {
      where.createdAt = { gte: new Date(startDate), lte: new Date(endDate + 'T23:59:59') };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        restaurant: { select: { id: true, name: true } },
        payment: { select: { status: true, paymentMethod: true, amount: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderByNumber,
  getRestaurantOrders,
  updateOrderStatus,
  getAllOrdersAdmin
};

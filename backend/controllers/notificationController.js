const prisma = require('../config/database');

// Dapatkan notifikasi user
const getMyNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    const unreadCount = notifications.filter(n => !n.isRead).length;
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Tandai satu notifikasi sebagai sudah dibaca
const markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const notif = await prisma.notification.findFirst({ where: { id: parseInt(id), userId } });
    if (!notif) return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan.' });

    await prisma.notification.update({ where: { id: parseInt(id) }, data: { isRead: true } });
    res.json({ success: true, message: 'Notifikasi ditandai sudah dibaca.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Tandai semua sebagai sudah dibaca
const markAllAsRead = async (req, res) => {
  const userId = req.user.id;
  try {
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    res.json({ success: true, message: 'Semua notifikasi ditandai sudah dibaca.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Helper: Buat notifikasi (dipakai internal)
const createNotification = async (userId, title, message, io = null) => {
  try {
    const notif = await prisma.notification.create({ data: { userId, title, message } });
    if (io) {
      io.to(`user_${userId}`).emit('notification', { type: 'notification', ...notif });
    }
    return notif;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, createNotification };

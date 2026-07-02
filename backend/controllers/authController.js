const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'CUSTOMER'
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Registrasi berhasil. Silakan login.' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal melakukan registrasi.' });
  }
};

const registerRestoran = async (req, res) => {
  const { name, email, password, phone, restaurantName, address, description, openingTime, closingTime } = req.body;
  if (!name || !email || !password || !restaurantName) {
    return res.status(400).json({ success: false, message: 'Nama pemilik, email, password, dan nama restoran wajib diisi.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Use transaction to create user and restaurant
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: 'RESTAURANT'
        }
      });

      const restaurant = await tx.restaurant.create({
        data: {
          userId: user.id,
          name: restaurantName,
          address,
          description,
          phone,
          openingTime: openingTime || '09:00',
          closingTime: closingTime || '22:00',
          isVerified: false // Admin must verify
        }
      });

      return { user, restaurant };
    });

    res.status(201).json({
      success: true,
      message: 'Pendaftaran restoran berhasil. Akun Anda sedang menunggu verifikasi admin.',
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mendaftarkan restoran.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
  }

  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { restaurant: true }
    });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    if (user.role === 'RESTAURANT' && user.restaurant && !user.restaurant.isVerified) {
      // Allow restaurant to login but maybe flag it or warn, let's keep it allowed but notify, or restrict?
      // The user spec says "Verifikasi akun restoran" by admin.
      // Let's allow login, but on frontend we can show warning if not verified.
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token,
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          restaurantId: user.restaurant ? user.restaurant.id : null,
          isVerified: user.restaurant ? user.restaurant.isVerified : true
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal melakukan login.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        restaurant: true
      }
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateProfile = async (req, res) => {
  const { name, phone } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone }
    });
    res.json({ success: true, message: 'Profil berhasil diperbarui.', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui profil.' });
  }
};

const changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  if (!old_password || !new_password) {
    return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password lama tidak sesuai.' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed }
    });

    res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengubah password.' });
  }
};

module.exports = { register, registerRestoran, login, getProfile, updateProfile, changePassword };

const prisma = require('../config/database');
const axios = require('axios');

// Restoran: Dapatkan semua menu milik restoran
const getMyMenus = async (req, res) => {
  const { category, available } = req.query;
  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { userId: req.user.id } });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restoran tidak ditemukan.' });

    const where = { restaurantId: restaurant.id };
    if (category) where.category = category;
    if (available !== undefined) where.isAvailable = available === 'true';

    const menus = await prisma.menu.findMany({ where, orderBy: [{ category: 'asc' }, { name: 'asc' }] });
    res.json({ success: true, data: menus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Public: Menu restoran berdasarkan ID
const getMenuByRestaurantId = async (req, res) => {
  const { restaurantId } = req.params;
  const { category } = req.query;
  try {
    const where = { restaurantId: parseInt(restaurantId), isAvailable: true };
    if (category) where.category = category;
    const menus = await prisma.menu.findMany({ where, orderBy: [{ category: 'asc' }, { name: 'asc' }] });
    res.json({ success: true, data: menus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Restoran: Tambah menu baru
const createMenu = async (req, res) => {
  const { name, description, price, category, stock, mealdbId } = req.body;
  const image = req.file ? req.file.path : (req.body.image || null);

  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Nama dan harga menu wajib diisi.' });
  }

  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { userId: req.user.id } });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restoran tidak ditemukan.' });

    const menu = await prisma.menu.create({
      data: {
        restaurantId: restaurant.id,
        name,
        description: description || null,
        price: parseFloat(price),
        image,
        category: category || 'Lainnya',
        stock: stock ? parseInt(stock) : 100,
        mealdbId: mealdbId || null,
        isAvailable: true
      }
    });

    res.status(201).json({ success: true, message: 'Menu berhasil ditambahkan.', data: menu });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menambah menu.' });
  }
};

// Restoran: Update menu
const updateMenu = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, stock, isAvailable } = req.body;
  const image = req.file ? req.file.path : undefined;

  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { userId: req.user.id } });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restoran tidak ditemukan.' });

    const existing = await prisma.menu.findFirst({ where: { id: parseInt(id), restaurantId: restaurant.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan.' });

    const updated = await prisma.menu.update({
      where: { id: parseInt(id) },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        price: price ? parseFloat(price) : undefined,
        category: category || undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        isAvailable: isAvailable !== undefined ? (isAvailable === 'true' || isAvailable === true) : undefined,
        image: image || undefined
      }
    });

    res.json({ success: true, message: 'Menu berhasil diperbarui.', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui menu.' });
  }
};

// Restoran: Hapus menu
const deleteMenu = async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { userId: req.user.id } });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restoran tidak ditemukan.' });

    const existing = await prisma.menu.findFirst({ where: { id: parseInt(id), restaurantId: restaurant.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan.' });

    await prisma.menu.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Menu berhasil dihapus.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menghapus menu.' });
  }
};

// Toggle ketersediaan menu
const toggleAvailability = async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { userId: req.user.id } });
    if (!restaurant) return res.status(403).json({ success: false, message: 'Akses ditolak.' });

    const menu = await prisma.menu.findFirst({ where: { id: parseInt(id), restaurantId: restaurant.id } });
    if (!menu) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan.' });

    const updated = await prisma.menu.update({
      where: { id: parseInt(id) },
      data: { isAvailable: !menu.isAvailable }
    });

    res.json({ success: true, message: `Menu ${updated.isAvailable ? 'diaktifkan' : 'dinonaktifkan'}.`, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Import menu dari TheMealDB
const importFromMealDB = async (req, res) => {
  const { category, price } = req.body;
  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { userId: req.user.id } });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restoran tidak ditemukan.' });

    const cat = category || 'Chicken';
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`);
    const meals = response.data.meals?.slice(0, 10) || [];

    const created = [];
    for (const meal of meals) {
      // Ambil detail meal untuk deskripsi
      const detailRes = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
      const detail = detailRes.data.meals?.[0];

      const existingMenu = await prisma.menu.findFirst({
        where: { restaurantId: restaurant.id, mealdbId: meal.idMeal }
      });
      if (existingMenu) continue;

      const menu = await prisma.menu.create({
        data: {
          restaurantId: restaurant.id,
          name: meal.strMeal,
          description: detail?.strInstructions?.substring(0, 200) || null,
          price: parseFloat(price || (Math.floor(Math.random() * 80) + 20) * 1000),
          image: meal.strMealThumb,
          category: cat,
          mealdbId: meal.idMeal,
          isAvailable: true
        }
      });
      created.push(menu);
    }

    res.json({ success: true, message: `${created.length} menu berhasil diimport dari TheMealDB.`, data: created });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal import dari TheMealDB.' });
  }
};

// Public: Daftar kategori TheMealDB
const getMealDBCategories = async (req, res) => {
  try {
    const response = await axios.get('https://www.themealdb.com/api/json/v1/1/categories.php');
    res.json({ success: true, data: response.data.categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil kategori.' });
  }
};

module.exports = {
  getMyMenus, getMenuByRestaurantId, createMenu, updateMenu,
  deleteMenu, toggleAvailability, importFromMealDB, getMealDBCategories
};

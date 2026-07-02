require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CariMakan+ database seed...\n');

  // ---- 1. Create Admin ----
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@carimakan.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@carimakan.com',
      password: adminPassword,
      phone: '081234567890',
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin created:', admin.email);

  // ---- 2. Create Restaurant Owners & Restaurants ----
  const restaurants = [
    {
      ownerName: 'Budi Santoso',
      email: 'warung.nusantara@carimakan.com',
      restaurantName: 'Warung Nusantara',
      description: 'Restoran masakan nusantara autentik dengan cita rasa rumahan yang khas.',
      address: 'Jl. Sudirman No. 45, Jakarta Pusat',
      city: 'Jakarta',
      phone: '021-5551234',
      openingTime: '08:00',
      closingTime: '22:00',
      category: 'Indonesian',
      capacity: 80,
      mealCategory: 'Chicken'
    },
    {
      ownerName: 'Siti Rahayu',
      email: 'sushi.express@carimakan.com',
      restaurantName: 'Sushi Express',
      description: 'Sushi dan makanan Jepang segar dengan bahan premium pilihan setiap hari.',
      address: 'Jl. Gatot Subroto No. 12, Jakarta Selatan',
      city: 'Jakarta',
      phone: '021-5559876',
      openingTime: '10:00',
      closingTime: '21:00',
      category: 'Japanese',
      capacity: 50,
      mealCategory: 'Seafood'
    },
    {
      ownerName: 'Ahmad Fauzi',
      email: 'pasta.roma@carimakan.com',
      restaurantName: 'Pasta Roma',
      description: 'Restoran Italia otentik dengan pasta handmade dan saus tomat segar.',
      address: 'Jl. Thamrin No. 7, Jakarta Pusat',
      city: 'Jakarta',
      phone: '021-5558765',
      openingTime: '11:00',
      closingTime: '22:00',
      category: 'Italian',
      capacity: 60,
      mealCategory: 'Pasta'
    },
    {
      ownerName: 'Dewi Kusuma',
      email: 'mie.goyang@carimakan.com',
      restaurantName: 'Mie Goyang Pedas',
      description: 'Mie pedas level 1-10 dengan topping lengkap. Berani coba?',
      address: 'Jl. Pemuda No. 33, Surabaya',
      city: 'Surabaya',
      phone: '031-5556789',
      openingTime: '09:00',
      closingTime: '23:00',
      category: 'Indonesian',
      capacity: 40,
      mealCategory: 'Beef'
    }
  ];

  for (const restoData of restaurants) {
    const password = await bcrypt.hash('resto123', 10);

    const existingUser = await prisma.user.findUnique({ where: { email: restoData.email } });
    if (existingUser) {
      console.log(`⚠️  Restaurant owner ${restoData.email} already exists, skipping.`);
      continue;
    }

    const result = await prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          name: restoData.ownerName,
          email: restoData.email,
          password,
          phone: restoData.phone,
          role: 'RESTAURANT'
        }
      });

      const restaurant = await tx.restaurant.create({
        data: {
          userId: owner.id,
          name: restoData.restaurantName,
          description: restoData.description,
          address: restoData.address,
          city: restoData.city,
          phone: restoData.phone,
          openingTime: restoData.openingTime,
          closingTime: restoData.closingTime,
          category: restoData.category,
          capacity: restoData.capacity,
          isVerified: true,
          status: true,
          logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(restoData.restaurantName)}&background=FF6B35&color=fff&size=200`
        }
      });

      // Buat meja
      for (let t = 1; t <= 8; t++) {
        await tx.restaurantTable.create({
          data: {
            restaurantId: restaurant.id,
            tableNumber: `T${String(t).padStart(2, '0')}`,
            capacity: t <= 4 ? 2 : (t <= 6 ? 4 : 6),
            isAvailable: true
          }
        });
      }

      return { owner, restaurant };
    });

    console.log(`✅ Restaurant created: ${restoData.restaurantName}`);

    // Import menu dari TheMealDB
    try {
      console.log(`   📥 Importing menus from TheMealDB (${restoData.mealCategory})...`);
      const mealRes = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${restoData.mealCategory}`);
      const meals = mealRes.data.meals?.slice(0, 8) || [];

      for (const meal of meals) {
        const detailRes = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
        const detail = detailRes.data.meals?.[0];

        const priceBase = Math.floor(Math.random() * 70 + 30) * 1000;
        await prisma.menu.create({
          data: {
            restaurantId: result.restaurant.id,
            name: meal.strMeal,
            description: detail?.strInstructions?.substring(0, 200).trim() || `${meal.strMeal} - Hidangan lezat pilihan chef kami.`,
            price: priceBase,
            image: meal.strMealThumb,
            category: restoData.mealCategory,
            mealdbId: meal.idMeal,
            stock: 50,
            isAvailable: true
          }
        });
      }
      console.log(`   ✅ ${meals.length} menus imported`);
    } catch (err) {
      console.log(`   ⚠️  TheMealDB import failed: ${err.message}`);
    }
  }

  // ---- 3. Create Customer ----
  const custPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@carimakan.com' },
    update: {},
    create: {
      name: 'Andi Pratama',
      email: 'customer@carimakan.com',
      password: custPassword,
      phone: '08197654321',
      role: 'CUSTOMER'
    }
  });
  console.log('✅ Customer created:', customer.email);

  console.log('\n✨ Seed selesai! Akun default:');
  console.log('   👑 Admin    : admin@carimakan.com / admin123');
  console.log('   🏪 Restoran : warung.nusantara@carimakan.com / resto123');
  console.log('   👤 Customer : customer@carimakan.com / customer123');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

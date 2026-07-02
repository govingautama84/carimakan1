import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" alt="Food background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-32 sm:pt-32 sm:pb-40">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-block py-1 px-3 rounded-full bg-orange-500/20 text-orange-400 text-sm font-semibold mb-6 border border-orange-500/30 backdrop-blur-sm">
                #1 Food Ordering Platform
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                Pesan Makanan <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  Lebih Mudah & Cepat
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-xl leading-relaxed">
                Temukan restoran terbaik, pesan tempat, dan nikmati makanan favorit Anda tanpa antre. Semua dalam satu aplikasi.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/restaurants" className="btn-primary text-center px-8 py-4 text-lg w-full sm:w-auto hover:scale-105 transform">
                  Cari Restoran Sekarang
                </Link>
                <Link to="/register" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 text-center w-full sm:w-auto backdrop-blur-sm">
                  Daftar sebagai Partner
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Kenapa Memilih CariMakan+?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Kami memberikan pengalaman terbaik untuk pelanggan dan pemilik restoran dengan fitur-fitur modern.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <motion.div whileHover={{ y: -10 }} className="transition-all duration-300 hover:shadow-xl hover:shadow-orange-100 rounded-3xl">
              <Link to="/restaurants" className="block p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center group h-full">
                <div className="w-20 h-20 mx-auto bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Eksplorasi Mudah</h3>
                <p className="text-slate-600 leading-relaxed">Cari dan temukan restoran favorit di sekitarmu dengan pencarian pintar dan filter lengkap.</p>
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="transition-all duration-300 hover:shadow-xl hover:shadow-blue-100 rounded-3xl">
              <Link to="/restaurants" className="block p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center group h-full">
                <div className="w-20 h-20 mx-auto bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Reservasi Praktis</h3>
                <p className="text-slate-600 leading-relaxed">Booking meja sebelum datang agar tidak kehabisan tempat. Proses cepat dan terkonfirmasi langsung.</p>
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="transition-all duration-300 hover:shadow-xl hover:shadow-emerald-100 rounded-3xl">
              <Link to="/my-orders" className="block p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center group h-full">
                <div className="w-20 h-20 mx-auto bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Lacak Real-time</h3>
                <p className="text-slate-600 leading-relaxed">Pantau status pesananmu secara real-time. Dari dapur hingga sampai ke mejamu (atau rumahmu).</p>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-orange-500 skew-y-3 transform origin-bottom-right -z-10 scale-110"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Lapar? Jangan Ditunda!</h2>
          <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
            Gabung bersama ribuan pengguna lainnya yang sudah menikmati kemudahan memesan makanan lewat CariMakan+.
          </p>
          <Link to="/restaurants" className="inline-block bg-white text-orange-600 font-bold px-10 py-4 rounded-full text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            Mulai Pesan Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6 opacity-80 hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-xl">
              C+
            </div>
            <span className="font-bold text-xl text-white tracking-tight">Cari<span className="text-orange-500">Makan+</span></span>
          </div>
          <p className="mb-4 text-sm">&copy; {new Date().getFullYear()} CariMakan+ Platform. All rights reserved.</p>
          <div className="flex gap-4 mt-4">
            <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white transition-colors">Bantuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const MenuCard = ({ menu, restaurant }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(menu, restaurant);
  };

  return (
    <div className="card-hover overflow-hidden flex flex-col group h-full">
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        {menu.image ? (
          <img 
            src={menu.image.startsWith('http') ? menu.image : `${import.meta.env.VITE_BACKEND_URL || ''}${menu.image}`} 
            alt={menu.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {!menu.isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">Habis</span>
          </div>
        )}
        {menu.category && (
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm">
              {menu.category}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-orange-500 transition-colors">{menu.name}</h3>
          <span className="font-bold text-orange-500 whitespace-nowrap">
            Rp {Number(menu.price).toLocaleString('id-ID')}
          </span>
        </div>
        
        <p className="text-sm text-slate-500 line-clamp-2 flex-1 mb-4">
          {menu.description || "Tidak ada deskripsi."}
        </p>

        <button 
          onClick={handleAddToCart}
          disabled={!menu.isAvailable}
          className={`w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
            menu.isAvailable 
              ? 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah ke Keranjang
        </button>
      </div>
    </div>
  );
};

export default MenuCard;

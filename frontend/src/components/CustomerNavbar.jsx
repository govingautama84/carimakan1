import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiHome } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';

const CustomerNavbar = () => {
  const { getTotalItems, tableNumber } = useCart();
  const navigate = useNavigate();
  const totalItems = getTotalItems();

  return (
    <nav className="customer-navbar">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <Link to={tableNumber ? `/order/table/${tableNumber}` : '/'} className="navbar-brand-text text-decoration-none d-flex align-items-center gap-2">
              <MdRestaurant size={24} color="#FFA500" />
              <span>De<span>mail</span></span>
            </Link>
            {tableNumber && (
              <span className="table-badge">
                <FiHome size={12} className="me-1" />
                Meja {tableNumber}
              </span>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            {tableNumber && (
              <button
                className="cart-btn position-relative"
                onClick={() => navigate(`/order/table/${tableNumber}/cart`)}
              >
                <FiShoppingCart size={16} />
                <span>Keranjang</span>
                {totalItems > 0 && (
                  <span className="badge bg-white text-danger position-absolute top-0 start-100 translate-middle rounded-pill"
                    style={{ fontSize: '0.65rem', minWidth: '18px' }}>
                    {totalItems}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CustomerNavbar;

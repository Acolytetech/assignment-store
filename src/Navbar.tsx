import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from './CartContext';
import { ShoppingBagIcon } from 'lucide-react';

const Navbar = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('Navbar must be used within a CartProvider');
  const { totalItems, toggleCart } = context;

  return (
    <nav className="sticky top-0 left-0 w-full h-[65px] bg-white border-b-2 border-slate-200 flex justify-between items-center px-6 box-border z-[900] font-sans">
      <Link to="/" className="text-xl sm:text-2xl font-extrabold text-blue-600 no-underline flex items-center gap-2" id="nav-logo">
        Store
      </Link>
      <div className="flex gap-4 sm:gap-7 items-center" id="nav-links">
      </div>
      <button 
        onClick={() => toggleCart(true)} 
        className="bg-slate-100 border border-slate-200 text-slate-800 px-4 py-2 rounded-full cursor-pointer flex items-center gap-2 font-semibold text-sm relative outline-none transition-all duration-200 hover:bg-slate-200"
        id="nav-cart-btn"
      >
        <ShoppingBagIcon size={18} /> <span>Cart</span>
        <span 
          key={totalItems} 
          className="badge-bounce bg-blue-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[14px] text-center"
          id="nav-cart-badge"
        >
          {totalItems}
        </span>
      </button>
    </nav>
  );
};

export default Navbar;

import React, { useContext } from 'react';
import { CartContext } from './CartContext';
import { ShoppingBagIcon } from 'lucide-react';

const Footer = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('Footer must be used within a CartProvider');
  const { totalItems, totalValue } = context;

  return (
    <footer
      className="fixed bottom-0 left-0 w-full h-[65px] bg-white border-t-2 border-slate-200 flex justify-between items-center px-6 box-border z-[900] font-sans"
      id="cart-footer"
    >
      <div className="flex gap-4 items-center text-sm sm:text-base font-medium">
        <span className="text-lg"><ShoppingBagIcon size={18} /></span>
        <span>Shopping Cart Status</span>
        <span
          key={totalItems}
          className="badge-bounce bg-blue-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold"
          id="cart-total-items"
        >
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>
      <div className="text-base sm:text-lg font-bold text-blue-600 flex items-center gap-2.5" id="cart-total-value">
        <span>Total Value: ${totalValue.toFixed(2)}</span>
        <span className="text-xs text-slate-500 font-normal font-sans">
          Edit / View
        </span>
      </div>
    </footer>
  );
};

export default Footer;

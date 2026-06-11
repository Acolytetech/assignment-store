import React, { useContext } from 'react';
import { CartContext } from './CartContext';
import { DeleteIcon, PlusIcon } from 'lucide-react';

const CartSidebar = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('CartSidebar must be used within a CartProvider');
  const { items, isCartOpen, toggleCart, addItem, removeItem, deleteItem, totalValue } = context;

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1500] box-border backdrop-fade-in"
        onClick={() => toggleCart(false)}
      />

      <div className="fixed top-0 right-0 w-full sm:w-[380px] h-full bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] border-l border-slate-200 flex flex-col z-[1600] box-border font-sans drawer-slide-in" id="cart-sidebar">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="m-0 text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>🛒</span> Shopping Cart
          </h2>
          <button
            onClick={() => toggleCart(false)}
            className="bg-transparent border-none text-slate-500 text-xl cursor-pointer p-1 flex items-center justify-center transition-colors hover:text-slate-800 outline-none"
            id="close-cart-btn"
            title="Close Cart"
          >
            ✕
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-5 sm:p-6">
          {items.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <span className="text-5xl block mb-4">🛍️</span>
              Your cart is empty. Add products from the catalog to get started!
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-slate-200 sidebar-cart-item" data-item-id={item.id}>
                  <img
                    src={item.thumbnail || 'https://via.placeholder.com/50'}
                    alt={item.title}
                    className="w-12 h-12 object-cover rounded-lg bg-slate-100"
                    onError={(e: any) => { e.target.src = 'https://via.placeholder.com/50'; }}
                  />
                  <div className="flex-grow min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate mb-1" title={item.title}>
                      {item.title}
                    </div>
                    <div className="text-xs sm:text-sm text-blue-600 font-semibold">
                      ${item.price} each
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => removeItem(item)}
                        className="bg-slate-100 hover:bg-slate-200 border-none text-slate-800 w-6 h-6 rounded cursor-pointer font-bold text-sm flex items-center justify-center qty-minus-btn"
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold min-w-[20px] text-center text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addItem(item)}
                        className="bg-slate-100 hover:bg-slate-200 border-none text-slate-800 w-6 h-6 rounded cursor-pointer font-bold text-sm flex items-center justify-center qty-plus-btn"
                      >
                        <PlusIcon size={14} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteItem(item)}
                    className="bg-transparent border-none text-red-500 cursor-pointer p-1.5 text-sm font-semibold flex items-center justify-center transition-opacity hover:opacity-80 delete-item-btn"
                    title="Remove Item"
                  >
                    <DeleteIcon size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex justify-between mb-4 text-base sm:text-lg font-bold">
            <span className="text-slate-500">Total Value:</span>
            <span className="text-blue-600" id="cart-sidebar-total">${totalValue.toFixed(2)}</span>
          </div>
          <button
            onClick={() => { alert('Proceeding to Checkout!'); }}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white border-none py-3.5 rounded-lg font-bold text-base cursor-pointer outline-none transition-colors flex items-center justify-center gap-2"
            disabled={items.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;

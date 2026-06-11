import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CartContext } from './CartContext';
import { Product } from './types';

const ProductDetailPage = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('ProductDetailPage must be used within a CartProvider');
  const { addItem } = context;

  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedSuccessfully, setAddedSuccessfully] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.escuelajs.co/api/v1/products/${id}`);
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();
      setProduct(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product);
      setAddedSuccessfully(true);
      setShowToast(true);

      setTimeout(() => {
        setAddedSuccessfully(false);
      }, 1500);

      setTimeout(() => {
        setShowToast(false);
      }, 2500);
    }
  };

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans">
      <div className="p-5 md:p-10 pb-28 md:pb-32">
        <Link to="/" className="inline-flex items-center gap-2 bg-slate-100 text-blue-600 border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold no-underline mb-8 cursor-pointer transition-all duration-200 hover:bg-slate-200" id="back-to-home">
          ← Back to Catalog
        </Link>

        {loading && (
          <div className="text-center py-24 text-lg text-slate-600" id="detail-loading">
            🔄 Loading product details...
          </div>
        )}

        {error && (
          <div className="text-center p-5 text-red-500 bg-red-50 border border-red-200 rounded-lg" id="detail-error">
            ⚠️ Error loading product: {error}
          </div>
        )}

        {!loading && !error && product && (
          <div className="flex flex-col md:flex-row bg-white border border-slate-200 rounded-2xl overflow-hidden gap-5 md:gap-10 p-5 md:p-10 shadow-md" id="product-detail-container">
            <div className="w-full aspect-square md:aspect-auto md:h-[400px] md:w-[45%] lg:w-[40%] bg-slate-100 rounded-xl overflow-hidden relative">
              <img
                src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/600'}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e: any) => { e.target.src = 'https://via.placeholder.com/600'; }}
              />
            </div>
            <div className="flex-[1.2] flex flex-col justify-between gap-5">
              <div>
                {product.category && (
                  <span className="inline-block bg-blue-100 text-blue-600 px-2.5 py-1 rounded-md text-xs font-semibold self-start mb-4">{product.category.name}</span>
                )}
                <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 m-0 mb-2.5" id="product-title">{product.title}</h1>
                <div className="text-3xl font-extrabold text-blue-600 mb-5" id="product-price">${product.price}</div>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-5" id="product-desc">{product.description}</p>
              </div>
              <button
                onClick={handleAddToCart}
                className={`text-white border-none py-3.5 px-7 rounded-lg text-base font-bold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2.5 outline-none w-full md:w-auto ${addedSuccessfully
                  ? 'bg-blue-500 hover:bg-blue-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                  }`}
                id="add-to-cart-btn"
              >
                {addedSuccessfully ? 'Added to Cart! ✓' : 'Add to My Cart'}
              </button>
            </div>
          </div>
        )}

        {showToast && product && (
          <div
            className="fixed top-7 right-7 bg-white/90 backdrop-blur-md border border-blue-500 text-slate-800 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 z-[2000] text-sm font-semibold pointer-events-none toast-slide-in"
          >
            <span className="text-xl text-blue-500">✅</span>
            <div className="flex flex-col">
              <div>Added to Cart!</div>
              <div className="text-xs text-slate-500 font-normal mt-0.5 font-sans">
                {product.title} has been added.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;

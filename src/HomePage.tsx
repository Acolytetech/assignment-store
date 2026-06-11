import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CartContext } from './CartContext';
import { Product, Category } from './types';

const HomePage = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('HomePage must be used within a CartProvider');
  const { setCatalogProducts, setLoadingCatalog } = context;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const selectedCategoriesStr = searchParams.get('categories') || '';
  const selectedCategoryIds = selectedCategoriesStr
    ? selectedCategoriesStr.split(',').map(Number).filter(n => !isNaN(n))
    : [];

  const sortBy = searchParams.get('sort') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const filterProductsWithImages = (productsList: Product[]) => {
    return productsList.filter(product => {
      if (!product.images || product.images.length === 0 || !product.images[0]) return false;
      const firstImg = product.images[0].trim();
      if (firstImg === "" || firstImg === "null" || firstImg === "undefined" || firstImg.includes("placeholder") || firstImg.includes("via.placeholder")) {
        return false;
      }
      if (firstImg.startsWith("[") && firstImg.endsWith("]")) {
        try {
          const parsed = JSON.parse(firstImg);
          if (parsed.length === 0 || !parsed[0] || parsed[0].trim() === "" || parsed[0].includes("placeholder") || parsed[0].includes("via.placeholder")) {
            return false;
          }
        } catch (e) {
          // not JSON array
        }
      }
      return true;
    });
  };

  const checkEmptyCategories = useCallback(async (cats: Category[]) => {
    try {
      const checkedCats = await Promise.all(
        cats.map(async (cat) => {
          try {
            const res = await fetch(`https://api.escuelajs.co/api/v1/products/?categoryId=${cat.id}&limit=1`);
            if (res.ok) {
              const prods = await res.json();
              return { cat, count: prods.length };
            }
            return { cat, count: 0 };
          } catch (e) {
            return { cat, count: 0 };
          }
        })
      );

      const emptyCats = checkedCats.filter(item => item.count <= 0);
      emptyCats.forEach(item => {
        console.log(`Category with 0 products: ${item.cat.name} (ID: ${item.cat.id})`);
      });

      const activeCats = checkedCats
        .filter(item => item.count > 0)
        .map(item => item.cat);

      setCategories(activeCats);
    } catch (e) {
      console.error('Error checking empty categories in background:', e);
    }
  }, []);

  // Fetch Categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await fetch('https://api.escuelajs.co/api/v1/categories');
        if (!catRes.ok) throw new Error('Failed to fetch categories');
        const catData = await catRes.json();

        const excludedNames = ['animal', 'test2', 'updated new category aav'];
        const filteredCats = catData.filter((cat: any) => {
          if (!cat || !cat.name) return false;
          const nameLower = cat.name.toLowerCase();
          return !excludedNames.some(ex => nameLower.includes(ex));
        });

        const limitedCats = filteredCats.slice(0, 8);
        setCategories(limitedCats);

        // Background check for empty ones
        checkEmptyCategories(limitedCats);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, [checkEmptyCategories]);

  // Fetch Products whenever URL parameters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingCatalog(true);
      setLoading(true);
      setError(null);

      try {
        let fetchedProducts: Product[] = [];

        if (selectedCategoryIds.length === 0) {
          // Fetch default all catalog products
          const prodRes = await fetch('https://api.escuelajs.co/api/v1/products?offset=0&limit=100');
          if (!prodRes.ok) throw new Error('Failed to fetch products');
          fetchedProducts = await prodRes.json();
        } else {
          // Fetch for each category in parallel and combine/deduplicate
          const promises = selectedCategoryIds.map(async (catId) => {
            const res = await fetch(`https://api.escuelajs.co/api/v1/products/?categoryId=${catId}`);
            if (!res.ok) throw new Error(`Failed to fetch products for category ${catId}`);
            return res.json() as Promise<Product[]>;
          });

          const results = await Promise.all(promises);
          const allProds = results.flat();

          // Deduplicate
          const seenIds = new Set<number>();
          fetchedProducts = [];
          for (const prod of allProds) {
            if (!seenIds.has(prod.id)) {
              seenIds.add(prod.id);
              fetchedProducts.push(prod);
            }
          }
        }

        const filteredProds = filterProductsWithImages(fetchedProducts);
        setProducts(filteredProds);
        setCatalogProducts(filteredProds);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
        setLoadingCatalog(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoriesStr, setCatalogProducts, setLoadingCatalog]);

  const handleCategoryToggle = (categoryId: number | null) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset pagination to page 1

    if (categoryId === null) {
      params.delete('categories');
    } else {
      let updatedIds: number[];
      if (selectedCategoryIds.includes(categoryId)) {
        updatedIds = selectedCategoryIds.filter(id => id !== categoryId);
      } else {
        updatedIds = [...selectedCategoryIds, categoryId];
      }

      if (updatedIds.length === 0) {
        params.delete('categories');
      } else {
        params.set('categories', updatedIds.join(','));
      }
    }
    setSearchParams(params);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (e.target.value) {
      params.set('sort', e.target.value);
    } else {
      params.delete('sort');
    }
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  const getSortedProducts = () => {
    const sorted = [...products];
    if (sortBy === 'price-asc') {
      return sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      return sorted.sort((a, b) => b.price - a.price);
    }
    return sorted;
  };

  const sortedProducts = getSortedProducts();
  const productsPerPage = 12;
  const totalProducts = sortedProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const startIndex = (currentPage - 1) * productsPerPage;
  const displayedProducts = sortedProducts.slice(startIndex, startIndex + productsPerPage);

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans">
      <div className="p-5 sm:p-10 pb-28 sm:pb-32">
        <header className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-5 mb-8 border-b border-slate-200 pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-600 m-0">Store catalog</h1>
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-white text-slate-800 border border-slate-300 px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
              id="sort-select"
            >
              <option value="">Sort By Price</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </header>

        <div className="flex flex-wrap gap-2.5 mb-8" id="category-filters">
          <button
            onClick={() => handleCategoryToggle(null)}
            className={`category-filter-btn px-4 py-2 rounded-full text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.1)] border ${selectedCategoryIds.length === 0
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
          >
            All Products
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryToggle(cat.id)}
                className={`category-filter-btn px-4 py-2 rounded-full text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.1)] border ${isSelected
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                data-category-id={cat.id}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="text-center py-10 text-lg text-slate-500" id="loading-indicator">
            🔄 Loading products...
          </div>
        )}

        {error && (
          <div className="text-center p-5 text-red-500 bg-red-50 border border-red-200 rounded-lg my-5" id="error-message">
            ⚠️ Error: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="products-grid">
              {displayedProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}/details`}
                  state={{ product }}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-500 product-card text-inherit no-underline"
                  data-product-id={product.id}
                >
                  <div className="w-full aspect-square relative bg-slate-100">
                    <img
                      src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/300'}
                      alt={product.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e: any) => { e.target.src = 'https://via.placeholder.com/300'; }}
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div className="text-sm sm:text-base font-semibold mb-2 text-slate-800 leading-snug h-11 overflow-hidden line-clamp-2" title={product.title}>
                      {product.title}
                    </div>
                    <div className="flex justify-between items-center mt-2.5">
                      <span className="text-lg font-bold text-blue-600">${product.price}</span>
                      <span className="text-sm text-blue-600 font-semibold">Details →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </main>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 mt-10" id="pagination-controls">
                <button
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg font-bold border cursor-pointer transition-all duration-200 ${currentPage === page
                        ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;

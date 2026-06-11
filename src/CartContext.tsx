import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Product, CartItem, CartContextType } from './types';

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [catalogProducts, setCatalogProductsState] = useState<Product[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const toggleCart = useCallback((isOpen?: boolean) => {
    setIsCartOpen(prev => (isOpen !== undefined ? isOpen : !prev));
  }, []);

  const addItem = useCallback((product: Product | CartItem) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        const thumbnail = 'images' in product && product.images && product.images.length > 0
          ? product.images[0]
          : ('thumbnail' in product ? (product as any).thumbnail : '');
        return [
          ...prev,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: thumbnail || '',
            quantity: 1,
          },
        ];
      }
    });
  }, []);

  const removeItem = useCallback((product: Product | CartItem) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter(item => item.id !== product.id);
      }
      return prev.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  }, []);

  const deleteItem = useCallback((product: Product | CartItem) => {
    setItems(prev => prev.filter(item => item.id !== product.id));
  }, []);

  const setCatalogProducts = useCallback((products: Product[]) => {
    setCatalogProductsState(products);
  }, []);

  const setLoadingCatalog = useCallback((loading: boolean) => {
    setIsLoadingCatalog(loading);
  }, []);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalValue = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.price, 0), [items]);

  const contextValue = useMemo(() => ({
    items,
    isCartOpen,
    catalogProducts,
    isLoadingCatalog,
    totalItems,
    totalValue,
    toggleCart,
    addItem,
    removeItem,
    deleteItem,
    setCatalogProducts,
    setLoadingCatalog
  }), [
    items,
    isCartOpen,
    catalogProducts,
    isLoadingCatalog,
    totalItems,
    totalValue,
    toggleCart,
    addItem,
    removeItem,
    deleteItem,
    setCatalogProducts,
    setLoadingCatalog
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

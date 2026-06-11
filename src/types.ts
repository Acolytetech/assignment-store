export interface Category {
  id: number;
  name: string;
  image?: string;
  creationAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: Category;
  creationAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  catalogProducts: Product[];
  isLoadingCatalog: boolean;
  totalItems: number;
  totalValue: number;
  toggleCart: (isOpen?: boolean) => void;
  addItem: (product: Product | CartItem) => void;
  removeItem: (product: Product | CartItem) => void;
  deleteItem: (product: Product | CartItem) => void;
  setCatalogProducts: (products: Product[]) => void;
  setLoadingCatalog: (loading: boolean) => void;
}

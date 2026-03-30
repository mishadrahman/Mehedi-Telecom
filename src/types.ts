export interface Product {
  id?: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  brand: string;
  category: string;
  shortSpecs: string;
  fullSpecs: string;
  stockStatus: 'In Stock' | 'Out of Stock';
  createdAt: number;
  rating?: number;
  reviewCount?: number;
}

export interface Review {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface Order {
  id?: string;
  userId: string;
  userEmail?: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Banner {
  id?: string;
  image: string;
  title?: string;
  subtitle?: string;
  createdAt: number;
  updatedAt?: number;
}

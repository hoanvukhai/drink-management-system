// frontend/src/lib/api.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================================
// API TYPES
// ========================================

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  imageUrl?: string | null;
}

// Table & Zone Types
export type TableStatus = 'AVAILABLE' | 'OCCUPIED';

export interface Table {
  id: number;
  name: string;
  status: TableStatus;
  zoneId: number;
  zone?: Zone;
}

export interface Zone {
  id: number;
  name: string;
  tables: Table[];
}

// Order Types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OrderItemInput {
  productId: number;
  quantity: number;
  note?: string;
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  tableId?: number | null;
}

export interface OrderItem {
  id: number;
  quantity: number;
  note?: string;
  product: Product;
}

export interface Order {
  id: number;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
  tableId?: number | null;
  table?: Table | null;
  items: OrderItem[];
}

export interface User {
  id: number;
  username: string;
  name?: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name?: string;
  role?: User['role'];
}

// ========================================
// API FUNCTIONS
// ========================================

// Auth
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<{ accessToken: string }>('/auth/login', credentials),

  register: (data: RegisterData) =>
    apiClient.post<User>('/auth/register', data),
};

// Categories
export const categoriesAPI = {
  getAll: () => apiClient.get<Category[]>('/categories'),
  create: (name: string) => apiClient.post<Category>('/categories', { name }),
  update: (id: number, name: string) => apiClient.patch<Category>(`/categories/${id}`, { name }),
  delete: (id: number) => apiClient.delete(`/categories/${id}`),
};

// Products
export const productsAPI = {
  getAll: () => apiClient.get<Product[]>('/products'),
  getById: (id: number) => apiClient.get<Product>(`/products/${id}`),
  create: (data: Omit<Product, 'id'>) => apiClient.post<Product>('/products', data),
  update: (id: number, data: Partial<Omit<Product, 'id'>>) => apiClient.patch<Product>(`/products/${id}`, data),
  delete: (id: number) => apiClient.delete(`/products/${id}`),
};

// Zones
export const zonesAPI = {
  getAll: () => apiClient.get<Zone[]>('/zones'),
  create: (name: string) => apiClient.post<Zone>('/zones', { name }),
  delete: (id: number) => apiClient.delete(`/zones/${id}`),
};

// Tables
export const tablesAPI = {
  getAll: () => apiClient.get<Table[]>('/tables'),
  create: (data: { name: string; zoneId: number }) => apiClient.post<Table>('/tables', data),
  updateStatus: (id: number, status: TableStatus) => apiClient.patch<Table>(`/tables/${id}/status`, { status }),
  delete: (id: number) => apiClient.delete(`/tables/${id}`),
};

// Orders
export const ordersAPI = {
  getAll: () => apiClient.get<Order[]>('/orders'),
  create: (data: CreateOrderInput) => apiClient.post<Order>('/orders', data),
  updateStatus: (id: number, status: OrderStatus) => apiClient.patch<Order>(`/orders/${id}/status`, { status }),
};

// Users/Staff
export const usersAPI = {
  getAll: () => apiClient.get<User[]>('/users'),
  getById: (id: number) => apiClient.get<User>(`/users/${id}`),
  create: (data: Omit<User, 'id'> & { password: string }) => apiClient.post<User>('/users', data),
  update: (id: number, data: Partial<Omit<User, 'id' | 'username'>> & { password?: string }) =>
    apiClient.patch<User>(`/users/${id}`, data),
  delete: (id: number) => apiClient.delete(`/users/${id}`),
};
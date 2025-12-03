// frontend/src/lib/api.ts - UPDATED VERSION
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

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

// ============================================
// TYPES
// ============================================

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

export type TableStatus = 'AVAILABLE' | 'OCCUPIED';

export interface Table {
  id: number;
  name: string;
  capacity: number;
  status: TableStatus;
  zoneId: number;
  zone?: Zone;
  orders?: Order[];
}

export interface Zone {
  id: number;
  name: string;
  tables: Table[];
}

export type OrderStatus = 'PENDING' | 'READY' | 'SERVED' | 'COMPLETED';

export interface OrderItemInput {
  productId: number;
  quantity: number;
  note?: string;
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  tableId?: number | null;
  customerName?: string;
  customerPhone?: string;
  type?: 'DINE_IN' | 'TAKEAWAY';
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  note?: string;
  isServed: boolean;
  isCompleted: boolean; // 👈 NEW
  completedAt?: string; // 👈 NEW
  productId: number;
  product: Product;
  createdAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
  type: 'DINE_IN' | 'TAKEAWAY';
  tableId?: number | null;
  table?: Table | null;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  readyAt?: string;
  servedAt?: string;
  completedAt?: string;
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

export interface RecipeIngredient {
  id: number;
  ingredientId: number; // 🔥 Changed
  quantity: number;
  ingredient: Ingredient; // 🔥 Full ingredient object
}


export interface RecipeStep {
  id: number;
  stepNumber: number;
  instruction: string;
}

export interface Recipe {
  id: number;
  productId: number;
  description?: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  product: {
    id: number;
    name: string;
    price: number;
  };
}


// Update Recipe types to use ingredientId
export interface CreateRecipeInput {
  productId: number;
  description?: string;
  ingredients: Array<{
    ingredientId: number; // 🔥 Changed
    quantity: number;
  }>;
  steps: Array<{
    stepNumber: number;
    instruction: string;
  }>;
}

// 👇 NEW: Edit Tracking Types
export type EditAction = 'DELETE' | 'UPDATE_QUANTITY' | 'UPDATE_NOTE';

export interface OrderItemEdit {
  id: number;
  orderItemId: number;
  action: EditAction;
  oldValue?: string;
  newValue?: string;
  reason: string;
  userId?: number;
  createdAt: string;
  itemId?: number;
  itemName?: string;
  itemPrice?: number;
}

export interface EditOrderItemInput {
  action: EditAction;
  newQuantity?: number;
  newNote?: string;
  reason: string;
  userId?: number;
}

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  currentStock: number;
  costPrice: number;
  minStock: number;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: number;
  ingredientId: number;
  change: number;
  price: number;
  type: 'IMPORT' | 'EXPORT_SALES' | 'EXPORT_DAMAGE' | 'AUDIT';
  note?: string;
  userId?: number;
  createdAt: string;
  ingredient?: Ingredient;
}

export interface InventoryReport {
  id: number;
  name: string;
  unit: string;
  currentStock: number;
  costPrice: number;
  minStock: number;
  status: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OK';
  totalValue: number;
  recentTransactions: InventoryTransaction[];
}

export interface COGSReport {
  totalCOGS: number;
  startDate: string;
  endDate: string;
  breakdown: Array<{
    ingredient: string;
    quantity: number;
    unit: string;
    costPrice: number;
    totalCost: number;
    date: string;
  }>;
}

// ============================================
// API FUNCTIONS
// ============================================

export const authAPI = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<{ accessToken: string }>('/auth/login', credentials),
  register: (data: RegisterData) =>
    apiClient.post<User>('/auth/register', data),
};

export const categoriesAPI = {
  getAll: () => apiClient.get<Category[]>('/categories'),
  create: (name: string) => apiClient.post<Category>('/categories', { name }),
  update: (id: number, name: string) => apiClient.patch<Category>(`/categories/${id}`, { name }),
  delete: (id: number) => apiClient.delete(`/categories/${id}`),
};

export const productsAPI = {
  getAll: () => apiClient.get<Product[]>('/products'),
  getById: (id: number) => apiClient.get<Product>(`/products/${id}`),
  create: (data: Omit<Product, 'id'>) => apiClient.post<Product>('/products', data),
  update: (id: number, data: Partial<Omit<Product, 'id'>>) => apiClient.patch<Product>(`/products/${id}`, data),
  delete: (id: number) => apiClient.delete(`/products/${id}`),
};

export const zonesAPI = {
  getAll: () => apiClient.get<Zone[]>('/zones'),
  create: (name: string) => apiClient.post<Zone>('/zones', { name }),
  update: (id: number, name: string) => apiClient.patch<Zone>(`/zones/${id}`, { name }),
  delete: (id: number) => apiClient.delete(`/zones/${id}`),
};

export const tablesAPI = {
  getAll: () => apiClient.get<Table[]>('/tables'),
  getById: (id: number) => apiClient.get<Table>(`/tables/${id}`),
  create: (data: { name: string; zoneId: number; capacity?: number }) => 
    apiClient.post<Table>('/tables', data),
  update: (id: number, data: { name?: string; capacity?: number }) =>
    apiClient.patch<Table>(`/tables/${id}`, data),
  updateStatus: (id: number, status: TableStatus) => 
    apiClient.patch<Table>(`/tables/${id}/status`, { status }),
  delete: (id: number) => apiClient.delete(`/tables/${id}`),
};

export const ordersAPI = {
  // Create new order
  create: (data: CreateOrderInput) => apiClient.post<Order>('/orders', data),
  
  // Add items to existing order
  addItems: (orderId: number, items: OrderItemInput[]) =>
    apiClient.post<Order>(`/orders/${orderId}/items`, { items }),
  
  // Remove item from order
  removeItem: (orderId: number, itemId: number) =>
    apiClient.delete(`/orders/${orderId}/items/${itemId}`),
  
  // Kitchen: Mark as ready
  markAsReady: (orderId: number) =>
    apiClient.patch<Order>(`/orders/${orderId}/ready`),
  
  // Server: Mark item as served
  markItemServed: (orderId: number, itemId: number) =>
    apiClient.patch<Order>(`/orders/${orderId}/items/${itemId}/served`),
  
  // 👇 NEW: Kitchen: Mark item completed
  markItemCompleted: (orderId: number, itemId: number) =>
    apiClient.patch<OrderItem>(`/orders/${orderId}/items/${itemId}/complete`),
  
  // 👇 NEW: Edit item (delete/update quantity/note)
  editItem: (orderId: number, itemId: number, data: EditOrderItemInput) =>
    apiClient.patch<Order>(`/orders/${orderId}/items/${itemId}/edit`, data),
  
  // 👇 NEW: Get edit history
  getEditHistory: (orderId: number) =>
    apiClient.get<OrderItemEdit[]>(`/orders/${orderId}/edits`),
  
  // Move table
  moveTable: (orderId: number, newTableId: number) =>
    apiClient.patch<Order>(`/orders/${orderId}/move`, { newTableId }),
  
  // Complete order (payment)
  complete: (orderId: number) =>
    apiClient.patch<Order>(`/orders/${orderId}/complete`),
  
  // Get orders by role
  getForServer: () => apiClient.get<Order[]>('/orders/for-server'),
  getForKitchen: () => apiClient.get<Order[]>('/orders/for-kitchen'),
  getForCashier: () => apiClient.get<Order[]>('/orders/for-cashier'),
  
  // Get active order by table
  getActiveOrderByTable: (tableId: number) =>
    apiClient.get<Order>(`/orders/table/${tableId}`),
  
  // Get all orders (history)
  getAll: () => apiClient.get<Order[]>('/orders'),
  getById: (id: number) => apiClient.get<Order>(`/orders/${id}`),
};

export const usersAPI = {
  getAll: () => apiClient.get<User[]>('/users'),
  getById: (id: number) => apiClient.get<User>(`/users/${id}`),
  create: (data: Omit<User, 'id'> & { password: string }) => apiClient.post<User>('/users', data),
  update: (id: number, data: Partial<Omit<User, 'id' | 'username'>> & { password?: string }) =>
    apiClient.patch<User>(`/users/${id}`, data),
  delete: (id: number) => apiClient.delete(`/users/${id}`),
};

// 👇 NEW: Recipe APIs
export const recipesAPI = {
  // Get all recipes
  getAll: () => apiClient.get<Recipe[]>('/recipes'),
  
  // Get recipe by product ID
  getByProduct: (productId: number) => 
    apiClient.get<Recipe>(`/recipes/product/${productId}`),
  
  // Create recipe
  create: (data: CreateRecipeInput) =>
    apiClient.post<Recipe>('/recipes', data),
  
  // Update recipe
  update: (id: number, data: Partial<CreateRecipeInput>) =>
    apiClient.patch<Recipe>(`/recipes/${id}`, data),
  
  // Delete recipe
  delete: (id: number) =>
    apiClient.delete<{ message: string; id: number }>(`/recipes/${id}`),
};

export const ingredientsAPI = {
  // Get all ingredients
  getAll: () => apiClient.get<Ingredient[]>('/ingredients'),
  
  // Get inventory report
  getReport: () => apiClient.get<InventoryReport[]>('/ingredients/report'),
  
  // Create ingredient
  create: (data: { name: string; unit: string; minStock?: number }) =>
    apiClient.post<Ingredient>('/ingredients', data),
  
  // Import stock
  import: (ingredientId: number, quantity: number, price: number, note?: string) =>
    apiClient.post<Ingredient>(`/ingredients/${ingredientId}/import`, {
      quantity,
      price,
      note,
    }),
  
  // Stocktake (audit)
  stocktake: (ingredientId: number, actualStock: number, reason: string) =>
    apiClient.post<Ingredient>(`/ingredients/${ingredientId}/stocktake`, {
      actualStock,
      reason,
    }),
  
  // Damage/waste
  damage: (ingredientId: number, quantity: number, reason: string) =>
    apiClient.post<Ingredient>(`/ingredients/${ingredientId}/damage`, {
      quantity,
      reason,
    }),
  
  // Get COGS report
  getCOGS: (startDate: string, endDate: string) =>
    apiClient.get<COGSReport>('/ingredients/cogs', {
      params: { startDate, endDate },
    }),
};


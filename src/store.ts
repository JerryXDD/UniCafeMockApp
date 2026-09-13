import { MenuItem, Order, Wallet, AppState } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'cafeteria_app_data';

const defaultMenu: MenuItem[] = [
  { id: uuidv4(), name: 'Paratha Roll', description: 'Crispy paratha with chicken tikka & chutney', price: 180, category: 'breakfast', available: true, prepTime: 8 },
  { id: uuidv4(), name: 'Chai', description: 'Traditional doodh patti chai', price: 60, category: 'beverages', available: true, prepTime: 3 },
  { id: uuidv4(), name: 'Biryani Plate', description: 'Chicken biryani with raita & salad', price: 320, category: 'lunch', available: true, prepTime: 12 },
  { id: uuidv4(), name: 'Chicken Karahi', description: 'Half portion with naan', price: 380, category: 'lunch', available: true, prepTime: 15 },
  { id: uuidv4(), name: 'Samosa (2 pcs)', description: 'Crispy aloo samosas with chutney', price: 80, category: 'snacks', available: true, prepTime: 5 },
  { id: uuidv4(), name: 'Fruit Chat', description: 'Seasonal fruits with chat masala', price: 150, category: 'snacks', available: true, prepTime: 5 },
  { id: uuidv4(), name: 'Lassi', description: 'Sweet or salty lassi', price: 100, category: 'beverages', available: true, prepTime: 3 },
  { id: uuidv4(), name: 'Egg Sandwich', description: 'Boiled egg sandwich with mayo', price: 120, category: 'breakfast', available: true, prepTime: 6 },
  { id: uuidv4(), name: 'Dal Chawal', description: 'Masoor dal with steamed rice', price: 200, category: 'lunch', available: true, prepTime: 8 },
  { id: uuidv4(), name: 'Cold Coffee', description: 'Iced coffee with cream', price: 180, category: 'beverages', available: true, prepTime: 4 },
  { id: uuidv4(), name: 'Pakora Plate', description: 'Mixed veg pakoras with green chutney', price: 120, category: 'snacks', available: true, prepTime: 7 },
  { id: uuidv4(), name: 'Halwa Puri', description: 'Traditional halwa puri set', price: 200, category: 'breakfast', available: true, prepTime: 10 },
];

const defaultWallet: Wallet = {
  balance: 2000,
  studentName: 'Ahmed Khan'
};

function getDefaultState(): AppState {
  return {
    menu: defaultMenu,
    orders: [],
    wallet: defaultWallet,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  const defaultState = getDefaultState();
  saveState(defaultState);
  return defaultState;
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  // Dispatch custom event for cross-tab sync
  window.dispatchEvent(new CustomEvent('cafeteria-state-update', { detail: state }));
}

export function addOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
  const state = loadState();
  const newOrder: Order = {
    ...order,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  state.orders.unshift(newOrder);
  saveState(state);
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: Order['status']): void {
  const state = loadState();
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    saveState(state);
  }
}

export function updateMenu(menu: MenuItem[]): void {
  const state = loadState();
  state.menu = menu;
  saveState(state);
}

export function toggleMenuItemAvailability(itemId: string): void {
  const state = loadState();
  const item = state.menu.find(m => m.id === itemId);
  if (item) {
    item.available = !item.available;
    saveState(state);
  }
}

export function updateWalletBalance(newBalance: number): void {
  const state = loadState();
  state.wallet.balance = newBalance;
  saveState(state);
}

export function addWalletFunds(amount: number): void {
  const state = loadState();
  state.wallet.balance += amount;
  saveState(state);
}

export function resetData(): void {
  localStorage.removeItem(STORAGE_KEY);
  const defaultState = getDefaultState();
  saveState(defaultState);
}

// Listen for cross-tab updates (real-time simulation)
export function onStateChange(callback: (state: AppState) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };
  
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        callback(JSON.parse(e.newValue));
      } catch (err) {
        console.error('Failed to parse storage event:', err);
      }
    }
  };

  window.addEventListener('cafeteria-state-update', handler);
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener('cafeteria-state-update', handler);
    window.removeEventListener('storage', storageHandler);
  };
}

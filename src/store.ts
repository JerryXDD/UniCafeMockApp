import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { MenuItem, Order, Wallet, OrderStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

// Default menu data (shared across all students)
const defaultMenu: MenuItem[] = [
  { id: 'm1', name: 'Paratha Roll', description: 'Crispy paratha with chicken tikka & chutney', price: 180, category: 'breakfast', available: true, prepTime: 8 },
  { id: 'm2', name: 'Chai', description: 'Traditional doodh patti chai', price: 60, category: 'beverages', available: true, prepTime: 3 },
  { id: 'm3', name: 'Biryani Plate', description: 'Chicken biryani with raita & salad', price: 320, category: 'lunch', available: true, prepTime: 12 },
  { id: 'm4', name: 'Chicken Karahi', description: 'Half portion with naan', price: 380, category: 'lunch', available: true, prepTime: 15 },
  { id: 'm5', name: 'Samosa (2 pcs)', description: 'Crispy aloo samosas with chutney', price: 80, category: 'snacks', available: true, prepTime: 5 },
  { id: 'm6', name: 'Fruit Chat', description: 'Seasonal fruits with chat masala', price: 150, category: 'snacks', available: true, prepTime: 5 },
  { id: 'm7', name: 'Lassi', description: 'Sweet or salty lassi', price: 100, category: 'beverages', available: true, prepTime: 3 },
  { id: 'm8', name: 'Egg Sandwich', description: 'Boiled egg sandwich with mayo', price: 120, category: 'breakfast', available: true, prepTime: 6 },
  { id: 'm9', name: 'Dal Chawal', description: 'Masoor dal with steamed rice', price: 200, category: 'lunch', available: true, prepTime: 8 },
  { id: 'm10', name: 'Cold Coffee', description: 'Iced coffee with cream', price: 180, category: 'beverages', available: true, prepTime: 4 },
  { id: 'm11', name: 'Pakora Plate', description: 'Mixed veg pakoras with green chutney', price: 120, category: 'snacks', available: true, prepTime: 7 },
  { id: 'm12', name: 'Halwa Puri', description: 'Traditional halwa puri set', price: 200, category: 'breakfast', available: true, prepTime: 10 },
];

// Seed default menu if empty
export async function seedMenu(): Promise<void> {
  try {
    const menuSnap = await getDocs(collection(db, 'menu'));
    if (menuSnap.empty) {
      for (const item of defaultMenu) {
        await setDoc(doc(db, 'menu', item.id), item);
      }
    }
  } catch (error) {
    console.error('Error seeding menu:', error);
  }
}

// Real-time subscription for menu (shared)
export function subscribeToMenu(callback: (menu: MenuItem[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'menu'),
    (snapshot) => {
      const menu: MenuItem[] = snapshot.docs.map(doc => doc.data() as MenuItem);
      callback(menu);
    },
    (error) => {
      console.error('Menu subscription error:', error);
    }
  );
}

// Real-time subscription for a specific student's orders (no composite index needed)
export function subscribeToStudentOrders(userId: string, callback: (orders: Order[]) => void): Unsubscribe {
  // Get all orders and filter client-side to avoid composite index requirement
  return onSnapshot(
    collection(db, 'orders'),
    (snapshot) => {
      const allOrders: Order[] = snapshot.docs.map(doc => doc.data() as Order);
      // Filter for this user's orders and sort by createdAt descending
      const userOrders = allOrders
        .filter(order => order.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(userOrders);
    },
    (error) => {
      console.error('Orders subscription error:', error);
    }
  );
}

// Real-time subscription for ALL orders (staff view)
export function subscribeToAllOrders(callback: (orders: Order[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'orders'),
    (snapshot) => {
      const orders: Order[] = snapshot.docs
        .map(doc => doc.data() as Order)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(orders);
    },
    (error) => {
      console.error('All orders subscription error:', error);
    }
  );
}

// Real-time subscription for a specific student's wallet
export function subscribeToWallet(userId: string, callback: (wallet: Wallet) => void): Unsubscribe {
  return onSnapshot(
    doc(db, 'wallets', userId),
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as Wallet);
      }
    },
    (error) => {
      console.error('Wallet subscription error:', error);
    }
  );
}

// Add a new order (with userId)
export async function addOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const newOrder: Order = {
    ...order,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'orders', newOrder.id), newOrder);
  return newOrder;
}

// Update order status
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { status });
}

// Toggle menu item availability
export async function toggleMenuItemAvailability(itemId: string): Promise<void> {
  const itemRef = doc(db, 'menu', itemId);
  const snap = await getDoc(itemRef);
  if (snap.exists()) {
    const current = snap.data() as MenuItem;
    await updateDoc(itemRef, { available: !current.available });
  }
}

// Add new menu item
export async function addMenuItem(item: Omit<MenuItem, 'id'>): Promise<void> {
  const id = uuidv4();
  await setDoc(doc(db, 'menu', id), { ...item, id });
}

// Delete menu item
export async function deleteMenuItem(itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'menu', itemId));
}

// Update wallet balance
export async function updateWalletBalance(userId: string, newBalance: number): Promise<void> {
  await updateDoc(doc(db, 'wallets', userId), { balance: newBalance });
}

// Add funds to wallet
export async function addWalletFunds(userId: string, amount: number): Promise<void> {
  const snap = await getDoc(doc(db, 'wallets', userId));
  if (snap.exists()) {
    const current = snap.data() as Wallet;
    await updateDoc(doc(db, 'wallets', userId), { balance: current.balance + amount });
  }
}

// Reset all data (admin function)
export async function resetData(): Promise<void> {
  // Clear orders
  const ordersSnap = await getDocs(collection(db, 'orders'));
  for (const d of ordersSnap.docs) {
    await deleteDoc(d.ref);
  }

  // Clear wallets
  const walletsSnap = await getDocs(collection(db, 'wallets'));
  for (const d of walletsSnap.docs) {
    await deleteDoc(d.ref);
  }

  // Clear and re-seed menu
  const menuSnap = await getDocs(collection(db, 'menu'));
  for (const d of menuSnap.docs) {
    await deleteDoc(d.ref);
  }
  await seedMenu();
}

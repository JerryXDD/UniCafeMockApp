// Shared constants across the app

export const MENU_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { id: 'lunch', label: 'Lunch', emoji: '🍛' },
  { id: 'snacks', label: 'Snacks', emoji: '🍿' },
  { id: 'beverages', label: 'Drinks', emoji: '🥤' },
] as const;

export type CategoryId = typeof MENU_CATEGORIES[number]['id'];

export const WALLET_TOPUP_AMOUNTS = [500, 1000, 2000, 5000] as const;

export const STAFF_CREDENTIALS = {
  email: 'staff@campusbites.pk',
  password: 'campus123',
} as const;

export const ORDER_STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'ready', label: 'Ready' },
  { id: 'picked_up', label: 'Picked Up' },
] as const;

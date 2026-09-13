import { useState, useEffect } from 'react';
import { MenuItem, Order } from '../types';
import { subscribeToMenu, subscribeToAllOrders, updateOrderStatus, toggleMenuItemAvailability, addMenuItem, deleteMenuItem, seedMenu } from '../store';
import { Clock, CheckCircle, ChefHat, Package, Plus, Trash2, ToggleLeft, ToggleRight, TrendingUp } from 'lucide-react';

type StaffPage = 'dashboard' | 'orders' | 'menu';

interface StaffViewProps {
  onSwitchRole: () => void;
}

export default function StaffView({ onSwitchRole }: StaffViewProps) {
  const [page, setPage] = useState<StaffPage>('dashboard');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: 'snacks' as MenuItem['category'], prepTime: '5' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubMenu: (() => void) | undefined;
    let unsubOrders: (() => void) | undefined;

    const init = async () => {
      await seedMenu();
      unsubMenu = subscribeToMenu(setMenu);
      unsubOrders = subscribeToAllOrders(setOrders);
      setLoading(false);
    };

    init();

    return () => {
      unsubMenu?.();
      unsubOrders?.();
    };
  }, []);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const todayRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus);
  };

  const handleToggleAvailability = async (itemId: string) => {
    await toggleMenuItemAvailability(itemId);
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) return;
    await addMenuItem({
      name: newItem.name,
      description: newItem.description,
      price: parseInt(newItem.price),
      category: newItem.category,
      available: true,
      prepTime: parseInt(newItem.prepTime) || 5,
    });
    setNewItem({ name: '', description: '', price: '', category: 'snacks', prepTime: '5' });
    setShowAddForm(false);
  };

  const handleRemoveItem = async (itemId: string) => {
    await deleteMenuItem(itemId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-5 rounded-b-3xl shadow-lg mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">👨‍🍳 Staff Dashboard</h1>
            <p className="text-purple-200 text-sm">Campus Cafeteria Management</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-green-300 bg-white/20 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
              Live
            </div>
            <button onClick={onSwitchRole} className="p-2 bg-white/20 rounded-xl hover:bg-white/30" title="Switch Role">
              <span className="text-sm">🔄</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pages */}
      {page === 'dashboard' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-yellow-400">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-500">Pending</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{pendingOrders.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-blue-400">
              <div className="flex items-center gap-2 mb-1">
                <ChefHat className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500">Preparing</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{preparingOrders.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-green-400">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500">Ready</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{readyOrders.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-purple-400">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-500">Revenue</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">Rs. {todayRevenue}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <h3 className="font-semibold text-gray-700 mb-3">Active Orders</h3>
          {orders.filter(o => o.status !== 'picked_up').length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl shadow-sm">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No active orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.filter(o => o.status !== 'picked_up').map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-gray-800">{order.studentName}</span>
                      <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {order.items.map(i => `${i.menuItem.name} x${i.quantity}`).join(', ')}
                  </p>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'preparing')}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'ready')}
                        className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'picked_up')}
                        className="flex-1 bg-gray-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-gray-600 transition-colors"
                      >
                        Confirm Pickup
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {page === 'orders' && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">All Orders</h2>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-gray-800">{order.studentName}</span>
                      <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'ready' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {order.status === 'picked_up' ? '✓ Picked Up' : order.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">Rs. {order.total}</p>
                      <p className="text-xs text-gray-400">{order.paymentMethod}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {order.items.map(i => `${i.menuItem.name} x${i.quantity}`).join(', ')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString()} • Pickup: {order.estimatedPickup}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {page === 'menu' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Menu Management</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {/* Add Item Form */}
          {showAddForm && (
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 border-2 border-purple-200">
              <h3 className="font-semibold text-gray-700 mb-3">New Menu Item</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Item name"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newItem.description}
                  onChange={e => setNewItem({...newItem, description: e.target.value})}
                  className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Price (Rs.)"
                    value={newItem.price}
                    onChange={e => setNewItem({...newItem, price: e.target.value})}
                    className="border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                  <select
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value as MenuItem['category']})}
                    className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="beverages">Beverages</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Prep (min)"
                    value={newItem.prepTime}
                    onChange={e => setNewItem({...newItem, prepTime: e.target.value})}
                    className="border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                <button
                  onClick={handleAddItem}
                  className="w-full bg-purple-600 text-white py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors"
                >
                  Add to Menu
                </button>
              </div>
            </div>
          )}

          {/* Menu Items List */}
          <div className="space-y-2">
            {menu.map(item => (
              <div key={item.id} className={`bg-white rounded-xl p-3 shadow-sm flex items-center gap-3 ${!item.available ? 'opacity-60' : ''}`}>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-emerald-600 font-medium">Rs. {item.price}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.category}</span>
                    <span className="text-xs text-gray-400">{item.prepTime}min</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleAvailability(item.id)}
                  className="p-1"
                  title={item.available ? 'Mark unavailable' : 'Mark available'}
                >
                  {item.available ? (
                    <ToggleRight className="w-7 h-7 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-2xl mx-auto flex justify-around py-2">
          <button onClick={() => setPage('dashboard')} className={`flex flex-col items-center py-1 px-4 ${page === 'dashboard' ? 'text-purple-600' : 'text-gray-500'}`}>
            <span className="text-xl">📊</span>
            <span className="text-xs mt-1 font-medium">Dashboard</span>
          </button>
          <button onClick={() => setPage('orders')} className={`flex flex-col items-center py-1 px-4 relative ${page === 'orders' ? 'text-purple-600' : 'text-gray-500'}`}>
            <div className="relative">
              <span className="text-xl">📦</span>
              {pendingOrders.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{pendingOrders.length}</span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">Orders</span>
          </button>
          <button onClick={() => setPage('menu')} className={`flex flex-col items-center py-1 px-4 ${page === 'menu' ? 'text-purple-600' : 'text-gray-500'}`}>
            <span className="text-xl">📝</span>
            <span className="text-xs mt-1 font-medium">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}

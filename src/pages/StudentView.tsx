import { useState, useEffect, useRef } from 'react';
import { MenuItem, CartItem, Wallet, Order } from '../types';
import { subscribeToMenu, subscribeToStudentOrders, subscribeToWallet, addOrder, updateWalletBalance, addWalletFunds, seedMenu } from '../store';
import { useAuth } from '../AuthContext';
import { ShoppingCart, Clock, CheckCircle, ChefHat, Wallet as WalletIcon, Plus, Minus, Trash2, ArrowLeft, CreditCard, Banknote, LogOut, Bell, X } from 'lucide-react';
import { requestNotificationPermission, sendBrowserNotification, getStatusChangeMessage } from '../notifications';

type StudentPage = 'menu' | 'cart' | 'checkout' | 'orders' | 'wallet';

interface StudentViewProps {
  onSwitchRole: () => void;
}

export default function StudentView({ onSwitchRole }: StudentViewProps) {
  const { user, logout } = useAuth();
  const [page, setPage] = useState<StudentPage>('menu');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, studentName: user?.displayName || 'Student' });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Notification states
  const [notifications, setNotifications] = useState<Array<{id: string; title: string; body: string; emoji: string; timestamp: number}>>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const prevOrdersRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!user) return;

    let unsubMenu: (() => void) | undefined;
    let unsubOrders: (() => void) | undefined;
    let unsubWallet: (() => void) | undefined;

    const init = async () => {
      await seedMenu();
      requestNotificationPermission();
      unsubMenu = subscribeToMenu(setMenu);
      unsubOrders = subscribeToStudentOrders(user.uid, setOrders);
      unsubWallet = subscribeToWallet(user.uid, setWallet);
      setLoading(false);
    };

    init();

    return () => {
      unsubMenu?.();
      unsubOrders?.();
      unsubWallet?.();
    };
  }, [user]);

  // Watch for order status changes and trigger notifications
  useEffect(() => {
    if (orders.length === 0) return;

    orders.forEach(order => {
      const prevStatus = prevOrdersRef.current.get(order.id);
      
      if (prevStatus && prevStatus !== order.status) {
        const message = getStatusChangeMessage(prevStatus, order.status);
        
        if (message) {
          const newNotification = {
            id: `${order.id}-${Date.now()}`,
            title: message.title,
            body: message.body,
            emoji: message.emoji,
            timestamp: Date.now(),
          };
          
          setNotifications(prev => [newNotification, ...prev].slice(0, 10));
          sendBrowserNotification(message.title, message.body);
          
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
          }, 5000);
        }
      }
      
      prevOrdersRef.current.set(order.id, order.status);
    });
  }, [orders]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) {
        return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.menuItem.id === itemId) {
        const newQty = c.quantity + delta;
        return newQty > 0 ? { ...c, quantity: newQty } : c;
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const filteredMenu = selectedCategory === 'all' 
    ? menu 
    : menu.filter(item => item.category === selectedCategory);

  const placeOrder = async (paymentMethod: 'wallet' | 'cash') => {
    if (!user) return;

    if (paymentMethod === 'wallet') {
      if (wallet.balance < cartTotal) {
        alert('Insufficient wallet balance! Please top up.');
        return;
      }
      await updateWalletBalance(user.uid, wallet.balance - cartTotal);
    }

    const maxPrepTime = Math.max(...cart.map(c => c.menuItem.prepTime));
    const estimatedPickup = new Date(Date.now() + maxPrepTime * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    await addOrder({
      userId: user.uid,
      studentName: user.displayName || 'Student',
      items: cart,
      total: cartTotal,
      paymentMethod,
      status: 'pending',
      estimatedPickup,
    });

    setCart([]);
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setPage('orders');
    }, 2000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500">Loading Campus Bites...</p>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-20 h-20 bg-emerald-950 border border-emerald-800 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Order Placed!</h2>
        <p className="text-gray-400">Your order has been sent to the kitchen</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Toast Notifications */}
      <div className="fixed top-4 left-4 right-4 z-50 space-y-2 pointer-events-none">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className="bg-gray-900 border border-gray-700 border-l-4 border-l-emerald-500 shadow-2xl rounded-xl p-4 pointer-events-auto animate-slide-up flex items-start gap-3"
          >
            <span className="text-2xl">{notif.emoji}</span>
            <div className="flex-1">
              <h4 className="font-bold text-gray-100 text-sm">{notif.title}</h4>
              <p className="text-xs text-gray-400 mt-0.5">{notif.body}</p>
            </div>
            <button onClick={() => dismissNotification(notif.id)} className="text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 rounded-b-3xl shadow-lg mb-4 border-b border-emerald-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">🍽️ Campus Bites</h1>
            <p className="text-emerald-200 text-sm">Assalam o Alaikum, {user?.displayName || 'Student'}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-1 border border-white/10">
              <WalletIcon className="w-4 h-4" />
              <span className="font-semibold text-sm">Rs. {wallet.balance}</span>
            </div>
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 relative border border-white/10"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {/* Notification Panel */}
              {showNotificationPanel && (
                <div className="absolute right-0 top-12 w-80 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 z-50 overflow-hidden">
                  <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-gray-100 text-sm">Notifications</h3>
                    <button onClick={() => setShowNotificationPanel(false)} className="text-gray-400 hover:text-gray-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="px-4 py-3 border-b border-gray-800 hover:bg-gray-800/50 flex items-start gap-3">
                          <span className="text-xl">{notif.emoji}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-100 text-sm">{notif.title}</h4>
                            <p className="text-xs text-gray-400 mt-0.5">{notif.body}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notif.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <button onClick={() => dismissNotification(notif.id)} className="text-gray-600 hover:text-gray-300">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button onClick={onSwitchRole} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 border border-white/10" title="Switch Role">
              <span className="text-sm">🔄</span>
            </button>
            <button onClick={logout} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 border border-white/10" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pages */}
      {page === 'menu' && (
        <div>
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-3 px-1 mb-4 scrollbar-hide">
            {['all', 'breakfast', 'lunch', 'snacks', 'beverages'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {cat === 'all' ? '🍽️ All' : cat === 'breakfast' ? '🌅 Breakfast' : cat === 'lunch' ? '🍛 Lunch' : cat === 'snacks' ? '🍿 Snacks' : '🥤 Drinks'}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {filteredMenu.map(item => (
              <div key={item.id} className={`bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-800 ${!item.available ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-100">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-emerald-400 font-bold">Rs. {item.price}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.prepTime} min
                      </span>
                    </div>
                  </div>
                  {item.available ? (
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-md"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  ) : (
                    <span className="text-xs bg-red-950 text-red-400 px-3 py-1 rounded-full font-medium border border-red-900">Unavailable</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'cart' && (
        <div>
          <button onClick={() => setPage('menu')} className="flex items-center gap-2 text-gray-400 mb-4 hover:text-gray-200">
            <ArrowLeft className="w-5 h-5" /> Back to Menu
          </button>
          <h2 className="text-xl font-bold text-gray-100 mb-4">Your Cart</h2>
          
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {cart.map(item => (
                  <div key={item.menuItem.id} className="bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-800 flex items-center gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-100">{item.menuItem.name}</h4>
                      <p className="text-emerald-400 font-semibold text-sm">Rs. {item.menuItem.price * item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.menuItem.id, -1)} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 border border-gray-700">
                        <Minus className="w-4 h-4 text-gray-300" />
                      </button>
                      <span className="font-semibold w-6 text-center text-gray-100">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuItem.id, 1)} className="w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center hover:bg-emerald-900 border border-emerald-800">
                        <Plus className="w-4 h-4 text-emerald-400" />
                      </button>
                      <button onClick={() => removeFromCart(item.menuItem.id)} className="w-8 h-8 rounded-full bg-red-950 flex items-center justify-center hover:bg-red-900 ml-2 border border-red-900">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400">Total</span>
                  <span className="text-xl font-bold text-emerald-400">Rs. {cartTotal}</span>
                </div>
                <button
                  onClick={() => setPage('checkout')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md"
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {page === 'checkout' && (
        <div>
          <button onClick={() => setPage('cart')} className="flex items-center gap-2 text-gray-400 mb-4 hover:text-gray-200">
            <ArrowLeft className="w-5 h-5" /> Back to Cart
          </button>
          <h2 className="text-xl font-bold text-gray-100 mb-4">Payment</h2>
          
          <div className="bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-800 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Items ({cartCount})</span>
              <span className="font-medium text-gray-200">Rs. {cartTotal}</span>
            </div>
            <div className="border-t border-gray-800 pt-2 mt-2 flex justify-between">
              <span className="font-bold text-gray-100">Total</span>
              <span className="font-bold text-emerald-400 text-lg">Rs. {cartTotal}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => placeOrder('wallet')}
              className="w-full bg-gray-900 border border-emerald-800 rounded-2xl p-4 flex items-center gap-4 hover:bg-emerald-950 transition-all"
            >
              <div className="w-12 h-12 bg-emerald-950 border border-emerald-800 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-100">Pay with Wallet</h4>
                <p className="text-sm text-gray-500">Balance: Rs. {wallet.balance}</p>
              </div>
            </button>

            <button
              onClick={() => placeOrder('cash')}
              className="w-full bg-gray-900 border border-amber-800 rounded-2xl p-4 flex items-center gap-4 hover:bg-amber-950 transition-all"
            >
              <div className="w-12 h-12 bg-amber-950 border border-amber-800 rounded-xl flex items-center justify-center">
                <Banknote className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-100">Pay Cash at Counter</h4>
                <p className="text-sm text-gray-500">Pay when you pick up</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {page === 'orders' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-100">My Orders</h2>
            <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Live
            </div>
          </div>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-800">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                        order.status === 'preparing' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                        order.status === 'ready' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                        {order.status === 'pending' ? '⏳ Pending' :
                         order.status === 'preparing' ? '👨‍🍳 Preparing' :
                         order.status === 'ready' ? '✅ Ready for Pickup' :
                         '📦 Picked Up'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    {order.items.map(i => `${i.menuItem.name} x${i.quantity}`).join(', ')}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pickup: {order.estimatedPickup}
                    </span>
                    <span className="font-bold text-emerald-400">Rs. {order.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {page === 'wallet' && (
        <div>
          <button onClick={() => setPage('menu')} className="flex items-center gap-2 text-gray-400 mb-4 hover:text-gray-200">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <h2 className="text-xl font-bold text-gray-100 mb-4">My Wallet</h2>
          
          <div className="bg-gradient-to-br from-emerald-700 to-teal-800 rounded-2xl p-6 text-white mb-6 shadow-lg border border-emerald-600">
            <p className="text-emerald-200 text-sm">Available Balance</p>
            <p className="text-3xl font-bold mt-1">Rs. {wallet.balance}</p>
            <p className="text-emerald-200 text-sm mt-3">{user?.displayName || 'Student'}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-300">Top Up Wallet</h3>
            {[500, 1000, 2000, 5000].map(amount => (
              <button
                key={amount}
                onClick={() => user && addWalletFunds(user.uid, amount)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 flex justify-between items-center hover:border-emerald-700 hover:bg-emerald-950 transition-all"
              >
                <span className="font-medium text-gray-200">Add Rs. {amount}</span>
                <Plus className="w-5 h-5 text-emerald-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 shadow-lg">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          <NavButton icon={<span className="text-xl">🍽️</span>} label="Menu" active={page === 'menu'} onClick={() => setPage('menu')} />
          <NavButton icon={<span className="text-xl">📋</span>} label="Orders" active={page === 'orders'} onClick={() => setPage('orders')} badge={orders.filter(o => o.status !== 'picked_up').length || undefined} />
          <button onClick={() => setPage('cart')} className="relative flex flex-col items-center py-1 px-3">
            <div className="relative">
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
              )}
            </div>
            <span className={`text-xs mt-1 ${page === 'cart' ? 'text-emerald-400 font-semibold' : 'text-gray-500'}`}>Cart</span>
          </button>
          <NavButton icon={<span className="text-xl">💰</span>} label="Wallet" active={page === 'wallet'} onClick={() => setPage('wallet')} />
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick, badge }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick} className="relative flex flex-col items-center py-1 px-3">
      <div className="relative">
        {icon}
        {badge && (
          <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{badge}</span>
        )}
      </div>
      <span className={`text-xs mt-1 ${active ? 'text-emerald-400 font-semibold' : 'text-gray-500'}`}>{label}</span>
    </button>
  );
}

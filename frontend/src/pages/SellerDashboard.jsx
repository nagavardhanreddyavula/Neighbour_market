import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosConfig';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [shop, setShop] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products' | 'analytics'
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Form State for new product
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    stock_quantity: 10,
    category: 1,
    image_url: ''
  });

  // Mock Sales Data for Analytics Chart
  const salesData = [
    { day: 'Mon', revenue: 1420 },
    { day: 'Tue', revenue: 2100 },
    { day: 'Wed', revenue: 1850 },
    { day: 'Thu', revenue: 3200 },
    { day: 'Fri', revenue: 4100 },
    { day: 'Sat', revenue: 5400 },
    { day: 'Sun', revenue: 4800 },
  ];
  const maxRevenue = Math.max(...salesData.map(d => d.revenue));

  useEffect(() => {
    fetchVendorShop();
    fetchOrders();
    fetchVendorProducts();
  }, [user]);

  const fetchVendorShop = async () => {
    try {
      const res = await axiosInstance.get('shops/my_shop/');
      setShop(res.data);
    } catch (err) {
      console.warn('Could not fetch shop profile');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('orders/');
      setOrders(res.data);
    } catch (err) {
      console.warn('Failed to load orders, setting fallback orders');
      setOrders([
        {
          id: 1001,
          buyer_name: 'Rahul Sharma',
          buyer_phone: '+91 9876543210',
          status: 'Pending',
          total_price: '535.00',
          shipping_address: 'Flat 402, Sunshine Apartments, Indiranagar, Bangalore',
          items: [{ product_title: 'Organic A2 Desi Cow Milk 1L', quantity: 2, unit_price: '85.00' }],
          created_at: new Date().toISOString()
        },
        {
          id: 1002,
          buyer_name: 'Priya Patel',
          buyer_phone: '+91 9812345678',
          status: 'Processing',
          total_price: '450.00',
          shipping_address: '12th Main, 4th Cross, Koramangala, Bangalore',
          items: [{ product_title: 'Fresh Alphonso Mangoes (1kg)', quantity: 1, unit_price: '450.00' }],
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    }
  };

  const fetchVendorProducts = async () => {
    try {
      const res = await axiosInstance.get(`products/?seller_id=${user?.id}`);
      setProducts(res.data);
    } catch (err) {
      console.warn('Failed to fetch vendor products');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosInstance.patch(`orders/${orderId}/update_status/`, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      // Local fallback state update
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('products/', newProduct);
      setProducts([res.data, ...products]);
      setShowAddProductModal(false);
      setNewProduct({ title: '', description: '', price: '', stock_quantity: 10, category: 1, image_url: '' });
    } catch (err) {
      alert('Error creating product. Please verify fields.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
            🏪
          </div>
          <div>
            <h1 className="font-extrabold text-2xl text-slate-900 dark:text-slate-100">
              {shop?.name || `${user?.username}'s Vendor Store`}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Location: {shop?.address || 'Indiranagar, Bangalore'} • Delivery Radius: {shop?.delivery_radius_km || 10} km
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddProductModal(true)}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition flex items-center justify-center gap-2"
        >
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'orders', label: 'Active Orders', icon: '📦' },
          { id: 'products', label: 'Product Inventory', icon: '🏷️' },
          { id: 'analytics', label: 'Sales Analytics', icon: '📊' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Orders Table */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-800 dark:text-slate-100">Customer Orders</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              {orders.length} Total Orders
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      #{order.id}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{order.buyer_name}</div>
                      <div className="text-xs text-slate-500">{order.buyer_phone}</div>
                      <div className="text-[11px] text-slate-400 max-w-xs truncate">{order.shipping_address}</div>
                    </td>
                    <td className="py-4 px-4">
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-slate-700 dark:text-slate-300">
                          • {item.product_title} <span className="font-bold">x{item.quantity}</span>
                        </div>
                      ))}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                      ₹{order.total_price}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-transparent focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Products Inventory */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => (
            <div key={prod.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex gap-4 shadow-sm">
              <img src={prod.image_url} alt="" className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{prod.title}</h4>
                <div className="text-xs text-slate-500 mt-1">Stock: <span className="font-bold">{prod.stock_quantity} units</span></div>
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">₹{prod.price}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Mock Analytics Chart */}
      {activeTab === 'analytics' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Weekly Revenue Analytics</h3>
            <p className="text-xs text-slate-500">Track order sales revenue in Bangalore neighbourhood stores</p>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4 border-b border-slate-100 dark:border-slate-800">
            {salesData.map((item, index) => {
              const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{item.revenue}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                  ></div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-400 font-medium">Total Sales</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹22,870</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-400 font-medium">Avg Order Value</span>
              <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">₹485</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-400 font-medium">Fulfillment Rate</span>
              <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-1">98.4%</div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Add New Product</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-sm"
                  placeholder="e.g. Fresh Homemade Paneer (200g)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-sm"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-sm"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Description</label>
                <textarea
                  rows="3"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-sm"
                  placeholder="Describe your fresh product..."
                ></textarea>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

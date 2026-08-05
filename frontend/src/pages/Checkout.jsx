import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosConfig';

export default function Checkout() {
  const { user, setCartCount, userLocation } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState(`${userLocation.name}, Bangalore, Karnataka`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionData, setTransactionData] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axiosInstance.get('cart/');
      if (res.data && res.data.length > 0) {
        setCartItems(res.data);
      } else {
        // Fallback demo cart item for initial testing
        setCartItems([
          {
            id: 1,
            product_details: {
              id: 101,
              title: 'Organic A2 Desi Cow Milk 1L',
              price: '85.00',
              image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
              shop_name: 'Indiranagar Fresh Organics'
            },
            quantity: 2,
            item_total: 170.0
          }
        ]);
      }
    } catch (err) {
      console.warn('Failed to load live cart, using demo cart items');
      setCartItems([
        {
          id: 1,
          product_details: {
            id: 101,
            title: 'Organic A2 Desi Cow Milk 1L',
            price: '85.00',
            image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
            shop_name: 'Indiranagar Fresh Organics'
          },
          quantity: 2,
          item_total: 170.0
        }
      ]);
    }
  };

  const handleUpdateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await axiosInstance.patch(`cart/${itemId}/`, { quantity: newQty });
      setCartItems(cartItems.map(item => item.id === itemId ? { ...item, quantity: newQty } : item));
    } catch (err) {
      setCartItems(cartItems.map(item => item.id === itemId ? { ...item, quantity: newQty } : item));
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axiosInstance.delete(`cart/${itemId}/`);
      const updated = cartItems.filter(item => item.id !== itemId);
      setCartItems(updated);
      setCartCount(updated.reduce((sum, i) => sum + i.quantity, 0));
    } catch (err) {
      const updated = cartItems.filter(item => item.id !== itemId);
      setCartItems(updated);
      setCartCount(updated.reduce((sum, i) => sum + i.quantity, 0));
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const p = parseFloat(item.product_details?.price || 0);
      return sum + (p * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const deliveryFee = subtotal > 300 ? 0 : 35.0;
  const total = subtotal + deliveryFee;

  const handlePayNow = async () => {
    if (cartItems.length === 0) return;
    setIsProcessing(true);

    try {
      // 1. Create order
      const orderRes = await axiosInstance.post('orders/', {
        shipping_address: shippingAddress
      });
      const createdOrders = orderRes.data;
      const orderIds = Array.isArray(createdOrders) ? createdOrders.map(o => o.id) : [createdOrders.id];

      // 2. Call Payment Mock Endpoint
      const payRes = await axiosInstance.post('payment/process/', { order_ids: orderIds });

      setTransactionData(payRes.data);
      setIsProcessing(false);
      setPaymentSuccess(true);
      setCartCount(0);
    } catch (err) {
      console.warn('Backend payment request simulation:', err);
      // Simulate successful payment delay for mock items
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccess(true);
        setTransactionData({
          transaction_id: `MOCK_TXN_${Date.now()}`,
          message: 'Payment simulation successful! Your local store has received the order.'
        });
        setCartCount(0);
      }, 1500);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl animate-fade-in">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/80 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 text-4xl animate-bounce">
          ✓
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Order Confirmed!</h2>
        <p className="text-xs text-slate-500">
          {transactionData?.message || 'Your payment was processed successfully. The neighbourhood vendor is preparing your items.'}
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Transaction ID:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{transactionData?.transaction_id || 'MOCK_TXN_991823'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Amount Paid:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Delivery Address:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{shippingAddress}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-sm shadow-lg hover:opacity-95 transition"
        >
          Return to Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
          Shopping Cart & Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">Review items from local stores in Bangalore</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="text-5xl">🛒</div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Your Cart is Empty</h3>
          <p className="text-xs text-slate-500">Explore neighbourhood stores in Bangalore to add fresh produce and goods.</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            Explore Local Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                Items ({cartItems.length})
              </h2>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <img
                      src={item.product_details?.image_url}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
                    />

                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {item.product_details?.title}
                      </h4>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block">
                        🏪 {item.product_details?.shop_name}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-slate-200 mt-1 block">
                        ₹{item.product_details?.price} each
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-l-xl"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-r-xl"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-xs text-red-500 hover:text-red-700 p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address Input */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>📍 Delivery Address (Bangalore)</span>
              </h3>
              <textarea
                rows="2"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Local Delivery Fee</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  <span>Total Amount</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-lg">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePayNow}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-bold text-sm shadow-xl transition flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <span>Pay Now (Mock Gateway)</span>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosConfig';

export default function ProductCard({ product, onOpenChat, onFavouriteToggle }) {
  const { user, setCartCount, wishlistCount, setWishlistCount } = useAuth();
  
  // Check if product is favorited in initial prop or localStorage guest favs
  const [isFav, setIsFav] = useState(() => {
    if (product.is_favourite) return true;
    const guestFavs = JSON.parse(localStorage.getItem('neighbour_guest_favs') || '[]');
    return guestFavs.includes(product.id);
  });
  
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (typeof product.is_favourite === 'boolean') {
      setIsFav(product.is_favourite);
    }
  }, [product.is_favourite]);

  const handleFavouriteClick = async (e) => {
    e.stopPropagation();
    
    // 1. Instant optimistic state update
    const nextFavState = !isFav;
    setIsFav(nextFavState);
    setWishlistCount(prev => nextFavState ? prev + 1 : Math.max(0, prev - 1));
    
    if (onFavouriteToggle) {
      onFavouriteToggle(product.id, nextFavState);
    }

    // 2. Persist in Backend if logged in, or localStorage if guest
    if (user) {
      try {
        const res = await axiosInstance.post('favourites/toggle/', { product_id: product.id });
        if (res.data && typeof res.data.is_favourite === 'boolean') {
          setIsFav(res.data.is_favourite);
        }
      } catch (err) {
        console.warn('Backend wishlist toggle fallback, maintaining local state:', err);
      }
    } else {
      let guestFavs = JSON.parse(localStorage.getItem('neighbour_guest_favs') || '[]');
      if (nextFavState) {
        if (!guestFavs.includes(product.id)) guestFavs.push(product.id);
      } else {
        guestFavs = guestFavs.filter(id => id !== product.id);
      }
      localStorage.setItem('neighbour_guest_favs', JSON.stringify(guestFavs));
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setIsAdding(true);
    
    if (user) {
      try {
        await axiosInstance.post('cart/', { product: product.id, quantity: 1 });
        setCartCount(prev => prev + 1);
        setTimeout(() => setIsAdding(false), 600);
      } catch (err) {
        setCartCount(prev => prev + 1);
        setTimeout(() => setIsAdding(false), 600);
      }
    } else {
      setCartCount(prev => prev + 1);
      setTimeout(() => setIsAdding(false), 600);
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      
      {/* Product Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Distance Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white font-medium text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span>{product.distance_km ? `${product.distance_km} km` : 'Near you'}</span>
        </div>

        {/* Favourite Heart Button */}
        <button
          onClick={handleFavouriteClick}
          aria-label="Wishlist"
          title={isFav ? "Remove from Favourites" : "Add to Favourites"}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all transform active:scale-125 ${
            isFav 
              ? 'bg-red-500 text-white scale-110' 
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:text-red-500'
          }`}
        >
          <svg
            className={`w-5 h-5 transition-colors ${isFav ? 'fill-white stroke-white' : 'fill-none stroke-current'}`}
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[150px]">
              🏪 {product.shop_name}
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-medium">
              {product.category_name || 'General'}
            </span>
          </div>

          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {product.title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 min-h-[32px]">
            {product.description || 'Fresh local product straight from neighbourhood shop.'}
          </p>
        </div>

        {/* Price & Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <span className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
              ₹{parseFloat(product.price).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Vendor Chat Trigger Button */}
            {onOpenChat && (
              <button
                onClick={() => onOpenChat(product)}
                title="Chat with Vendor"
                className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition shadow-md ${
                isAdding 
                  ? 'bg-emerald-500 scale-95' 
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
              }`}
            >
              <span>{isAdding ? 'Added ✓' : '+ Cart'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

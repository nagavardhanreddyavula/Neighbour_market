import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import DistanceFilter from '../components/DistanceFilter';
import ChatModal from '../components/ChatModal';

export default function BuyerHome() {
  const { userLocation, detectLocation, isDetectingLocation } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedRadius, setSelectedRadius] = useState(15);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(() => searchParams.get('filter') === 'favourites');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Chat state
  const [chatProduct, setChatProduct] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Comprehensive fallback products for Bangalore
  const mockBangaloreProducts = [
    {
      id: 101,
      title: 'Organic A2 Desi Cow Milk 1L',
      description: 'Fresh farm-sourced unpasteurized organic milk delivered daily in Indiranagar.',
      price: 85.0,
      stock_quantity: 30,
      image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
      shop_name: 'Indiranagar Fresh Organics',
      shop_owner_id: 2,
      category_name: 'Groceries',
      distance_km: 1.2,
      is_favourite: false
    },
    {
      id: 102,
      title: 'Cold-Pressed Groundnut Oil 1L',
      description: 'Traditional wood-pressed pure unrefined groundnut cooking oil.',
      price: 240.0,
      stock_quantity: 15,
      image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
      shop_name: 'Indiranagar Fresh Organics',
      shop_owner_id: 2,
      category_name: 'Groceries',
      distance_km: 1.4,
      is_favourite: false
    },
    {
      id: 103,
      title: 'Artisanal Sourdough Bread',
      description: 'Freshly baked whole-wheat sourdough loaf from Koramangala wood-fired bakery.',
      price: 180.0,
      stock_quantity: 20,
      image_url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
      shop_name: 'Koramangala Crust & Co',
      shop_owner_id: 3,
      category_name: 'Bakery',
      distance_km: 3.4,
      is_favourite: true
    },
    {
      id: 104,
      title: 'Belgian Dark Chocolate Croissant (Pack of 2)',
      description: 'Flaky buttery croissants filled with premium 70% dark chocolate.',
      price: 220.0,
      stock_quantity: 18,
      image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
      shop_name: 'Koramangala Crust & Co',
      shop_owner_id: 3,
      category_name: 'Bakery',
      distance_km: 3.5,
      is_favourite: false
    },
    {
      id: 105,
      title: 'Fresh Alphonso Mangoes (1kg)',
      description: 'Directly harvested sweet Ratnagiri Alphonso mangoes in HSR Layout.',
      price: 450.0,
      stock_quantity: 50,
      image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
      shop_name: 'HSR Fruit Bazaar',
      shop_owner_id: 4,
      category_name: 'Fresh Produce',
      distance_km: 4.8,
      is_favourite: false
    },
    {
      id: 106,
      title: 'South Indian Filter Coffee Blend (500g)',
      description: 'Authentic 80:20 roasted Chicory blend from Chikmagalur coffee estates.',
      price: 275.0,
      stock_quantity: 35,
      image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
      shop_name: 'Jayanagar Heritage Coffee',
      shop_owner_id: 5,
      category_name: 'Beverages',
      distance_km: 6.2,
      is_favourite: false
    },
    {
      id: 107,
      title: 'Special Ghee Mysore Pak (400g Box)',
      description: 'Melt-in-mouth traditional South Indian sweet prepared with pure cow ghee.',
      price: 380.0,
      stock_quantity: 25,
      image_url: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80',
      shop_name: 'Jayanagar Heritage Coffee',
      shop_owner_id: 5,
      category_name: 'Sweets & Snacks',
      distance_km: 6.3,
      is_favourite: false
    },
    {
      id: 108,
      title: 'Fresh Homemade Malai Paneer (200g)',
      description: 'Soft unpreserved cottage cheese made daily using fresh cow milk in Malleshwaram.',
      price: 115.0,
      stock_quantity: 40,
      image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
      shop_name: 'Malleshwaram Traditional Dairy',
      shop_owner_id: 6,
      category_name: 'Groceries',
      distance_km: 7.1,
      is_favourite: false
    },
    {
      id: 109,
      title: 'Hydroponic Salad Box & Microgreens',
      description: 'Soil-less pesticide-free clean greens grown locally in Whitefield vertical farms.',
      price: 140.0,
      stock_quantity: 30,
      image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
      shop_name: 'Whitefield Hydroponic Greens',
      shop_owner_id: 7,
      category_name: 'Fresh Produce',
      distance_km: 12.5,
      is_favourite: false
    }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setShowFavouritesOnly(searchParams.get('filter') === 'favourites');
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [userLocation, selectedRadius, selectedCategory, showFavouritesOnly, searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('categories/');
      setCategories(res.data);
    } catch (err) {
      setCategories([
        { id: 1, name: 'Groceries', slug: 'groceries' },
        { id: 2, name: 'Fresh Produce', slug: 'fresh-produce' },
        { id: 3, name: 'Bakery', slug: 'bakery' },
        { id: 4, name: 'Beverages', slug: 'beverages' },
        { id: 5, name: 'Household', slug: 'household' },
        { id: 6, name: 'Sweets & Snacks', slug: 'sweets-snacks' },
      ]);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = {
        lat: userLocation.lat,
        lon: userLocation.lon,
        max_distance: selectedRadius,
      };
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const res = await axiosInstance.get('products/', { params });
      let loaded = (res.data && res.data.length > 0) ? res.data : mockBangaloreProducts;

      // Filter by radius & category locally if fallback
      loaded = loaded.filter(p => p.distance_km <= selectedRadius);
      if (searchQuery) {
        loaded = loaded.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
      }

      // Guest favourites check
      const guestFavs = JSON.parse(localStorage.getItem('neighbour_guest_favs') || '[]');
      loaded = loaded.map(p => ({
        ...p,
        is_favourite: p.is_favourite || guestFavs.includes(p.id)
      }));

      // Filter favourites if active
      if (showFavouritesOnly) {
        loaded = loaded.filter(p => p.is_favourite);
      }

      setProducts(loaded);
    } catch (err) {
      let loaded = mockBangaloreProducts.filter(p => p.distance_km <= selectedRadius);
      if (searchQuery) {
        loaded = loaded.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      const guestFavs = JSON.parse(localStorage.getItem('neighbour_guest_favs') || '[]');
      loaded = loaded.map(p => ({
        ...p,
        is_favourite: p.is_favourite || guestFavs.includes(p.id)
      }));
      if (showFavouritesOnly) {
        loaded = loaded.filter(p => p.is_favourite);
      }
      setProducts(loaded);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChat = (product) => {
    setChatProduct(product);
    setIsChatOpen(true);
  };

  return (
    <div className="space-y-8">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
              ⚡ Hyper-Local Delivery in Bangalore
            </span>

            {/* GPS Location Detector Trigger Button */}
            <button
              onClick={detectLocation}
              disabled={isDetectingLocation}
              className="px-3.5 py-1 rounded-full bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-extrabold flex items-center gap-1.5 shadow transition"
            >
              <span className={isDetectingLocation ? 'animate-spin' : ''}>🎯</span>
              <span>{isDetectingLocation ? 'Detecting GPS...' : 'Detect My Location'}</span>
            </button>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
            Support Local Vendors Near <span className="underline decoration-emerald-400">{userLocation.name.split(',')[0]}</span>
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base">
            Discover fresh produce, daily groceries, and artisanal goods delivered to your doorstep within minutes from verified neighborhood stores.
          </p>

          {/* Search Bar */}
          <div className="pt-2 flex items-center gap-2 max-w-lg">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products or neighbourhood shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-slate-800 placeholder-slate-400 text-sm font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <svg className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Decorative Blur Circle */}
        <div className="absolute -right-12 -bottom-16 w-80 h-80 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none"></div>
      </div>

      {/* Distance Filter Control Component */}
      <DistanceFilter
        selectedRadius={selectedRadius}
        onRadiusChange={setSelectedRadius}
        totalCount={products.length}
      />

      {/* Category Pills & Favourites Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setShowFavouritesOnly(false);
            setSearchParams({});
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === null && !showFavouritesOnly
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Items
        </button>

        {/* Favourites Pill Filter */}
        <button
          onClick={() => {
            const nextState = !showFavouritesOnly;
            setShowFavouritesOnly(nextState);
            if (nextState) setSearchParams({ filter: 'favourites' });
            else setSearchParams({});
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            showFavouritesOnly
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-slate-800'
          }`}
        >
          <span>❤️</span>
          <span>Favourites Only</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setShowFavouritesOnly(false);
              setSearchParams({});
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id && !showFavouritesOnly
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="text-5xl mb-3">{showFavouritesOnly ? '❤️' : '📍'}</div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
            {showFavouritesOnly ? 'No favourite products saved yet' : `No products found within ${selectedRadius} km`}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {showFavouritesOnly ? 'Click the heart icon on any product to save it to your wishlist.' : 'Try expanding your delivery radius slider.'}
          </p>
          <button
            onClick={() => {
              setShowFavouritesOnly(false);
              setSelectedRadius(30);
              setSearchQuery('');
              setSelectedCategory(null);
              setSearchParams({});
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
          >
            Show All Nearby Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenChat={handleOpenChat}
              onFavouriteToggle={() => {
                if (showFavouritesOnly) fetchProducts();
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        product={chatProduct}
      />

    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout, cartCount, wishlistCount, userLocation, setUserLocation, detectLocation, isDetectingLocation } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const bangaloreLocations = [
    { name: 'Indiranagar, Bangalore', lat: 12.9784, lon: 77.6408 },
    { name: 'Koramangala, Bangalore', lat: 12.9352, lon: 77.6245 },
    { name: 'HSR Layout, Bangalore', lat: 12.9121, lon: 77.6446 },
    { name: 'Jayanagar, Bangalore', lat: 12.9250, lon: 77.5938 },
    { name: 'Whitefield, Bangalore', lat: 12.9698, lon: 77.7500 },
    { name: 'MG Road, Bangalore', lat: 12.9756, lon: 77.6066 },
    { name: 'Malleshwaram, Bangalore', lat: 13.0031, lon: 77.5644 },
    { name: 'Frazer Town, Bangalore', lat: 12.9972, lon: 77.6144 }
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Home Navigation */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              🛒
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Neighbour
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 ml-1 text-xl">
                Market
              </span>
            </div>
          </Link>

          {/* Explicit 🏠 Home Button */}
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition border border-transparent hover:border-emerald-300"
          >
            <span>🏠</span>
            <span className="hidden sm:inline-block">Home</span>
          </Link>

          {/* Location Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 hover:bg-emerald-100 transition shadow-sm"
            >
              <span className="text-sm">📍</span>
              <span className="max-w-[100px] sm:max-w-[160px] truncate">{userLocation.name.split(',')[0]}</span>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showLocationDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fade-in">
                <div className="px-3 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      detectLocation();
                      setShowLocationDropdown(false);
                    }}
                    disabled={isDetectingLocation}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    {isDetectingLocation ? (
                      <span>Locating...</span>
                    ) : (
                      <span>🎯 Detect My GPS Location</span>
                    )}
                  </button>
                </div>

                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Bangalore Neighbourhoods
                </div>
                {bangaloreLocations.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => {
                      setUserLocation({ ...loc, isDetected: false });
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition ${
                      userLocation.name === loc.name ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-slate-800/40' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{loc.name}</span>
                    {userLocation.name === loc.name && (
                      <span className="text-emerald-500 font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* ❤️ Wishlist Heart Button with Counter */}
          <Link
            to="/?filter=favourites"
            title="View Favourites"
            className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1"
          >
            <span className="text-base text-red-500">❤️</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] rounded-full bg-red-500 text-white font-bold text-xs flex items-center justify-center px-1 shadow-md">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon with Dynamic Badge */}
          <Link
            to="/checkout"
            className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center px-1 shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'seller' ? (
                <Link
                  to="/seller"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md transition"
                >
                  Vendor Portal
                </Link>
              ) : (
                <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Hi, {user.username}
                </span>
              )}

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-sm shadow-md hover:opacity-95 transition"
            >
              Sign In
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}

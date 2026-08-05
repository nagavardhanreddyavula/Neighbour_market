import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('neighbour_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('access_token') || null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(() => {
    const savedLoc = localStorage.getItem('neighbour_user_location');
    return savedLoc ? JSON.parse(savedLoc) : {
      name: 'Indiranagar, Bangalore',
      lat: 12.9784,
      lon: 77.6408,
      isDetected: false
    };
  });

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
      fetchCartAndWishlistCount();
    } else {
      setUser(null);
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem('neighbour_user_location', JSON.stringify(userLocation));
  }, [userLocation]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axiosInstance.get('auth/me/');
      setUser(response.data);
      localStorage.setItem('neighbour_user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const fetchCartAndWishlistCount = async () => {
    try {
      const [cartRes, favRes] = await Promise.all([
        axiosInstance.get('cart/'),
        axiosInstance.get('favourites/')
      ]);
      const totalCartQuantity = cartRes.data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalCartQuantity);
      setWishlistCount(favRes.data.length);
    } catch (error) {
      console.error('Error fetching cart/wishlist counts:', error);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc = {
          name: `Current Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
          lat: latitude,
          lon: longitude,
          isDetected: true
        };
        setUserLocation(newLoc);
        setIsDetectingLocation(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setIsDetectingLocation(false);
        alert('Could not detect location. Please check browser permissions or select a Bangalore neighborhood from the dropdown.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const login = async (username, password) => {
    const response = await axiosInstance.post('auth/token/', { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    setToken(access);

    const userRes = await axiosInstance.get('auth/me/', {
      headers: { Authorization: `Bearer ${access}` }
    });
    setUser(userRes.data);
    localStorage.setItem('neighbour_user', JSON.stringify(userRes.data));
    return userRes.data;
  };

  const register = async (userData) => {
    await axiosInstance.post('auth/register/', userData);
    return await login(userData.username, userData.password);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('neighbour_user');
    setToken(null);
    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      cartCount,
      setCartCount,
      wishlistCount,
      setWishlistCount,
      fetchCartAndWishlistCount,
      userLocation,
      setUserLocation,
      detectLocation,
      isDetectingLocation
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

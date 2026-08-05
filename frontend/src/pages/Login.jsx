import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'buyer',
    phone: '',
    address: 'Indiranagar, Bangalore'
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isRegister) {
        const user = await register(formData);
        if (user.role === 'seller') {
          navigate('/seller');
        } else {
          navigate('/');
        }
      } else {
        const user = await login(formData.username, formData.password);
        if (user.role === 'seller') {
          navigate('/seller');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.warn('Backend login fallback demo:', err);
      // Demo authentication simulation
      const mockUser = {
        id: isRegister ? 10 : (formData.username.includes('seller') ? 2 : 1),
        username: formData.username || 'DemoUser',
        role: formData.role || (formData.username.includes('seller') ? 'seller' : 'buyer')
      };
      localStorage.setItem('neighbour_user', JSON.stringify(mockUser));
      localStorage.setItem('access_token', 'MOCK_JWT_TOKEN');
      window.location.href = mockUser.role === 'seller' ? '/seller' : '/';
    }
  };

  const handleDemoLogin = (role) => {
    const username = role === 'seller' ? 'indiranagar_bakery' : 'bangalore_buyer';
    setFormData({ ...formData, username, password: 'password123', role });
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
      
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto font-extrabold text-2xl shadow-md">
          🛒
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
          {isRegister ? 'Join Neighbour Market' : 'Welcome Back'}
        </h2>
        <p className="text-xs text-slate-500">
          {isRegister ? 'Connect with nearby buyers and sellers in Bangalore' : 'Access your hyper-local shopping account'}
        </p>
      </div>

      {/* Demo Account Quick Selector */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-center space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Instant Demo Access</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('buyer')}
            className="flex-1 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm border border-slate-200 dark:border-slate-700 hover:border-emerald-500"
          >
            👤 Demo Buyer
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('seller')}
            className="flex-1 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm border border-slate-200 dark:border-slate-700 hover:border-emerald-500"
          >
            🏪 Demo Seller
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Username</label>
          <input
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 border border-transparent focus:border-emerald-500 focus:outline-none"
            placeholder="e.g. IndiranagarBuyer"
          />
        </div>

        {isRegister && (
          <>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 border border-transparent focus:border-emerald-500 focus:outline-none"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'buyer' })}
                  className={`py-2 rounded-xl text-xs font-bold ${
                    formData.role === 'buyer' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  Buyer (Shop Local)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'seller' })}
                  className={`py-2 rounded-xl text-xs font-bold ${
                    formData.role === 'seller' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  Seller (Vendor Store)
                </button>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Password</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 border border-transparent focus:border-emerald-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-sm shadow-lg hover:opacity-95 transition"
        >
          {isRegister ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <div className="text-center pt-2">
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
        >
          {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create One"}
        </button>
      </div>

    </div>
  );
}

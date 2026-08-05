import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import ChatModal from '../components/ChatModal';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setCartCount } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchProductDetails();
    fetchReviews();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const res = await axiosInstance.get(`products/${id}/`);
      setProduct(res.data);
    } catch (err) {
      console.warn('Using default demo product detail');
      setProduct({
        id: id,
        title: 'Organic A2 Desi Cow Milk 1L',
        description: 'Fresh farm-sourced unpasteurized organic milk delivered daily in Indiranagar. Rich in A2 beta-casein protein with zero additives.',
        price: '85.00',
        stock_quantity: 25,
        image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
        shop_name: 'Indiranagar Fresh Organics',
        shop_owner_id: 2,
        category_name: 'Groceries',
        distance_km: 1.2
      });
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axiosInstance.get(`reviews/?product=${id}`);
      setReviews(res.data);
    } catch (err) {
      setReviews([
        { id: 1, user_username: 'Ananya S', rating: 5, comment: 'Super fresh milk delivered by 7 AM in Indiranagar!' },
        { id: 2, user_username: 'Vikram K', rating: 4, comment: 'Great quality, highly recommend this store.' }
      ]);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to post a review.');
      return;
    }
    try {
      const res = await axiosInstance.post('reviews/', {
        product: id,
        rating: newRating,
        comment: newComment
      });
      setReviews([res.data, ...reviews]);
      setNewComment('');
    } catch (err) {
      alert('Could not submit review.');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please log in to add to cart.');
      return;
    }
    try {
      await axiosInstance.post('cart/', { product: id, quantity: 1 });
      setCartCount(prev => prev + 1);
      navigate('/checkout');
    } catch (err) {
      navigate('/checkout');
    }
  };

  if (!product) return <div className="py-20 text-center text-slate-400">Loading product details...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Product Image */}
        <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-square">
          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
        </div>

        {/* Right: Product Meta & Purchase */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-2">
              <span>🏪 {product.shop_name}</span>
              <span>•</span>
              <span>📍 {product.distance_km || 1.2} km away</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {product.title}
            </h1>

            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-3">
              ₹{product.price}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg transition"
              >
                Buy Now / Add to Cart
              </button>

              <button
                onClick={() => setIsChatOpen(true)}
                className="px-4 py-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 font-bold text-xs hover:bg-teal-100 transition"
              >
                💬 Chat Seller
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Reviews & Ratings Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Customer Reviews</h3>

        {/* Add Review Form */}
        <form onSubmit={handleAddReview} className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Rating:</label>
            <select
              value={newRating}
              onChange={(e) => setNewRating(Number(e.target.value))}
              className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 text-xs font-bold border"
            >
              <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
              <option value="4">⭐⭐⭐⭐ (4/5)</option>
              <option value="3">⭐⭐⭐ (3/5)</option>
              <option value="2">⭐⭐ (2/5)</option>
              <option value="1">⭐ (1/5)</option>
            </select>
          </div>

          <textarea
            rows="2"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your review for this neighbourhood product..."
            className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 border focus:outline-none"
          ></textarea>

          <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs">
            Submit Review
          </button>
        </form>

        {/* Existing Reviews List */}
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{rev.user_username}</span>
                <span className="text-xs text-amber-500">{"★".repeat(rev.rating)}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        product={product}
      />

    </div>
  );
}

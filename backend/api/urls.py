from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    UserViewSet, ShopViewSet, CategoryViewSet, ProductViewSet,
    CartViewSet, FavouriteViewSet, OrderViewSet, ReviewViewSet, ChatMessageViewSet
)
from .payment_mock import mock_payment_process

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'shops', ShopViewSet, basename='shop')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'favourites', FavouriteViewSet, basename='favourite')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'messages', ChatMessageViewSet, basename='chatmessage')

urlpatterns = [
    path('', include(router.urls)),
    # JWT authentication endpoints
    path('auth/register/', UserViewSet.as_view({'post': 'register'}), name='register'),
    path('auth/me/', UserViewSet.as_view({'get': 'me'}), name='me'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Payment Mock endpoint
    path('payment/process/', mock_payment_process, name='payment_process'),
]

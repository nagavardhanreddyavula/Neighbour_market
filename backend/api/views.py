import math
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Shop, Category, Product, Cart, Favourite, Order, OrderItem, Review, ChatMessage
from .serializers import (
    UserSerializer, UserRegisterSerializer, ShopSerializer, CategorySerializer,
    ProductSerializer, CartSerializer, FavouriteSerializer, OrderSerializer,
    ReviewSerializer, ChatMessageSerializer
)

User = get_user_model()


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees) using the Haversine formula.
    """
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'register']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny()])
    def register(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_shop(self, request):
        try:
            shop = Shop.objects.get(owner=request.user)
            serializer = self.get_serializer(shop)
            return Response(serializer.data)
        except Shop.DoesNotExist:
            return Response({'detail': 'Shop not found for user.'}, status=status.HTTP_404_NOT_FOUND)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('shop', 'category')
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Product.objects.filter(is_available=True).select_related('shop', 'category')
        
        # User Location (Defaults to central Bangalore)
        try:
            user_lat = float(self.request.query_params.get('lat', 12.9716))
            user_lon = float(self.request.query_params.get('lon', 77.5946))
        except (ValueError, TypeError):
            user_lat, user_lon = 12.9716, 77.5946

        # Distance filter parameters
        max_dist_param = self.request.query_params.get('max_distance')
        max_distance = float(max_dist_param) if max_dist_param else None

        # Category filter
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Search filter
        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(Q(title__icontains=search_query) | Q(description__icontains=search_query))

        # Seller filtering for vendor dashboard
        seller_id = self.request.query_params.get('seller_id')
        if seller_id:
            queryset = queryset.filter(shop__owner_id=seller_id)

        # Haversine distance calculation and filtering
        filtered_products = []
        for product in queryset:
            shop_lat = product.shop.latitude
            shop_lon = product.shop.longitude
            dist = haversine_distance(user_lat, user_lon, shop_lat, shop_lon)
            
            # Dynamically attach distance property to product instance
            product.distance_km = round(dist, 2)

            # Check max_distance filter if specified
            if max_distance is not None:
                if dist <= max_distance and dist <= product.shop.delivery_radius_km:
                    filtered_products.append(product)
            else:
                filtered_products.append(product)

        # Sort products by distance
        filtered_products.sort(key=lambda p: getattr(p, 'distance_km', 0.0))
        return filtered_products

    def perform_create(self, serializer):
        shop = Shop.objects.get(owner=self.request.user)
        serializer.save(shop=shop)


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user).select_related('product', 'product__shop')

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        quantity = serializer.validated_data.get('quantity', 1)
        cart_item, created = Cart.objects.get_or_create(
            user=self.request.user,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        Cart.objects.filter(user=request.user).delete()
        return Response({'status': 'Cart cleared'}, status=status.HTTP_204_NO_CONTENT)


class FavouriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavouriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favourite.objects.filter(user=self.request.user).select_related('product', 'product__shop')

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        fav = Favourite.objects.filter(user=request.user, product_id=product_id).first()
        if fav:
            fav.delete()
            return Response({'status': 'removed', 'is_favourite': False})
        else:
            Favourite.objects.create(user=request.user, product_id=product_id)
            return Response({'status': 'added', 'is_favourite': True})


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'seller' and hasattr(user, 'shop'):
            return Order.objects.filter(shop=user.shop).prefetch_related('items', 'items__product').order_by('-created_at')
        return Order.objects.filter(user=user).prefetch_related('items', 'items__product').order_by('-created_at')

    def create(self, request, *args, **kwargs):
        cart_items = Cart.objects.filter(user=request.user).select_related('product', 'product__shop')
        if not cart_items.exists():
            return Response({'detail': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        # Group cart items by shop
        shops_items = {}
        for item in cart_items:
            shop = item.product.shop
            if shop.id not in shops_items:
                shops_items[shop.id] = []
            shops_items[shop.id].append(item)

        created_orders = []
        shipping_address = request.data.get('shipping_address', request.user.address or 'Bangalore, India')

        for shop_id, items in shops_items.items():
            total_price = sum(item.product.price * item.quantity for item in items)
            order = Order.objects.create(
                user=request.user,
                shop_id=shop_id,
                status='Pending',
                total_price=total_price,
                shipping_address=shipping_address
            )
            for item in items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    unit_price=item.product.price
                )
            created_orders.append(order)

        # Clear buyer cart
        cart_items.delete()
        serializer = self.get_serializer(created_orders, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            return Response(self.get_serializer(order).data)
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        product_id = self.request.query_params.get('product')
        if product_id:
            return Review.objects.filter(product_id=product_id)
        return Review.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.request.query_params.get('other_user_id')
        if other_user_id:
            return ChatMessage.objects.filter(
                (Q(sender=user) & Q(receiver_id=other_user_id)) |
                (Q(sender_id=other_user_id) & Q(receiver=user))
            ).order_by('timestamp')
        return ChatMessage.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('timestamp')

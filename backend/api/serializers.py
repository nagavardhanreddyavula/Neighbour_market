from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Shop, Category, Product, Cart, Favourite, Order, OrderItem, Review, ChatMessage

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    shop_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone', 'latitude', 'longitude', 'address', 'shop_id')

    def get_shop_id(self, obj):
        if hasattr(obj, 'shop'):
            return obj.shop.id
        return None


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'phone', 'latitude', 'longitude', 'address')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'buyer'),
            phone=validated_data.get('phone', ''),
            latitude=validated_data.get('latitude', 12.9716),
            longitude=validated_data.get('longitude', 77.5946),
            address=validated_data.get('address', 'Bangalore, Karnataka, India')
        )
        # If user registered as seller, auto-create default shop
        if user.role == 'seller':
            Shop.objects.create(
                owner=user,
                name=f"{user.username}'s Store",
                latitude=user.latitude,
                longitude=user.longitude
            )
        return user


class ShopSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Shop
        fields = ('id', 'owner', 'owner_username', 'name', 'description', 'address', 'latitude', 'longitude', 'delivery_radius_km', 'created_at')


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'image_url')


class ProductSerializer(serializers.ModelSerializer):
    shop_name = serializers.ReadOnlyField(source='shop.name')
    shop_owner_id = serializers.ReadOnlyField(source='shop.owner.id')
    shop_latitude = serializers.ReadOnlyField(source='shop.latitude')
    shop_longitude = serializers.ReadOnlyField(source='shop.longitude')
    category_name = serializers.ReadOnlyField(source='category.name')
    distance_km = serializers.SerializerMethodField()
    is_favourite = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'shop', 'shop_name', 'shop_owner_id', 'shop_latitude', 'shop_longitude',
            'category', 'category_name', 'title', 'description', 'price', 'stock_quantity',
            'image_url', 'is_available', 'distance_km', 'is_favourite', 'created_at'
        )

    def get_distance_km(self, obj):
        # Retrieved from calculated annotations in ProductViewSet
        return getattr(obj, 'distance_km', 0.0)

    def get_is_favourite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favourite.objects.filter(user=request.user, product=obj).exists()
        return False


class CartSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    item_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ('id', 'user', 'product', 'product_details', 'quantity', 'item_total', 'created_at')

    def get_item_total(self, obj):
        return float(obj.product.price) * obj.quantity


class FavouriteSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = Favourite
        fields = ('id', 'user', 'product', 'product_details', 'created_at')


class OrderItemSerializer(serializers.ModelSerializer):
    product_title = serializers.ReadOnlyField(source='product.title')
    product_image = serializers.ReadOnlyField(source='product.image_url')

    class Meta:
        model = OrderItem
        fields = ('id', 'order', 'product', 'product_title', 'product_image', 'quantity', 'unit_price')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    buyer_name = serializers.ReadOnlyField(source='user.username')
    buyer_phone = serializers.ReadOnlyField(source='user.phone')
    shop_name = serializers.ReadOnlyField(source='shop.name')

    class Meta:
        model = Order
        fields = ('id', 'user', 'buyer_name', 'buyer_phone', 'shop', 'shop_name', 'status', 'total_price', 'shipping_address', 'items', 'created_at', 'updated_at')


class ReviewSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Review
        fields = ('id', 'product', 'user', 'user_username', 'rating', 'comment', 'created_at')


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')
    receiver_username = serializers.ReadOnlyField(source='receiver.username')

    class Meta:
        model = ChatMessage
        fields = ('id', 'sender', 'sender_username', 'receiver', 'receiver_username', 'message', 'timestamp', 'is_read')

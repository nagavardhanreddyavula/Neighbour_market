from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Shop, Category, Product, Cart, Favourite, Order, OrderItem, Review

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed comprehensive demo data for Neighbour Market (Bangalore locations)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Seeding Neighbour Market initial data...'))

        # 1. Create Categories
        categories_data = [
            {'name': 'Groceries', 'slug': 'groceries', 'image_url': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Fresh Produce', 'slug': 'fresh-produce', 'image_url': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Bakery', 'slug': 'bakery', 'image_url': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Beverages', 'slug': 'beverages', 'image_url': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Household', 'slug': 'household', 'image_url': 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Sweets & Snacks', 'slug': 'sweets-snacks', 'image_url': 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80'}
        ]

        cat_objs = {}
        for cat in categories_data:
            c_obj, _ = Category.objects.get_or_create(slug=cat['slug'], defaults=cat)
            cat_objs[cat['slug']] = c_obj

        # 2. Demo Buyer
        buyer1, _ = User.objects.get_or_create(
            username='bangalore_buyer',
            defaults={
                'email': 'buyer@example.com',
                'role': 'buyer',
                'phone': '+91 9876543210',
                'latitude': 12.9716,
                'longitude': 77.5946,
                'address': 'MG Road, Bangalore, Karnataka'
            }
        )
        buyer1.set_password('password123')
        buyer1.save()

        # 3. Sellers & Shops in Bangalore
        sellers_data = [
            {
                'username': 'indiranagar_organics',
                'name': 'Indiranagar Fresh Organics',
                'address': '100 Feet Road, Indiranagar, Bangalore',
                'lat': 12.9784,
                'lon': 77.6408,
                'radius': 12.0
            },
            {
                'username': 'koramangala_crust',
                'name': 'Koramangala Crust & Co',
                'address': '5th Block, Koramangala, Bangalore',
                'lat': 12.9352,
                'lon': 77.6245,
                'radius': 10.0
            },
            {
                'username': 'hsr_fruit_bazaar',
                'name': 'HSR Fruit Bazaar',
                'address': '27th Main Road, HSR Layout, Bangalore',
                'lat': 12.9121,
                'lon': 77.6446,
                'radius': 8.0
            },
            {
                'username': 'jayanagar_heritage',
                'name': 'Jayanagar Heritage Coffee & Sweets',
                'address': '4th Block, Jayanagar, Bangalore',
                'lat': 12.9250,
                'lon': 77.5938,
                'radius': 15.0
            },
            {
                'username': 'malleshwaram_dairy',
                'name': 'Malleshwaram Traditional Dairy',
                'address': '8th Main, Malleshwaram, Bangalore',
                'lat': 13.0031,
                'lon': 77.5644,
                'radius': 12.0
            },
            {
                'username': 'whitefield_hydro',
                'name': 'Whitefield Hydroponic Greens',
                'address': 'ITPL Main Road, Whitefield, Bangalore',
                'lat': 12.9698,
                'lon': 77.7500,
                'radius': 20.0
            }
        ]

        shops = []
        for sdata in sellers_data:
            user, _ = User.objects.get_or_create(
                username=sdata['username'],
                defaults={
                    'email': f"{sdata['username']}@example.com",
                    'role': 'seller',
                    'latitude': sdata['lat'],
                    'longitude': sdata['lon'],
                    'address': sdata['address']
                }
            )
            user.set_password('password123')
            user.save()

            shop, _ = Shop.objects.get_or_create(
                owner=user,
                defaults={
                    'name': sdata['name'],
                    'address': sdata['address'],
                    'latitude': sdata['lat'],
                    'longitude': sdata['lon'],
                    'delivery_radius_km': sdata['radius']
                }
            )
            shops.append(shop)

        # 4. Expanded Products (15+ Items)
        products_data = [
            # Indiranagar Shop
            {
                'shop': shops[0],
                'category': cat_objs['groceries'],
                'title': 'Organic A2 Desi Cow Milk 1L',
                'description': 'Fresh farm-sourced unpasteurized organic milk delivered daily in Indiranagar.',
                'price': 85.00,
                'stock_quantity': 30,
                'image_url': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80'
            },
            {
                'shop': shops[0],
                'category': cat_objs['groceries'],
                'title': 'Cold-Pressed Groundnut Oil 1L',
                'description': 'Traditional wood-pressed pure unrefined groundnut cooking oil.',
                'price': 240.00,
                'stock_quantity': 15,
                'image_url': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80'
            },
            {
                'shop': shops[0],
                'category': cat_objs['groceries'],
                'title': 'Organic Wildflower Raw Honey (500g)',
                'description': 'Unprocessed raw forest honey rich in natural enzymes and antioxidants.',
                'price': 390.00,
                'stock_quantity': 25,
                'image_url': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80'
            },
            # Koramangala Shop
            {
                'shop': shops[1],
                'category': cat_objs['bakery'],
                'title': 'Artisanal Sourdough Bread',
                'description': 'Freshly baked whole-wheat sourdough loaf from Koramangala wood-fired oven.',
                'price': 180.00,
                'stock_quantity': 20,
                'image_url': 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80'
            },
            {
                'shop': shops[1],
                'category': cat_objs['bakery'],
                'title': 'Belgian Dark Chocolate Croissant (Pack of 2)',
                'description': 'Flaky buttery croissants filled with premium 70% dark chocolate.',
                'price': 220.00,
                'stock_quantity': 18,
                'image_url': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80'
            },
            {
                'shop': shops[1],
                'category': cat_objs['bakery'],
                'title': 'Gluten-Free Almond Flour Cookies (250g)',
                'description': 'Healthy crunch almond cookies baked with organic jaggery.',
                'price': 295.00,
                'stock_quantity': 12,
                'image_url': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80'
            },
            # HSR Fruit Bazaar
            {
                'shop': shops[2],
                'category': cat_objs['fresh-produce'],
                'title': 'Fresh Alphonso Mangoes (1kg)',
                'description': 'Directly harvested sweet Ratnagiri Alphonso mangoes in HSR Layout.',
                'price': 450.00,
                'stock_quantity': 50,
                'image_url': 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80'
            },
            {
                'shop': shops[2],
                'category': cat_objs['fresh-produce'],
                'title': 'Organic Tender Coconut Crate (Box of 4)',
                'description': 'Naturally hydrating tender coconuts harvested fresh daily.',
                'price': 199.00,
                'stock_quantity': 40,
                'image_url': 'https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=600&q=80'
            },
            {
                'shop': shops[2],
                'category': cat_objs['fresh-produce'],
                'title': 'Exotic Berry Mix (Blueberries & Strawberries 250g)',
                'description': 'Fresh handpicked farm berries packed with vitamin C.',
                'price': 340.00,
                'stock_quantity': 15,
                'image_url': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80'
            },
            # Jayanagar Shop
            {
                'shop': shops[3],
                'category': cat_objs['beverages'],
                'title': 'South Indian Filter Coffee Blend (500g)',
                'description': 'Authentic 80:20 roasted Chicory blend from Chikmagalur coffee estates.',
                'price': 275.00,
                'stock_quantity': 35,
                'image_url': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80'
            },
            {
                'shop': shops[3],
                'category': cat_objs['sweets-snacks'],
                'title': 'Special Ghee Mysore Pak (400g Box)',
                'description': 'Melt-in-mouth traditional South Indian sweet prepared with pure cow ghee.',
                'price': 380.00,
                'stock_quantity': 25,
                'image_url': 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80'
            },
            # Malleshwaram Dairy
            {
                'shop': shops[4],
                'category': cat_objs['groceries'],
                'title': 'Fresh Homemade Malai Paneer (200g)',
                'description': 'Soft unpreserved cottage cheese made daily using fresh cow milk.',
                'price': 115.00,
                'stock_quantity': 40,
                'image_url': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80'
            },
            {
                'shop': shops[4],
                'category': cat_objs['sweets-snacks'],
                'title': 'Avakaya Mango Pickle 500g Jar',
                'description': 'Spicy Andhra style homemade mango pickle preserved in sesame oil.',
                'price': 225.00,
                'stock_quantity': 20,
                'image_url': 'https://images.unsplash.com/photo-1589135233689-d58b72e50529?auto=format&fit=crop&w=600&q=80'
            },
            # Whitefield Hydroponics
            {
                'shop': shops[5],
                'category': cat_objs['fresh-produce'],
                'title': 'Hydroponic Salad Box (Lettuce, Arugula & Spinach)',
                'description': 'Soil-less pesticide-free clean greens grown locally in Whitefield vertical farms.',
                'price': 140.00,
                'stock_quantity': 30,
                'image_url': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80'
            },
            {
                'shop': shops[5],
                'category': cat_objs['household'],
                'title': 'Eco-Friendly Bamboo Kitchenware Set',
                'description': 'Sustainable 100% biodegradable bamboo bowls and spoons set.',
                'price': 499.00,
                'stock_quantity': 15,
                'image_url': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80'
            }
        ]

        for pdata in products_data:
            Product.objects.get_or_create(
                shop=pdata['shop'],
                title=pdata['title'],
                defaults=pdata
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded 15+ demo products across Bangalore!'))

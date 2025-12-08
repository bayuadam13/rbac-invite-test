import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import User, Product, Order

print("🚀 Running seed script...\n")

# ==============================
# USERS
# ==============================
users = [
    {
        'username': 'admin',
        'email': 'admin@example.com',
        'password': 'AdminPass123',
        'role': 'admin',
        'superuser': True
    },
    {
        'username': 'manager1',
        'email': 'manager@example.com',
        'password': 'ManagerPass123',
        'role': 'manager',
        'superuser': False
    },
    {
        'username': 'staff1',
        'email': 'staff@example.com',
        'password': 'StaffPass123',
        'role': 'staff',
        'superuser': False
    },
]

for u in users:
    if not User.objects.filter(username=u['username']).exists():
        if u['superuser']:
            User.objects.create_superuser(
                username=u['username'],
                email=u['email'],
                password=u['password'],
                role=u['role']
            )
        else:
            User.objects.create_user(
                username=u['username'],
                email=u['email'],
                password=u['password'],
                role=u['role']
            )
        print(f"✔ Created user: {u['username']}")
    else:
        print(f"✔ User exists (skipped): {u['username']}")

print("\n--- Users OK ---\n")

# ==============================
# PRODUCTS
# ==============================
products_data = [
    {'name': 'Product A', 'description': 'Description A', 'price': Decimal('100.00')},
    {'name': 'Product B', 'description': 'Description B', 'price': Decimal('200.00')},
    {'name': 'Product C', 'description': 'Description C', 'price': Decimal('300.00')},
]

for p in products_data:
    obj, created = Product.objects.get_or_create(
        name=p['name'],
        defaults={
            'description': p['description'],
            'price': p['price']
        }
    )
    if created:
        print(f"✔ Created product: {p['name']}")
    else:
        print(f"✔ Product exists (skipped): {p['name']}")

print("\n--- Products OK ---\n")

# ==============================
# ORDERS
# ==============================
orders_data = [
    {'product_name': 'Product A', 'quantity': 2, 'created_by': 'manager1'},
    {'product_name': 'Product B', 'quantity': 1, 'created_by': 'staff1'},
]

for o in orders_data:
    try:
        product = Product.objects.get(name=o['product_name'])
        user = User.objects.get(username=o['created_by'])

        obj, created = Order.objects.get_or_create(
            product=product,
            created_by=user,
            defaults={'quantity': o['quantity']}
        )

        if created:
            print(f"✔ Created order: {o['product_name']} by {o['created_by']}")
        else:
            print(f"✔ Order exists (skipped): {o['product_name']} by {o['created_by']}")

    except Product.DoesNotExist:
        print(f"❌ Product not found: {o['product_name']}")
    except User.DoesNotExist:
        print(f"❌ User not found: {o['created_by']}")

print("\n✅ Seed complete!")

export const mockCategories = [
  {
    id: 'cat-1',
    name: 'Pizzas',
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-2',
    name: 'Burgers',
    image:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-3',
    name: 'Bowls',
    image:
      'https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-4',
    name: 'Desserts',
    image:
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-5',
    name: 'Drinks',
    image:
      'https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=400&q=80',
  },
]

export const mockAddons = [
  { id: 'addon-1', name: 'Extra cheese', price: 40, available: true },
  { id: 'addon-2', name: 'Spicy dip', price: 25, available: true },
  { id: 'addon-3', name: 'Garlic bread', price: 70, available: true },
  { id: 'addon-4', name: 'Lemon soda', price: 55, available: true },
]

export const mockMenuItems = [
  {
    id: 'menu-1',
    name: 'Margherita Pizza',
    description: 'Classic cheese pizza with basil and olive oil.',
    price: 329,
    rating: 4.8,
    reviews: 128,
    image:
      'https://images.unsplash.com/photo-1548365328-9a6b1d125d7f?auto=format&fit=crop&w=600&q=80',
    category: 'cat-1',
    addons: ['addon-1', 'addon-2'],
    available: true,
  },
  {
    id: 'menu-2',
    name: 'Pepperoni Burst',
    description: 'Loaded with pepperoni, mozzarella, and herbs.',
    price: 449,
    rating: 4.6,
    reviews: 94,
    image:
      'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
    category: 'cat-1',
    addons: ['addon-1', 'addon-3'],
    available: true,
  },
  {
    id: 'menu-3',
    name: 'Crispy Chicken Burger',
    description: 'Fried chicken, lettuce, and house sauce.',
    price: 259,
    rating: 4.4,
    reviews: 76,
    image:
      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80',
    category: 'cat-2',
    addons: ['addon-2'],
    available: true,
  },
  {
    id: 'menu-4',
    name: 'Smoky Veg Burger',
    description: 'Grilled veggie patty with smoky mayo.',
    price: 239,
    rating: 4.2,
    reviews: 58,
    image:
      'https://images.unsplash.com/photo-1508736793122-f516e3ba5569?auto=format&fit=crop&w=600&q=80',
    category: 'cat-2',
    addons: ['addon-2'],
    available: true,
  },
  {
    id: 'menu-5',
    name: 'Teriyaki Power Bowl',
    description: 'Brown rice, veggies, and teriyaki glaze.',
    price: 299,
    rating: 4.5,
    reviews: 67,
    image:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80',
    category: 'cat-3',
    addons: ['addon-4'],
    available: true,
  },
  {
    id: 'menu-6',
    name: 'Avocado Quinoa Bowl',
    description: 'Quinoa, avocado, and fresh greens.',
    price: 319,
    rating: 4.7,
    reviews: 82,
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80',
    category: 'cat-3',
    addons: ['addon-4'],
    available: true,
  },
  {
    id: 'menu-7',
    name: 'Choco Lava Cake',
    description: 'Warm chocolate cake with molten center.',
    price: 179,
    rating: 4.9,
    reviews: 164,
    image:
      'https://images.unsplash.com/photo-1508736793122-f516e3ba5569?auto=format&fit=crop&w=600&q=80',
    category: 'cat-4',
    addons: [],
    available: true,
  },
  {
    id: 'menu-8',
    name: 'Vanilla Shake',
    description: 'Creamy vanilla shake with whipped cream.',
    price: 149,
    rating: 4.1,
    reviews: 52,
    image:
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80',
    category: 'cat-5',
    addons: [],
    available: true,
  },
  {
    id: 'menu-9',
    name: 'Berry Cooler',
    description: 'Fresh berry soda with mint.',
    price: 129,
    rating: 4.3,
    reviews: 41,
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    category: 'cat-5',
    addons: [],
    available: true,
  },
  {
    id: 'menu-10',
    name: 'Spicy Paneer Wrap',
    description: 'Paneer, peppers, and tangy sauce in a wrap.',
    price: 219,
    rating: 4.2,
    reviews: 38,
    image:
      'https://images.unsplash.com/photo-1523986371872-9d3ba2e2f5c7?auto=format&fit=crop&w=600&q=80',
    category: 'cat-3',
    addons: ['addon-1'],
    available: true,
  },
  {
    id: 'menu-11',
    name: 'Classic Fries',
    description: 'Crispy golden fries with seasoning.',
    price: 119,
    rating: 4.0,
    reviews: 33,
    image:
      'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
    category: 'cat-2',
    addons: ['addon-2'],
    available: true,
  },
  {
    id: 'menu-12',
    name: 'Strawberry Sundae',
    description: 'Chilled sundae with fresh strawberries.',
    price: 159,
    rating: 4.6,
    reviews: 70,
    image:
      'https://images.unsplash.com/photo-1505253216365-9a8f8e0ce55f?auto=format&fit=crop&w=600&q=80',
    category: 'cat-4',
    addons: [],
    available: true,
  },
]

export const mockCoupons = [
  {
    id: 'coupon-1',
    code: 'HUNGRY10',
    discount: 10,
    minOrderAmount: 300,
    expiresAt: '2099-12-31',
  },
  {
    id: 'coupon-2',
    code: 'WELCOME50',
    discount: 50,
    minOrderAmount: 600,
    expiresAt: '2099-12-31',
  },
]

export const mockUsers = [
  {
    id: 'user-1',
    username: 'Riya Sharma',
    email: 'user@stillhungry.com',
    phone: '9990001111',
    password: 'user123',
    role: 'user',
    status: 'active',
  },
  {
    id: 'user-2',
    username: 'Admin',
    email: 'admin@stillhungry.com',
    phone: '9990002222',
    password: 'admin123',
    role: 'admin',
    status: 'active',
  },
]

export const mockReviews = [
  {
    id: 'review-1',
    user: 'user-1',
    menu: 'menu-1',
    rating: 5,
    comment: 'Best pizza in town!',
    approved: true,
  },
  {
    id: 'review-2',
    user: 'user-1',
    menu: 'menu-3',
    rating: 4,
    comment: 'Crispy and juicy.',
    approved: true,
  },
]

export const mockOrders = [
  {
    id: 'order-1',
    user: 'user-1',
    items: [
      { menu: 'menu-1', quantity: 1, addons: ['addon-1'] },
      { menu: 'menu-5', quantity: 2, addons: [] },
    ],
    deliveryDetails: {
      name: 'Riya Sharma',
      address: '12, MG Road, Bengaluru',
      phone: '9990001111',
    },
    status: 'Preparing',
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    couponCode: 'HUNGRY10',
    subTotal: 927,
    discountAmount: 92,
    total: 835,
    createdAt: new Date().toISOString(),
  },
]

export const STATUS_FLOW = [
  'Order Received',
  'Preparing',
  'Out for Delivery',
  'Delivered',
]

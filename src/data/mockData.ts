import { Product, Job, Contact, Testimonial, Notification, WalletTransaction } from '../types';

export const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: 'LayoutGrid' },
  { id: 'luxury', label: 'Luxury Goods', icon: 'Crown' },
  { id: 'wholesale', label: 'Wholesale Deals', icon: 'Boxes' },
  { id: 'electronics', label: 'Electronics', icon: 'Tv' },
  { id: 'mobiles', label: 'Mobiles', icon: 'Smartphone' },
  { id: 'laptops', label: 'Laptops', icon: 'Laptop' },
  { id: 'fashion', label: 'Fashion', icon: 'Shirt' },
  { id: 'jewellery', label: 'Jewellery', icon: 'Gem' },
  { id: 'grocery', label: 'Grocery', icon: 'ShoppingBasket' },
  { id: 'gaming', label: 'Gaming', icon: 'Gamepad2' },
  { id: 'hardware', label: 'Hardware', icon: 'Wrench' },
  { id: 'beauty', label: 'Beauty', icon: 'Sparkles' },
  { id: 'furniture', label: 'Furniture', icon: 'Sofa' },
  { id: 'delivery', label: '20 Min Delivery 🔥', icon: 'Zap' },
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Aurelia Royal Gold Chronograph Watch",
    brand: "Aurelia Genf",
    price: 18499,
    mrp: 29999,
    rating: 4.8,
    reviewsCount: 312,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "luxury",
    badge: "HOT",
    description: "Crafted in Switzerland, the Aurelia Chronograph boasts an 18-karat yellow gold case, hand-stitched alligator strap, and automatic precision movement designed for the ultimate modern luxury experience.",
    specifications: {
      "Case Material": "18k Yellow Gold",
      "Water Resistance": "50m (5 ATM)",
      "Strap Material": "Genuine Alligator Leather",
      "Movement": "Swiss Automatic Chronograph"
    },
    colors: ["Gold-Black", "Pure Gold", "Rose Gold"],
    sizes: ["40mm", "42mm"]
  },
  {
    id: 2,
    name: "Alike-Pro Soundmaster Gold Edition",
    brand: "Alike Audio",
    price: 3499,
    mrp: 6999,
    rating: 4.6,
    reviewsCount: 148,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "electronics",
    badge: "SALE",
    description: "Immersive active noise-cancelling headphones tuned to golden standard. Features gold brushed metal plating, 40-hour battery capacity, and custom high-res drivers.",
    specifications: {
      "Driver Unit": "40mm Dynamic",
      "Battery Life": "Up to 40 Hours",
      "ANC Support": "Active Hybrid Noise Cancellation",
      "Bluetooth": "Version 5.3"
    },
    colors: ["Classic Black", "Champagne Gold"],
    sizes: ["Standard"]
  },
  {
    id: 3,
    name: "18K Gold plated Venetian Chain Necklace",
    brand: "Venezia Jewels",
    price: 5999,
    mrp: 11999,
    rating: 4.9,
    reviewsCount: 220,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "jewellery",
    badge: "TRENDING",
    description: "An elegant Italian-crafted Venetian chain dipped in authentic 18-karat gold. Designed with precision linkage for a comfortable feel and rich glow.",
    specifications: {
      "Chain Length": "22 Inches",
      "Metal Dipped": "18k Gold on Sterling Silver",
      "Clasp Type": "Secure Lobster Clasp",
      "Weight": "12.4g"
    },
    colors: ["Yellow Gold", "White Gold"],
    sizes: ["20 Inch", "22 Inch", "24 Inch"]
  },
  {
    id: 4,
    name: "Alike-Book Master Pro 16",
    brand: "Alike-ND Computing",
    price: 89999,
    mrp: 124999,
    rating: 4.9,
    reviewsCount: 96,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "laptops",
    badge: "LIMITED",
    description: "Powered by the stellar M4 Alike SuperChip, featuring 32GB unified RAM, 1TB premium high-speed flash storage, and a breathtaking liquid OLED true-gold display.",
    specifications: {
      "Processor": "Alike M4 Gen2 Max",
      "Memory": "32GB RAM",
      "Storage": "1TB NVMe Express SSD",
      "Display Size": "16.2 inch True-LID OLED"
    },
    colors: ["Space Black", "Gold Luxury Tint"],
    sizes: ["32GB/1TB", "64GB/2TB"]
  },
  {
    id: 5,
    name: "Midnight Silk Evening Gown",
    brand: "Aura Couture",
    price: 7999,
    mrp: 14999,
    rating: 4.7,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "fashion",
    badge: "HOT",
    description: "Flowing beautifully, this mulberry silk evening gown is tailored precisely for VIP cocktail galas, featuring structured pleats and gold thread embroidery.",
    specifications: {
      "Fabric": "100% Organic Mulberry Silk",
      "Stitch": "Handcrafted Atelier",
      "Fit Type": "Slim Evening Silhouette"
    },
    colors: ["Classic Onyx", "Deep Emerald", "Imperial Gold"],
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: 6,
    name: "Alike-Phon Gold-Titanium 15 Ultra",
    brand: "Alike Mobiles",
    price: 64999,
    mrp: 89999,
    rating: 4.8,
    reviewsCount: 450,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1565849511511-ab60w21a80d5?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1573148195900-7845dcb9b127?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "mobiles",
    badge: "HOT",
    description: "The crown jewel of modern smartphones. Crafted out of grade-5 gold titanium, dynamic camera, true-motion display and unmatched ultra performance.",
    specifications: {
      "Chassis": "Tier-5 Titanium Gold Alloy",
      "Camera": "200MP Triple Golden-Eye Lens",
      "Storage": "512GB High Speed UFS",
      "Battery Charge": "100W Golden Flash Charging"
    },
    colors: ["Titanium Gold", "Satin Midnight"],
    sizes: ["256GB", "512GB"]
  },
  {
    id: 7,
    name: "Luxury Gold Trim Espresso Machine",
    brand: "Barista Royale",
    price: 18999,
    mrp: 29999,
    rating: 4.5,
    reviewsCount: 110,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "furniture",
    badge: "NEW",
    description: "Premium professional grade espresso pump embellished with authentic polished brass gold trims. Auto foam wand and 19-bar extraction pressure.",
    specifications: {
      "Pressure Type": "19-Bar Italian Pump",
      "Finish Type": "Gold Lustre Metallic Trims",
      "Bean Capacity": "250g Hopper"
    },
    colors: ["Pitch Black & Gold", "Ivory White & Gold"],
    sizes: ["Standard"]
  },
  {
    id: 8,
    name: "Wholesale Premium Organic Saffron Bulks (100g)",
    brand: "Persian Royal Wholesales",
    price: 14500,
    mrp: 25000,
    rating: 4.9,
    reviewsCount: 310,
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1512411652497-6aef86ba6bf2?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1533038590840-1cde6b66b723?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "wholesale",
    badge: "SALE",
    isWholesale: true,
    wholesaleMinQty: 5,
    wholesalePrice: 12500,
    description: "Direct premium grade-A saffron threads collected of royal fields. Highly aromatic, purely tested, ideal for gold bulk spice buyers.",
    specifications: {
      "Grade": "Super Negin AAA Quality",
      "Pack Weight": "100 Grams Shield-Tub",
      "Origin": "Khorasan Fields"
    },
    colors: ["Standard"],
    sizes: ["100g", "500g"]
  },
  {
    id: 9,
    name: "Wholesale Alike Type-C Fast Chargers [Bulk Pack 50pcs]",
    brand: "Alike Hardware",
    price: 4999,
    mrp: 14999,
    rating: 4.7,
    reviewsCount: 65,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "wholesale",
    badge: "HOT",
    isWholesale: true,
    wholesaleMinQty: 2,
    wholesalePrice: 4499,
    description: "Industrial wholesale supply of 50 high-durability fast chargers. Perfect for retailers, corner shops, and business suppliers.",
    specifications: {
      "Charger Output": "33W Power Delivery 3.0",
      "Cable Type": "Tough Braided Copper Core",
      "Box Quantity": "50 Individually Boxed Pieces"
    },
    colors: ["Onyx Black", "Frost White"],
    sizes: ["50-Pcs Set"]
  },
  {
    id: 10,
    name: "Alike RGB-Onyx Gaming Keyboard",
    brand: "Alike Gaming",
    price: 1999,
    mrp: 3999,
    rating: 4.5,
    reviewsCount: 194,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1626908013351-800ddd734b8a?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "gaming",
    badge: "SALE",
    description: "Sleek tactical mechanical mechanical keyboard fitted with gold-plated switches for instant response, gorgeous custom backlit layouts.",
    specifications: {
      "Key Switch": "Gold Contact Blue Clicky",
      "Chassis Material": "Anodized Aircraft Aluminum",
      "Cable": "Ultra-light Detachable Mesh"
    },
    colors: ["Black-RGB", "White-Gold RGB"],
    sizes: ["Keyless 87-key", "Full Size 104-key"]
  },
  {
    id: 11,
    name: "Premium Gold Glow Facial Extract Glow Serum",
    brand: "Glow & Co",
    price: 1299,
    mrp: 2499,
    rating: 4.4,
    reviewsCount: 82,
    image: "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "beauty",
    badge: "SALE",
    description: "Enriched with real micro gold leaf flakes and organic hyaluronic essence for stellar deep moisturization and youthful golden radiance.",
    specifications: {
      "Key Ingredients": "24k Gold Extract, Vitamin E, Squalane",
      "Skin Compatibility": "All Types Including Sensitive",
      "Volume": "50ml Luxury Dropper Shield"
    },
    colors: ["Standard"],
    sizes: ["30ml", "50ml"]
  },
  {
    id: 12,
    name: "Sleek Chrome Finish Professional Tool Kit (20 Min Delivery)",
    brand: "Apex Hardware",
    price: 2499,
    mrp: 4999,
    rating: 4.6,
    reviewsCount: 54,
    image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1530124324315-4f021a5223c5?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1608613304899-ea8098577e38?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "hardware",
    badge: "NEW",
    description: "Get it in 20 minutes! Complete premium rust-resistant vanadium steel toolkit housed in a gorgeous gold-accented protective hardcase.",
    specifications: {
      "Piece Count": "48 Professional Tools",
      "Material Quality": "Chrome-Vanadium Premium Grade",
      "Delivery Speed": "Guaranteed under 20 mins"
    },
    colors: ["Industrial Set"],
    sizes: ["48-Piece Set"]
  },
  {
    id: 13,
    name: "Luxury Gold Velvet Ottoman Sofa Chair",
    brand: "Amore Living",
    price: 12499,
    mrp: 19999,
    rating: 4.3,
    reviewsCount: 42,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "furniture",
    badge: "TRENDING",
    description: "Make a bold luxury statement. Ultra cozy golden premium velvet upholstery backed on highly sturdy stainless hand-polished gold frames.",
    specifications: {
      "Upholstery": "Luxe Velvet Gold Fibre",
      "Frame Material": "Stainless Gold-PVD Steel",
      "Seat Density": "35-grade High Resilient Elastic foam"
    },
    colors: ["Imperial Royal Gold", "Emerald Teal", "Luxury Ruby"],
    sizes: ["Standard Fit"]
  },
  {
    id: 14,
    name: "Alike Ultra-Premium Organic Caviar Shield (20 Min Delivery)",
    brand: "Royal Caspian",
    price: 4500,
    mrp: 7500,
    rating: 4.9,
    reviewsCount: 30,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1511250325983-e18e8d89e5fc?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "delivery",
    badge: "HOT",
    description: "Direct elite food-gourmet collection delivered at cold temperature straight to your doorway in less than 20 minutes. Pure taste of luxury.",
    specifications: {
      "Standard Grade": "Beluga Royal Golden Reserve",
      "Chill Seal": "Yes, dry-ice insulated tin case"
    },
    colors: ["Reserve Cold"],
    sizes: ["50g Deluxe Tin"]
  },
  {
    id: 15,
    name: "Alike Gold plated Pro Gaming Controller",
    brand: "Alike Gaming",
    price: 4999,
    mrp: 7999,
    rating: 4.7,
    reviewsCount: 162,
    image: "https://images.unsplash.com/photo-1600080972464-8e5f358024ae?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1600080972464-8e5f358024ae?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1531525645387-7f14be1bdbdb?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "gaming",
    badge: "SALE",
    description: "Precision triggers, tactile gold micro-switch paddles, and an amazing customized metallic luxury finish. Fully compatible with PC/PS5/Xbox series.",
    specifications: {
      "Trigger Type": "Magnetic Hall-Effect Precision",
      "Battery Capacity": "20 Hours continuous play",
      "Wireless": "Ultra-low-latency 2.4GHz + Bluetooth"
    },
    colors: ["Rich Gold-Onyx", "Pure Platinum-Gold"],
    sizes: ["Standard Extra Grip"]
  },
  {
    id: 16,
    name: "Alike-Pro Golden-Air Purifier 5G",
    brand: "Alike Hardware",
    price: 15999,
    mrp: 24999,
    rating: 4.6,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1520116468412-95db8817bc25?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "electronics",
    badge: "NEW",
    description: "Quiet, high CADR gold-trim purifier. Captures 99.97% air micro particles using real-time laser monitoring and elegant control layouts.",
    specifications: {
      "Filter Type": "True HEPA H13 Gold Carbon Filter",
      "Coverage": "Up to 500 Sq Ft",
      "Noise Level": "Whisper Quiet 22dB"
    },
    colors: ["Piano Ivory Gold"],
    sizes: ["Premium Tall"]
  },
  {
    id: 17,
    name: "Luxury Amber & Oud Organic Scented Candle Extra",
    brand: "Aura Fragrances",
    price: 899,
    mrp: 1499,
    rating: 4.4,
    reviewsCount: 120,
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "beauty",
    badge: "SALE",
    description: "Hand-poured premium soy candle scented with heavy organic amber oil and pure gold leaf details. Up to 60 hours clean, non-toxic burn time.",
    specifications: {
      "Wax Blend": "100% Premium Natural Soy-Bee Wax",
      "Scent Strength": "Heavy Therapeutic",
      "Wick": "Natural Wood-Crackle Wick"
    },
    colors: ["Classy Soy Amber"],
    sizes: ["300g Heavy Glass"]
  },
  {
    id: 18,
    name: "Wholesale Silk Ribbon Gift-Wrappers [Box of 300 Rolls]",
    brand: "Aura Couture",
    price: 2999,
    mrp: 5999,
    rating: 4.3,
    reviewsCount: 22,
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "wholesale",
    badge: "SALE",
    isWholesale: true,
    wholesaleMinQty: 3,
    wholesalePrice: 2499,
    description: "High-end luxury satin ribbons wrapped in magnificent metallic colors for high-end boutique gift presentations and premium branding agencies.",
    specifications: {
      "Ribbon Width": "2.5cm Extra Wide",
      "Length per roll": "25 Yards",
      "Ribbon Inclusions": "Gold foil detailed finish"
    },
    colors: ["Mixed Luxury Box"],
    sizes: ["300-Roll Pack"]
  }
];

export const JOBS: Job[] = [
  {
    id: 1,
    title: "Senior Luxury Brand Consultant",
    company: "Alike-ND Luxury Group",
    location: "Mumbai, India (Hybrid)",
    salary: "₹15,00,000 - ₹24,00,000 / Yr",
    type: "Full-time",
    logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=75&w=500&fm=webp",
    description: "Seeking an experienced advisor to manage relationship strategies, design premium gold customer experiences, and consult luxury sub-brands in Mumbai region.",
    requirements: [
      "5+ years luxury segment market consulting experience",
      "In-depth command of high-net-worth client workflows",
      "Stellar presentations, relationship management, and commercial vision"
    ]
  },
  {
    id: 2,
    title: "Lead Recommendation & Search Architect",
    company: "Alike-ND Tech Labs",
    location: "Bengaluru, India (Remote)",
    salary: "₹25,00,000 - ₹38,00,000 / Yr",
    type: "Remote",
    logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=75&w=500&fm=webp",
    description: "Design advanced machine learning models running real-time outfit matchmaking, personalized shopping suggestions, and deep learning matrix factorization algorithms.",
    requirements: [
      "Mastery of Python, PyTorch, and Transformer Architectures",
      "Experience deploying models serving 10M+ daily active recommendations",
      "Background in vector similarity databases (Milvus, Pinecone)"
    ]
  },
  {
    id: 3,
    title: "Express 20-Min Delivery Network Lead",
    company: "Alike Express Deliveries",
    location: "Delhi NCR, India",
    salary: "₹12,00,000 - ₹18,00,000 / Yr",
    type: "Full-time",
    logo: "https://images.unsplash.com/photo-1580907115718-4c8abd021ae5?auto=format&fit=crop&q=75&w=500&fm=webp",
    description: "Manage dark store logistics, express delivery fleets, real-time optimal routing trackers, and guarantee delivery speed under 20 mins across hub networks.",
    requirements: [
      "Strong background in fast-moving consumer logistics or express e-grocery",
      "Stellar real-time data analytical command",
      "Leadership of 500+ bike distribution fleet crew"
    ]
  },
  {
    id: 4,
    title: "E-Commerce Creative Director",
    company: "Alike-ND Creative Studios",
    location: "Bengaluru, India",
    salary: "₹18,00,000 - ₹28,00,000 / Yr",
    type: "Full-time",
    logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=75&w=500&fm=webp",
    description: "Elevate our dark-luxury interface and aesthetic branding. Lead photoshoots, curate high-end gold accents, packaging aesthetics, and premium web designs.",
    requirements: [
      "8+ years of top-tier branding agency or lifestyle creative experience",
      "Stellar visual portfolio exhibiting premium high-contrast design styling",
      "Competency directing high-end product photoshoots"
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Vikram Malhotra",
    role: "Premium Elite HNW Buyer",
    content: "The Gold-Chronograph timepiece I bought is beyond breathtaking. The packaging arrived wrapped in stunning solid design box, and the service feels truly first-class. Best e-commerce ever!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=75&w=500&fm=webp",
    rating: 5
  },
  {
    id: 2,
    name: "Rhea Chawla",
    role: "Verified Seller & Boutique Owner",
    content: "Listing my handcrafted embroidery jewellery via the Alike-ND dashboard has scaled my business by 300%. The real-time messenger connects me instantly with clients.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=75&w=500&fm=webp",
    rating: 5
  },
  {
    id: 3,
    name: "Aryan Deshmukh",
    role: "Express Diner & tech-geek",
    content: "I didn't believe the 20 Min Delivery label, but my Beluga Caviar arrived in precisely 16 minutes flat inside deep dry ice packaging! Absolutely stellar network.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=75&w=500&fm=webp",
    rating: 4.8
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "promotion",
    title: "Welcome to ALIKE-ND",
    description: "Explore our curated catalog of ultra-premium electronics, handcrafted jewellery, and luxury designer apparel.",
    timestamp: "Just now",
    isRead: false
  },
  {
    id: "notif-2",
    type: "promotion",
    title: "Exclusive Golden Hours",
    description: "Apply coupon ALIKE10 for a luxury 10% flat discount on our entire Gold Jewellery catalogue today only.",
    timestamp: "2 hours ago",
    isRead: false
  },
  {
    id: "notif-3",
    type: "system",
    title: "Wallet Ready",
    description: "Your Alike Secure Wallet is active. You can add funds anytime for 1-click checkout.",
    timestamp: "1 day ago",
    isRead: true
  }
];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: "contact-alike-support",
    name: "Kowshik Kanti Das",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=75&w=500&fm=webp",
    lastMessage: "Order dispatched successfully",
    timestamp: "10:46 PM",
    unreadCount: 0,
    isOnline: true,
    messages: [
      { 
        id: "m1", 
        text: "Hello, how can I assist you with your Alike purchase today?", 
        sender: "contact", 
        timestamp: "Active 2h ago",
        status: "read"
      },
      {
        id: "m2",
        text: "Order dispatched successfully",
        sender: "user",
        timestamp: "Feb 16, 2026, 10:46 PM",
        image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=75&w=500&fm=webp",
        status: "read"
      }
    ]
  },
  {
    id: "contact-jewel-boutique",
    name: "Aura Royal Jewellery Boutique",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=75&w=500&fm=webp",
    lastMessage: "The 18K Venetian Chain is authentic Italian plated silver setting, yes.",
    timestamp: "Yesterday",
    unreadCount: 0,
    isOnline: false,
    messages: [
      { id: "m4", text: "Good day! Is the 18K Venetian Chain solid gold or dipped sterling?", sender: "user", timestamp: "Yesterday" },
      { id: "m5", text: "The 18K Venetian Chain is authentic Italian plated silver setting, yes.", sender: "contact", timestamp: "Yesterday" }
    ]
  },
  {
    id: "contact-gaming-hub",
    name: "Alike Gaming Store Rep",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=75&w=500&fm=webp",
    lastMessage: "We have only 12 pieces of the Gold Plated Controller left in stock!",
    timestamp: "3 days ago",
    unreadCount: 0,
    isOnline: true,
    messages: [
      { id: "m6", text: "Do you have controllers in stock now?", sender: "user", timestamp: "3 days ago" },
      { id: "m7", text: "We have only 12 pieces of the Gold Plated Controller left in stock!", sender: "contact", timestamp: "3 days ago" }
    ]
  }
];

import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  id?: number;
  name: string;
  brand?: string;
  category: string;
  price: number;
  mrp?: number;
  rating?: number;
  reviewsCount?: number;
  stock: number;
  stockStatus?: string;
  badge?: string;
  isFlashSale?: boolean;
  image?: string;
  images?: string[];
  description?: string;
  specifications?: Record<string, string>;
  isWholesale?: boolean;
  wholesalePrice?: number;
  wholesaleMinQty?: number;
  colors?: string[];
  sizes?: string[];
  emoji?: string;
  sellerId?: string;
  sellerShopName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: Number },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: "Alike Sovereign" },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 120 },
    stock: { type: Number, required: true, min: 0, default: 10 },
    stockStatus: { type: String, default: "In Stock" },
    badge: { type: String, default: "" },
    isFlashSale: { type: Boolean, default: false },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    description: { type: String, default: "" },
    specifications: { type: Schema.Types.Mixed, default: {} },
    isWholesale: { type: Boolean, default: false },
    wholesalePrice: { type: Number, default: 0 },
    wholesaleMinQty: { type: Number, default: 1 },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    emoji: { type: String, default: "📦" },
    sellerId: { type: String, default: "admin", index: true },
    sellerShopName: { type: String, default: "ALIKE-ND Official" },
  },
  { timestamps: true, collection: "products" }
);

export default mongoose.model<IProduct>("Product", ProductSchema);


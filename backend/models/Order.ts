import mongoose, { Schema, Document } from "mongoose";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface IOrder extends Document {
  orderNumber: string;
  memberName: string;
  memberEmail?: string;
  total: number;
  status: OrderStatus;
  items?: { productId?: any; name: string; qty: number; price: number; image?: string; color?: string; size?: string }[];
  address?: {
    name?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  paymentMethod?: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
  delivery?: number;
  trackingStep?: number;
  commissionRate?: number;
  commissionAmount?: number;
  sellerPayout?: number;
  commissionStatus?: "credited" | "pending";
  approvedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  manualOverride?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    memberName: { type: String, required: true },
    memberEmail: { type: String },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    items: [
      {
        productId: { type: Schema.Types.Mixed },
        name: String,
        qty: Number,
        price: Number,
        image: String,
        color: String,
        size: String,
      },
    ],
    address: {
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zip: String,
    },
    paymentMethod: { type: String, default: "CARD" },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    delivery: { type: Number, default: 0 },
    trackingStep: { type: Number, default: 2 },
    commissionRate: { type: Number, default: 5 },
    commissionAmount: { type: Number, default: 0 },
    sellerPayout: { type: Number, default: 0 },
    commissionStatus: { type: String, enum: ["credited", "pending"], default: "credited" },
    approvedAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    manualOverride: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "orders" }
);

export default mongoose.model<IOrder>("Order", OrderSchema);

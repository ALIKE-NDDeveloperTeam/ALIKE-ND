import mongoose, { Schema, Document } from "mongoose";

export type SellerStatus = "pending" | "approved" | "rejected" | "suspended" | "review";

export interface ISeller extends Document {
  shopName: string;
  storefront: string;
  ownerName: string;
  ownerEmail: string;
  email: string;
  mobileNumber: string;
  businessAddress: string;
  password?: string;
  listingsCount: number;
  status: SellerStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SellerSchema = new Schema<ISeller>(
  {
    shopName: { type: String, required: true, trim: true },
    storefront: { type: String, trim: true },
    ownerName: { type: String, required: true, trim: true },
    ownerEmail: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    businessAddress: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    listingsCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended", "review"],
      default: "pending",
    },
  },
  { timestamps: true, collection: "sellers" }
);

export default mongoose.model<ISeller>("Seller", SellerSchema);

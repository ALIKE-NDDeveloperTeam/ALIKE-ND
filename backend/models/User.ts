import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  country: string;
  mobileNumber: string;
  phone?: string;
  passwordHash: string;
  tier: "Silver" | "Gold" | "Platinum";
  verified: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    country: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    tier: { type: String, enum: ["Silver", "Gold", "Platinum"], default: "Silver" },
    verified: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "users", // Explicitly ensure target collection is "users"
  }
);

// Explicitly register model with collection name "users"
const User: Model<IUser> = mongoose.models.User as Model<IUser> || mongoose.model<IUser>("User", UserSchema, "users");
export default User;

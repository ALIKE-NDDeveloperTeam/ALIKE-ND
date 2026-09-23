import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: "superadmin" | "admin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "Super Admin" },
    role: { type: String, enum: ["superadmin", "admin"], default: "superadmin" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "admins",
  }
);

const Admin: Model<IAdmin> = mongoose.models.Admin as Model<IAdmin> || mongoose.model<IAdmin>("Admin", AdminSchema, "admins");
export default Admin;


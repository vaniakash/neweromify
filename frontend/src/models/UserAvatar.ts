import mongoose, { Schema, model } from "mongoose";

export interface IUserAvatar {
  _id?: mongoose.Types.ObjectId;
  userEmail: string;       // owner — indexed for fast lookup
  clientId: string;        // the client-side Zustand id (kept for sync)
  name: string;            // display name e.g. "Ava"
  username: string;        // @tag e.g. "@ava"
  baseImage: string;       // Cloudinary URL of the reference photo
  createdAt?: Date;
  updatedAt?: Date;
}

const UserAvatarSchema = new Schema<IUserAvatar>(
  {
    userEmail: { type: String, required: true, index: true },
    clientId:  { type: String, required: true },
    name:      { type: String, required: true },
    username:  { type: String, required: true },
    baseImage: { type: String, required: true },
  },
  { timestamps: true }
);

// Compound unique index: one clientId per user
UserAvatarSchema.index({ userEmail: 1, clientId: 1 }, { unique: true });

if (process.env.NODE_ENV === "development" && mongoose.models.UserAvatar) {
  delete (mongoose.models as Record<string, unknown>).UserAvatar;
}

export const UserAvatar =
  (mongoose.models.UserAvatar as mongoose.Model<IUserAvatar>) ||
  model<IUserAvatar>("UserAvatar", UserAvatarSchema);

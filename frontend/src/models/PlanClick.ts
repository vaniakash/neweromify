import mongoose, { Schema, model, models } from "mongoose";

// Tracks every time a user clicks a plan button on the pricing page.
// Useful for understanding which plans get the most interest vs conversions.

export interface IPlanClick {
  _id?: mongoose.Types.ObjectId;
  userId?: string;
  userEmail?: string;
  userName?: string;
  planId: string;        // e.g. "value", "pro", "mega", "premium"
  planName: string;      // e.g. "Beginner Pack"
  amount: number;        // price in INR
  createdAt?: Date;
}

const PlanClickSchema = new Schema<IPlanClick>(
  {
    userId:    { type: String },
    userEmail: { type: String },
    userName:  { type: String },
    planId:    { type: String, required: true },
    planName:  { type: String, required: true },
    amount:    { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const PlanClick =
  models.PlanClick || model<IPlanClick>("PlanClick", PlanClickSchema);

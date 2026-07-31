import mongoose, { Schema, model, models } from "mongoose";

// ─── Payment Model ──────────────────────────────────────────────────────────
// Supports both Razorpay (legacy) and UPI (temporary) payment methods.
// When a proper payment gateway (Cashfree / PhonePe / PayU) is integrated,
// remove the UPI-specific fields and the "upi-submit" API route.

export interface IPayment {
  _id?: mongoose.Types.ObjectId;
  userId?: string;
  userEmail?: string;

  // ── Razorpay fields (legacy — keep for historical records) ──────────────
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  // ── UPI fields (temporary — remove once gateway is approved) ────────────
  utrId?: string;                                      // UTR / Transaction ID entered by user
  upiStatus?: "pending_verification" | "approved" | "rejected";

  // ── Shared fields ────────────────────────────────────────────────────────
  amount: number;                                      // amount in INR (whole rupees)
  currency: string;
  plan: string;                                        // plan id e.g. "pro", "mega"
  planName?: string;                                   // human name e.g. "Creator Pack"
  creditsToAdd?: number;
  paymentMethod: "razorpay" | "upi";                  // distinguishes the source
  status: "created" | "paid" | "failed" | "pending_verification";
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId:              { type: String },
    userEmail:           { type: String },

    // Razorpay (optional — not used for UPI payments)
    razorpayOrderId:     { type: String, sparse: true, unique: true },
    razorpayPaymentId:   { type: String },
    razorpaySignature:   { type: String },

    // UPI (temporary)
    utrId:               { type: String },
    upiStatus: {
      type: String,
      enum: ["pending_verification", "approved", "rejected"],
    },

    // Shared
    amount:              { type: Number, required: true },
    currency:            { type: String, default: "INR" },
    plan:                { type: String, required: true },
    planName:            { type: String },
    creditsToAdd:        { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "upi"],
      required: true,
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "pending_verification"],
      default: "created",
    },
  },
  { timestamps: true }
);

export const Payment =
  models.Payment || model<IPayment>("Payment", PaymentSchema);

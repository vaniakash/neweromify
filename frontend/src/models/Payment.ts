import mongoose, { Schema, model, models } from "mongoose";

// ─── Payment Model ──────────────────────────────────────────────────────────
// Supports Razorpay (legacy), UPI (legacy), and PayU (current) payment methods.

export interface IPayment {
  _id?: mongoose.Types.ObjectId;
  userId?: string;
  userEmail?: string;

  // ── Razorpay fields (legacy — keep for historical records) ──────────────
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  // ── PayU fields ──────────────────────────────────────────────────────────
  payuTxnId?: string;                                  // our generated txnid sent to PayU
  payuPaymentId?: string;                              // PayU's mihpayid returned on success

  // ── UPI fields (legacy — manual verification flow) ───────────────────────
  utrId?: string;
  upiStatus?: "pending_verification" | "approved" | "rejected";

  // ── Shared fields ────────────────────────────────────────────────────────
  amount: number;                                      // amount in INR (whole rupees)
  currency: string;
  plan: string;                                        // plan id e.g. "pro", "mega"
  planName?: string;                                   // human name e.g. "Creator Pack"
  creditsToAdd?: number;
  paymentMethod: "razorpay" | "upi" | "payu";         // distinguishes the source
  status: "created" | "paid" | "failed" | "pending_verification";
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId:              { type: String },
    userEmail:           { type: String },

    // Razorpay (optional — not used for PayU payments)
    razorpayOrderId:     { type: String, sparse: true },   // unique index dropped — was causing E11000 for PayU records
    razorpayPaymentId:   { type: String },
    razorpaySignature:   { type: String },

    // PayU
    payuTxnId:           { type: String, sparse: true, unique: true },
    payuPaymentId:       { type: String },

    // UPI (legacy)
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
      enum: ["razorpay", "upi", "payu"],
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

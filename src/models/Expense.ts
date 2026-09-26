import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  category: string;
  description: string;
  date: Date;
  type: "expense" | "income";
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["expense", "income"],
      default: "expense",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

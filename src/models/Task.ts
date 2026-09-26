import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  category: "Today" | "Family" | "Work" | "Weekly" | "Custom";
  dueDate?: Date;
  isCarriedOver: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["Today", "Family", "Work", "Weekly", "Custom"],
      default: "Today",
    },
    dueDate: {
      type: Date,
    },
    isCarriedOver: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

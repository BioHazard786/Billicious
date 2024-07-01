import mongoose from "mongoose";

const draweesSchema = new mongoose.Schema(
  {
    draweeId: String,
    draweeName: String,
  },
  { _id: false, minimize: false },
);

const transactionSchema = new mongoose.Schema(
  {
    _id: String,
    groupId: String,
    amount: Number,
    transactionName: String,
    notes: {
      type: String,
      default: "",
    },
    drawees: {
      type: [draweesSchema],
      default: [],
    },
    payees: mongoose.Schema.Types.Mixed,
    creationDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false, minimize: false },
);

const Transaction =
  mongoose.models.Transactions ||
  mongoose.model("Transactions", transactionSchema);

export default Transaction;

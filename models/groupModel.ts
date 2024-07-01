import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    _id: String,
    name: {
      type: String,
      required: [true, "Please provide group name"],
    },
    totalBill: {
      type: Number,
      default: 0.0,
    },
    members: mongoose.Schema.Types.Mixed,
    creationDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false, minimize: false },
);

const Group = mongoose.models.Groups || mongoose.model("Groups", groupSchema);

export default Group;

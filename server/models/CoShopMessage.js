import mongoose from "mongoose";

const coShopMessageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoShopRoom",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

coShopMessageSchema.index({ room: 1, createdAt: -1 });

export default mongoose.model("CoShopMessage", coShopMessageSchema);

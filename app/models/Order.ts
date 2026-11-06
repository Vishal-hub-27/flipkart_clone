
import mongoose, { Schema } from "mongoose";

const OrderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product"
        },

        name: String,
        price: Number,
        quantity: Number
      }
    ],

    totalAmount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      default: "Placed"
    }
  },
  { timestamps: true }
);

const Order =
  mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);

export default Order;

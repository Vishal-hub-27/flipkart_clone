
import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    oldPrice: {
      type: Number,
      default: 0
    },

    rating: {
      type: Number,
      default: 0
    },

    image: {
      type: String,
      required: true
    },

    description: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);

export default Product;

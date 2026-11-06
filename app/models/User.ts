
import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true,
      select: false
    }
  },
  { timestamps: true }
);

const User =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);

export default User;

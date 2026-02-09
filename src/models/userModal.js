import mongoose from "mongoose";

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    referralCode: {
      type: String,
      unique: true
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function () {
  if (!this.referralCode) {
    this.referralCode = generateReferralCode();
  }
});

export default mongoose.model("User", userSchema);

const mongoose = require("mongoose");
const { encodePassword } = require("../../shared/password-utils");

const userSchema = new mongoose.Schema(
  {
    username: String,
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now() },
  },
  { versionKey: false }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = encodePassword(this.password);
});

const UserModel = mongoose.model("User", userSchema, "Users");

module.exports = UserModel;

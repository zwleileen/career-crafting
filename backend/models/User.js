const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  hashedPassword: {
    type: String,
    minLength: 4,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female"], // Allows only "paid" or ""
    default: "",
  },
  status: {
    type: String,
    enum: ["paid", ""], // Allows only "paid" or ""
    default: "",
  },
  verified: { type: Boolean, default: false },
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

module.exports = mongoose.model("User", userSchema);

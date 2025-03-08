const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
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
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

module.exports = mongoose.model("User", userSchema);

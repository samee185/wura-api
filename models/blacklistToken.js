const mongoose = require("mongoose");

const blackListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true, // Prevent duplicate entries
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 7, // Automatically remove after 7 days
    },
  },
  {
    timestamps: true,
  }
);

// Collection name: blacklistedtokens
const BlackListModel = mongoose.model("BlackListedToken", blackListSchema);

module.exports = BlackListModel;

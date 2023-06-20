const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const WalletSchema = new Schema({
  balance: { type: String, required: true },
  address: { type: String, required: true },
});

const Wallet = mongoose.model("WalletSchema", WalletSchema);

module.exports = Wallet;

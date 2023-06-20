const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const cryptocurrency = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: {
    type: String,
  },
});

const Crypto = mongoose.model("cryptocurrency", cryptocurrency);

module.exports = Crypto;

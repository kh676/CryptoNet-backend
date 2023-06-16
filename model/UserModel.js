const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var uniqueValidator = require("mongoose-unique-validator");
const UserModel = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    select: false,
  },
});
UserModel.plugin(uniqueValidator);
const User = mongoose.model("UserModel", UserModel);

module.exports = User;

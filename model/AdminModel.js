const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var uniqueValidator = require("mongoose-unique-validator");
const AdminModel = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    select: false,
  },
});
AdminModel.plugin(uniqueValidator);
const Admin = mongoose.model("AdminModel", AdminModel);

module.exports = Admin;

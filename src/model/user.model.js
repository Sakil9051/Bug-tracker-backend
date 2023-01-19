const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  password : {type:String,required:true},
  email: { type: String, required: true,unique:true}
});

const userModel = model("user", userSchema);

module.exports = userModel;
// models/user.model.js
import { Schema, model } from "mongoose";
import Joi from "joi";
import validator from "validator";
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "invalid"],
  },
  password: {
    type: String,
    required: true,
    min: 8,
    max: 100,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  nickname: {
    type: String,
    required: true,
  },
});

function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().min(8).max(100).required(),
    role: Joi.string().required(),
    nickname: Joi.string().required(),
  });
  return schema.validate(user);
}
export const validate = validateUser;

export default model("User", userSchema);

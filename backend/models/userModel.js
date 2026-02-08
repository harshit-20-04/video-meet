import mongoose from "mongoose";
import UserSchema from "../schemas/userSchema.js";

const User = new mongoose.model("User", UserSchema);

export default User;
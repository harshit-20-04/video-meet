import mongoose from "mongoose";
import MeetingSchema from "../schemas/meetingSchema.js";

const Meeting = mongoose.model("Meeting", MeetingSchema);

export default Meeting;
import {Schema} from "mongoose";

const MeetingSchema = new Schema({
    username:
    {
        type:String,
        ref: 'User'
    },
    meetingId:
    {
        type: String,
        required: true,
        unique: true,
    },
    createdAt:
    {
        type: Date,
        required: true,
        default: Date.now(),
    },
})

export default MeetingSchema;
import httpStatus from "http-status";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Meeting from "../models/meetingModel.js";



const register = async (req, res) => {
    const { name, username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "User Already Exists" });
        }
        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name,
            username: username,
            email: email,
            password: hashedPass,
        })

        await newUser.save();

        res.status(httpStatus.CREATED).json({ message: "New User Registered!" });

    } catch (e) {
        res.json({ message: `Something went Wrong ${e}` });
    }
}

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({})
    }
    try {
        const isExistingUser = await User.findOne({ username: username });
        if (!isExistingUser) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, isExistingUser.password)
        if (isPasswordCorrect) {
            let token = crypto.randomBytes(20).toString("hex");
            isExistingUser.token = token;
            await isExistingUser.save();
            
            return res.status(httpStatus.OK).json({ token: token });
        }
        else{
            return res.status(httpStatus.UNAUTHORIZED).json({message:"Invalid UserName or password"})
        }
    } catch (e) {
        res.status(500).json({ message: `Something went Wrong ${e}` })
    }
}

const getUserHistory= async (req, res)=>{
    const {token} = req.query;
    try{
        const user = await User.findOne({token:token});
        const meetings =  await Meeting.find({username : user.username});
        console.log(meetings);
        res.json(meetings);
    }catch(e){
        res.json({message:`Something went wrong ${e}`});
    }
}
const addToHistory = async (req, res)=>{
    const {token, meetingId} = req.body;
    try{
        const user = await User.findOne({token: token});
        const newMeeting = new Meeting({
            username:user.username,
            meetingId: meetingId,
        })
        await newMeeting.save();
        res.status(httpStatus.CREATED).json({message:"Added code to History"});
    }catch(e){
        res.json({message:`Something went Wrong ${e}`});
    }
}
export { login, register, getUserHistory, addToHistory };
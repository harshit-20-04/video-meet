import express from "express";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { connectToSocket } from "./controllers/socketManager.js";
import mongoose from "mongoose";
import cors from "cors";
import { configDotenv } from "dotenv";
import router from "./routes/userRoutes.js";
configDotenv();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);
const db_url = process.env.MONGOOSE_URL;

app.set("port", (process.env.PORT || 8000));

app.use(cors());
app.use(express.json({ limit: "40kb" }))
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.use("/api/v1/user", router);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/chat", (req, res)=>{
    res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('chat message', (msg)=>{
    io.emit('chat message', msg);
  })
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const start = async () => {
    const connectionDB = await mongoose.connect(db_url)
        .then(() => {
            console.log("Connected to Database");
        })
    server.listen(app.get("port"), () => {
        console.log(`Server is listening to port : ${app.get("port")}`);
    });
};
start();
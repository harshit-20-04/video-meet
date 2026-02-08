import { Server } from "socket.io"

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server)=>{
    const socketServer = new Server(server);
    socketServer.on('connection', (socket)=>{
        socket.on("join-meeting", )
    })
    return socketServer;
}
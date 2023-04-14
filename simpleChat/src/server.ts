import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

    console.log(`a user connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`a user disconnected: ${socket.id}`);
    });
});

let messages: Array<Object> = []; // messages é um array do tipo objeto

io.on('connection', socket => {

    
    socket.on('chat message', messageData => {
        messages.push(messageData);
        socket.broadcast.emit('chat message', messageData);
    });
    
    socket.emit('previousMessage', messages);
});             
             
 
server.listen(3000, () => {
    console.log('listening on port: 3000');
});  
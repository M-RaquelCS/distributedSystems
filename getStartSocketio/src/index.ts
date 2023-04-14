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

    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });

});

io.on('connection', (socket) => {

    socket.on('chat message', message => {
        io.emit('chat message', message);
    });

});

 
server.listen(3000, () => {
    console.log('listening on port: 3000');
}); 
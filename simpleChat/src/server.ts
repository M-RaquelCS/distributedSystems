import express from 'express';
import http from 'http';
import path from 'path';

import { Server } from 'socket.io';

import { Worker, isMainThread, workerData, parentPort } from 'worker_threads';

const app = express();
const server = http.createServer(app);
const io = new Server(server); 

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/client.html');
});

let messages: Array<Object> = []; // messages é um array do tipo objeto

io.on('connection', (socket) => {
    console.log(`a user connected: ${socket.id}`);

    socket.emit('previousMessage', messages);
  
    const worker = new Worker(path.resolve(__dirname,'worker.ts'), { 
        workerData: { socketId: socket.id } 
    });
  
    worker.on('message', () => {

        socket.on('chat message', messageData => {

            messages.push(messageData);
            socket.broadcast.emit('chat message', messageData);

            console.log(`Mensagem recebida da thread filha: ${messageData.username} - ${messageData.message}`);
            io.to(socket.id).emit('message', messageData);
        });
        
    });
  
    worker.on('error', (error) => {
      console.error(`Erro na thread filha: ${error}`);
    });
  
    worker.on('exit', (code) => {
      console.log(`Thread filha finalizada com código de saída ${code}`);
    });
  
    socket.on('disconnect', () => {
      console.log(`a user disconnected: ${socket.id}`);
      worker.terminate();
    });
  });         
 
server.listen(3000, () => {
    console.log('listening on port: 3000');
});  
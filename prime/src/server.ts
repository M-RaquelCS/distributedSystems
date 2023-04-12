import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

function isPrime(n: number): boolean {
    
    // se o número for menor ou igual a 2, então ele não é primo
    if(n <= 2){
        return false;
    }

    // verifica se o número é divisível por algum número menor ou igual a sua raiz quadrada
    const divisors = Math.sqrt(n);
    for (let i = 2; i <= divisors; i++) {
        if(n % i === 0){
            return false; // se ele for divisível por algum número menor ou igual a sua raiz quadrada então ele não é primo.
        }
    }

    // se não encontrou nenhum divisor, o número é primo
    return true;
}

io.on('connection',(socket) => {
    console.log('a client connected');

    socket.on('isPrime', (number) => {
        //console.log(`receive number: ${number}`);

        const isNumberPrime = isPrime(number); // verificação do número recebido pelo client
        socket.emit('isPrimeResult',number, isNumberPrime) // enviando o resultado ao client

    })
})

server.listen(3000, ()=>{
    console.log('listening on port 3000');
})
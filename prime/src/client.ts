import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/');

socket.on('connect', () => {
    console.log('connected to server');

    let number = 1;
    const maxNumber = 1000;

    for (let n = 0; n < maxNumber; n++) {
        const delta = Math.floor(Math.random() * 100) + 1; // Gerar um valor aleatório entre 1 e 100
        number += delta;

        socket.emit('isPrime',number); // envio do número gerado
        
    }

    // resultado da verificação do número pelo server
    socket.on('isPrimeResult', (number, isPrimeResult) => {
        console.log(`number: ${number} is prime: ${isPrimeResult}`);
    })
});
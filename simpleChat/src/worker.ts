import { workerData, parentPort } from 'worker_threads';

if (parentPort) {
    parentPort.postMessage(`Mensagem enviada para o socket ${workerData.socketId}`);
}

// assim não da error de listen EADDRINUSE
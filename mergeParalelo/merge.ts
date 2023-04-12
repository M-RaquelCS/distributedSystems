import { Worker, isMainThread, workerData, parentPort } from 'worker_threads';

// mesclagem de arrays, para criar um único array ordenado
function merge(left: number[], right: number[]) { // tipagem dos arrays como arrays de números

  let result: number[] = []; // tipagem do array final como array de números e iniciando como um array vazio.
  let l = 0; // variable para pegar a posição do array left
  let r = 0; // variable para pegar a posição do array right

  // rodar enquanto as variables (número da posição) são menores que o tamanho dos seus arrays
  while (l < left.length && r < right.length) {

    if (left[l] <= right[r]) { // se o número que está na posição l no array left for menor ou igual ao número da posição r no array right
      
      result.push(left[l++]); // adiciona o número da posição l no array left no array result
    
    } else {
      
      result.push(right[r++]); // adiciona o número da posição r no array right no array result
   
    }
  }

  return(result.concat(left.slice(l)).concat(right.slice(r)));
  /**
   * Quando um dos arrays estiver completamente adicionado ao array result, 
   * o algoritmo adiciona o restante dos elementos do outro array ao final do array result.
   */
  
}

function mergeSortParallel(array: number[]) {

  return new Promise<number[]>((resolve, reject) => {

    if (array.length <= 1) {
      resolve(array); // retorna o array
      return
    }

    const middle = Math.floor(array.length / 2);
    const left = array.slice(0, middle);
    const right = array.slice(middle);
    
    // Worker executa Threads em segundo plano. o primeiro parâmetro é o arquivo ts ou js que será executado, o segundo é passando os dados a serem usados na execução. https://medium.com/@hamzazaheer721/using-web-workers-in-typescript-react-8d2926a33154
    const workerLeft = new Worker(__filename, {
      workerData: left
    })
    
    const workerRight = new Worker(__filename, {
      workerData: right
    })

    // irão amarzenar os arrays ordenados
    let sortedLeft: number[];
    let sortedRight: number[];

    // o método on define um listener que espera uma mensagem do Worker
    workerLeft.on('message', (message) => {

      sortedLeft = message; // definindo a variable como a mensagem recebida, que é um array

      // se o sortedRight estiver com o array, fazer o merge
      if (sortedRight !== undefined){
        const result = merge(sortedLeft, sortedRight);
        resolve(result);
      }
      
    })

    workerRight.on('message', (message) => {

      sortedRight = message;

      if (sortedLeft !== undefined) {
        const result = merge(sortedLeft, sortedRight);
        resolve(result);
      }

    })

    // tratamento de error
    workerLeft.on('error', reject);
    workerRight.on('error', reject);

    /**
     * encerrar cada worker com o evento exit.
     * o código de saída do worker é verificado e, caso não seja zero 
     * (indica que o worker foi encerrado normalmente), 
     * a promessa é rejeitada com um novo erro indicando o código de saída recebido.
     */
    workerLeft.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    })

    workerRight.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    })

  })
}

if(isMainThread){

  const number = '15973264810'
  const array = number.split('').map(Number)

  const array2 = [1,5,9,7,6,4,8,2,3,10,14,13,12]
  
  mergeSortParallel(array).then((result) => {
    console.log(result)
  })

  mergeSortParallel(array2).then((result) => {
    console.log(result)
  })

} else {

  const array = workerData as number[];
  mergeSortParallel(array).then((result) => {
    parentPort?.postMessage(result)
  });

}
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

function merge(left: number[], right: number[]): number[] {
  
  let result: number[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}

function mergeSortParallel(array: number[]): Promise<number[]> {
  return new Promise((resolve, reject) => {

    if (array.length <= 1) {
      resolve(array);
      return;
    }

    const middle = Math.floor(array.length / 2);
    const left = array.slice(0, middle);
    const right = array.slice(middle);

    const workerLeft = new Worker(__filename, {
      workerData: left
    });

    const workerRight = new Worker(__filename, {
      workerData: right
    });

    let sortedLeft: number[] ;
    let sortedRight: number[] ;

    workerLeft.on('message', (message) => {
      sortedLeft = message;
      if (sortedRight !== undefined) {
        const result = merge(sortedLeft, sortedRight);
        resolve(result);
      }
    });

    workerRight.on('message', (message) => {
      sortedRight = message;
      if (sortedLeft !== undefined) {
        const result = merge(sortedLeft, sortedRight);
        resolve(result);
      }
    });

    workerLeft.on('error', reject);
    workerRight.on('error', reject);

    workerLeft.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });

    workerRight.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

if (isMainThread) {
  const array = [4];
  mergeSortParallel(array).then((result) => {
    console.log(result);
  });
} else {
  const array = workerData as number[];
  mergeSortParallel(array).then((result) => {
    parentPort?.postMessage(result);
  });
}

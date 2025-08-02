// 01
var sum_to_n_a = function (n) {
  if (typeof n !== "number" || n < 1 || !Number.isInteger(n)) {
    return 0;
  }
  return (n * (n + 1)) / 2;
};

// 02
var sum_to_n_b = function (n) {
  if (typeof n !== "number" || n < 1 || !Number.isInteger(n)) {
    return 0;
  }
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// 03
const sum_to_n_c = function (n) {
  if (typeof n !== "number" || n < 1 || !Number.isInteger(n)) {
    return 0;
  }

  const workerJob = `
        onmessage = function(event) {
            const n = event.data;
            const sum = (n * (n + 1)) / 2; 
            postMessage(sum);
        };
    `;

  const blob = new Blob([workerJob], { type: "application/javascript" });
  const worker = new Worker(URL.createObjectURL(blob));

  worker.onmessage = function (event) {
    console.log("Sum from 1 to " + n + " is: " + event.data);
    worker.terminate();
  };

  worker.postMessage(n);
};

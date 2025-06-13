var sum_to_n_a = function(n) {
    if (n === 0 || n === 1) {
        return n
    }

    let res = 0;

    do {
        res = res + n
        n--;
    } while (n > 0)
    
    return res
};

var sum_to_n_b = function(n) {
    if (n === 0 || n === 1) {
        return n
    }
    let res = 0;

    for (let i = 1; i <= n; i++) {
      res = res + i;
    }
    return res;
};

var sum_to_n_c = function(n) {
    if (n === 0 || n === 1) {
        return n
    }

    return n + sum_to_n_c(n - 1);
};


/**
 *  How to execute?
 *  cd src/problem1 && node index
 *   
 * */  
console.log(sum_to_n_a(100));

console.log(sum_to_n_b(100));

console.log(sum_to_n_c(100));

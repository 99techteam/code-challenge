const sum_to_n_a = (n: number) => {
    // Return 0 if input number  = 0
    if (n === 0) return 0;
    // convert number to array base on input number as length
    let arrNumber = Array.from({length: n}, (items: number, index: number) => index + 1);
    // Use array reduce to adds all elements
    return arrNumber.reduce((sum, item) => sum + item, 0);
}

const sum_to_n_b = (n: number) => {
    // Return 0 if input number  = 0
    if (n === 0) return 0;
	// Create empty array from number by Array
    let arrEmpty = Array(n);
    // Use array fill to 0 to each items
    arrEmpty.fill(0);
    // Use array map to create new array on each element
    let arrNumber = arrEmpty.map((num: number, index: number) => index + 1);
    // Use array reduce to adds all elements
    return arrNumber.reduce((sum, item) => sum + item, 0);
}

const sum_to_n_c = (n: number) => {
	// Return 0 if input number  = 0
    if (n === 0) return 0;
    // Define default value
    let sum = 0;
    // Iterate through each element. For each element, we add the sum to 1
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}
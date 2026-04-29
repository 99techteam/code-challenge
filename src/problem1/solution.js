var sum_to_n_a = function(n) {
    // Idea: Iterative approach. Use a loop to add each number from 1 to |n|.
    // Complexity: Time O(n), Space O(1).
    if (n === 0) {
        return 0;
    }

    var sign = n > 0 ? 1 : -1;
    var total = 0;

    for (var i = 1; i <= Math.abs(n); i++) {
        total += i * sign;
    }

    return total;
};

var sum_to_n_b = function(n) {
    // Idea: Mathematical approach. Use the Gauss formula n * (n + 1) / 2.
    // Complexity: Time O(1), Space O(1).
    if (n === 0) {
        return 0;
    }

    var absN = Math.abs(n);
    var result = absN * (absN + 1) / 2;

    return n > 0 ? result : -result;
};

var sum_to_n_c = function(n) {
    // Idea: Array reduce approach. Build a range from 1 to |n| and reduce it to a sum.
    // Complexity: Time O(n), Space O(n).
    if (n === 0) {
        return 0;
    }

    var sign = n > 0 ? 1 : -1;

    return Array.from({ length: Math.abs(n) }, function(_, index) {
        return (index + 1) * sign;
    }).reduce(function(total, current) {
        return total + current;
    }, 0);
};

package main

import (
	"fmt"
)

// 1. Gauss Formula
// Time: O(1)
// Space: O(1)
// Uses arithmetic series formula: n(n+1)/2
func sum_to_n_a(n int) int {
	sign := 1
	if n < 0 {
		sign = -1
		n = -n
	}

	// prevent overflow during multiplication
	return sign * int(int64(n)*int64(n+1)/2)
}

// 2. Iterative Loop
// Time: O(n)
// Space: O(1)
// Baseline accumulation from 1 to n.
func sum_to_n_b(n int) int {
	sign := 1
	if n < 0 {
		sign = -1
		n = -n
	}

	sum := 0
	for i := 1; i <= n; i++ {
		sum += i
	}

	return sign * sum
}

// 3. Recursive Divide & Conquer
// Time: O(n)
// Space: O(p + log n) number of goroutines + recursion stack
// Splits range into two halves recursively to a depth limit then.
func sum_to_n_c(n int) int {
	sign := 1
	if n < 0 {
		sign = -1
		n = -n
	}

	return sign * parallelSum(1, n, 4) // depth limit
}

func parallelSum(l, r, depth int) int {
	if l > r {
		return 0
	}
	if l == r {
		return l
	}

	// switch to sequential once depth is low
	if depth == 0 || (r-l) < 1000 {
		sum := 0
		for i := l; i <= r; i++ {
			sum += i
		}
		return sum
	}

	mid := (l + r) / 2

	var left, right int
	done := make(chan struct{}, 2)

	go func() {
		left = parallelSum(l, mid, depth-1)
		done <- struct{}{}
	}()

	go func() {
		right = parallelSum(mid+1, r, depth-1)
		done <- struct{}{}
	}()

	<-done
	<-done

	return left + right
}

func main() {
	fmt.Println(sum_to_n_a(-5)) // 15
	fmt.Println(sum_to_n_b(-5)) // 15
	fmt.Println(sum_to_n_c(-5)) // 15
}

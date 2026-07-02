package main

import "testing"

func Benchmark_sum_to_n_a(b *testing.B) {
	for i := 0; i < b.N; i++ {
		sum_to_n_a(2560000)
	}
}

func Benchmark_sum_to_n_b(b *testing.B) {
	for i := 0; i < b.N; i++ {
		sum_to_n_b(256000)
	}
}

func Benchmark_sum_to_n_c(b *testing.B) {
	for i := 0; i < b.N; i++ {
		sum_to_n_c(256000)
	}
}

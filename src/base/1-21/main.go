package main

import (
	"1-21/calculator"
	"fmt"
)

func main() {
	fmt.Println("calculator")

	result := calculator.Add(10, 15)
	fmt.Println("10 + 15 = ", result)

	result = calculator.Multiply(10, 15)
	fmt.Println("10 * 15 = ", result)

	calculator.BenchmarkCalculator()
}

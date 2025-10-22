package calculator

import "fmt"

func Add(a, b int) int {
	return a + b
}

func Multiply(a, b int) int {
	return a * b
}

func BenchmarkCalculator() {
	fmt.Printf("开始性能测试...\n")
	sum := 0
	for i := 0; i < 100000000; i++ {
		sum += i
	}

	fmt.Printf("结束性能测试，结果为：%d\n", sum)
}

package main

import "fmt"
import "cmp"

func PrintSlice[T any](s []T) {
	for _, v := range s {
		fmt.Println(v, " ")
	}
	fmt.Println()
}

func FindIndex[T comparable](slice []T, target T) int {
	for i, v := range slice {
		if v == target {
			return i
		}
	}
	return -1
}

func Max[T cmp.Ordered](a, b T) T {
	if a > b {
		return a
	}
	return b
}

type Stringer interface {
	String() string
}

func PrintAll[T Stringer](items []T) {
	for _, item := range items {
		fmt.Println(item.String())
	}
}

type Number interface {
	~int | ~float64
}

func Sum[T Number](nums ...T) T {
	var sum T
	for _, num := range nums {
		sum += num
	}
	return sum
}

type Person struct {
	Name string
	Age  int
}

func (p Person) String() string {
	return fmt.Sprintf("Name: %s, Age: %d", p.Name, p.Age)
}

func main() {
	intSlice := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	PrintSlice(intSlice)
	fmt.Println(FindIndex(intSlice, 5))

	strSlice := []string{"hello", "world", "golang"}
	PrintSlice(strSlice)
	fmt.Println(FindIndex(strSlice, "world"))

	fmt.Println(Max(1, 2))
	fmt.Println(Max(1.2, 22.2))

	persons := []Person{
		{"Alice", 18},
		{"Bob", 20},
		{"Charlie", 22},
	}
	PrintAll(persons)

	ints := []int{1, 2, 3, 4, 5}
	floats := []float64{1.1, 2.2, 3.3, 4.4, 5.5}

	fmt.Println(Sum(ints...))
	fmt.Println(Sum(floats...))

	// 打开注释需要： go run main.go tools.go 的方式运行，否则会报错 demoMyTools() 函数未定义
	//fmt.Println("-----------------------------------")
	//demoMyTools()

	pair1 := Pair[string, int]{"hello", 1}
	pair2 := Pair[int, string]{2, "world"}

	fmt.Println(pair1, pair2)

}

type Pair[K comparable, V any] struct {
	Key   K
	Value V
}

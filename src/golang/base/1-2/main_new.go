package main

import "fmt"

func main() {
	var str string = "hello1" // 标准定义
	var str2 = "hello2"       // 类型推导
	str3 := "hello3"          // 短定义（简单定义）

	str, str2 = str2, str
	fmt.Println(str, str2, str3)

	zeroValueTest()
	typeConversion()

	var meter Meter1 = 1
	fmt.Println(meter)

	person := PersonValue{
		Name: "tom",
		Age:  10,
	}
	fmt.Println(person)

	var array [3]int // 0,0,0
	b := [3]int{10, 20, 30}
	fmt.Println(array, b)

	var slice []int
	slice = append(slice, 1, 2, 3)
	fmt.Println(slice)
	s1 := []int{1, 2, 3, 4, 5, 6}
	fmt.Println(s1)
	//s2 := make([]int, 0, len(s1))
	//s3 := new([]int)

	m1 := map[string]int{"Go": 88, "python": 66}
	fmt.Println(m1)

	m2 := make(map[string]int)
	m2["Go"] = 98
	m2["python"] = 95
	fmt.Println(m2)

	for k, v := range m1 {
		fmt.Println(k, v)
	}

}

func zeroValueTest() {
	var a int
	var b float64
	var c string
	fmt.Println(a, b, "-", c, "-")
}

func typeConversion() {
	var a int = 1
	var b float64 = 1.1
	fmt.Println(a + int(b))
}

type Meter1 float64

func (m Meter1) String() string {
	return fmt.Sprintf("%.2f m", m)
}

// 常量
//const (
//	StatusOK = iota + 1
//	StatusError
//	StatusTimeout
//
//	MB = 1024 * 124
//)

type PersonValue struct {
	Age  int
	Name string
}

func (p PersonValue) String() string {
	return fmt.Sprintf("Name: %s, Age: %d", p.Name, p.Age)
}

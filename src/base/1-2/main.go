package main

import "fmt"

// 变量， 常量， 基本类型（int float64 string）， 复合类型（切片， 数组， map， 结构体）， 类型转换   int 1  强制转换为float64(1)

const (
	StatusOK = iota + 1
	StatusError
	StatusTimeout

	MB = 1024 * 124

	LoginPlatformWechat = "wechat"
	LoginPlatformQQ     = "qq"
)

// 变量零值
func testZeroValue() {
	var (
		a int
		b float64
		c string
	)

	fmt.Println(a, b, c)
}

// 类型转换
func testTypeConversion() {
	var a int = 1
	var b float64 = 1.1

	fmt.Println(a + int(b))
}

// 自定义类型
type Meter float64
type Foot float64

func (m Meter) String() string {
	return fmt.Sprintf("%.2f m", m)
}

func (f Foot) String() string {
	return fmt.Sprintf("%.2f ft", f)
}

type Person struct {
	Name string
	Age  int
}

func (p Person) String() string {
	return fmt.Sprintf("Name: %s, Age: %d", p.Name, p.Age)
}

func main() {
	var str string = "hello1" // 标准定义
	var str2 = "hello2"       // 类型推导
	str3 := "hello3"          // 短定义（简单定义）

	str, str2 = str2, str

	fmt.Println(str, str2, str3)

	testZeroValue()
	testTypeConversion()

	var meter Meter = 1
	fmt.Println(meter)

	person := Person{
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
	s1 := []int{1, 2, 3, 4}
	fmt.Println(s1)

	s2 := make([]int, 3)
	fmt.Println(s2)

	s3 := new([]int)
	fmt.Println(s3)
	for i, v := range slice {
		fmt.Println(i, v)
	}

	//var m0 map[string]int

	m1 := map[string]int{"Go": 98, "python": 95}
	fmt.Println(m1)

	m2 := make(map[string]int)
	m2["Go"] = 98
	m2["python"] = 95
	fmt.Println(m2)

	for _, v := range m1 {
		fmt.Println(v)
	}

	// 课后练习
	// 不用第三个变量交换两个变量知
	// iota 定义星期一到星期天
	// 写一个求平均分   average（scoreMap map[string]float64） float64  平均分
}

package main

import (
	"errors"
	"fmt"
	"sort"
)

func main() {
	_, err := ValidateUser("admin", "123456")
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("用户注册成功")
	}

	userName, age, err := queryUser(1)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("用户信息:", userName, age)
	}

	counterFun := createCounter()
	for i := 0; i < 5; i++ {
		fmt.Println("funcCounter ", counterFun())
	}

	strs := []string{"hello", "world", "golang"}
	sort.Slice(strs, func(i, j int) bool {
		return strs[j] < strs[i]
	})
	fmt.Println(strs)

	procStrFun := func(str string) string {
		return fmt.Sprintf("%s-1", str)
	}
	strs = ProcessStrings(strs, procStrFun)
	fmt.Println(strs)

	fmt.Println(sum(1, 2, 3, 4, 5))
	fmt.Println(sum(1, 2, 3))
	array := []int{1, 2, 3, 4}
	fmt.Println(sum(array...))
}

// 用户注册验证函数
func ValidateUser(username, password string) (bool, error) {
	if len(username) < 3 {
		return false, errors.New("用户名长度不能小于3")
	}
	if len(password) < 6 {
		return false, errors.New("密码长度不能小于6")
	}
	return true, nil
}

func queryUser(userId int) (string, int, error) {
	if userId <= 0 {
		return "", 0, errors.New("用户ID不能小于等于0")
	}
	// 模拟数据库查询
	users := map[int]struct {
		Name string
		Age  int
	}{
		1: {"张三", 18},
		2: {"李四", 20},
		3: {"王五", 22},
	}
	if user, ok := users[userId]; ok {
		return user.Name, user.Age, nil
	}
	return "", 0, errors.New("用户不存在")
}

func createCounter() func() int {
	count := 0
	return func() int {
		count++
		return count
	}
}

type StringProcessor func(string) string

func ProcessStrings(strs []string, processor StringProcessor) []string {
	var result []string
	for _, str := range strs {
		result = append(result, processor(str))
	}
	return result
}

func sum(numbers ...int) int {
	total := 0
	for _, num := range numbers {
		total += num
	}
	return total
}

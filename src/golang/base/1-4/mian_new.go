package main

import (
	"fmt"
	"time"
)

func main() {
	score := 80
	if score >= 90 {
		fmt.Println("优秀")
	} else if score >= 80 {
		fmt.Println("良好")
	} else if score >= 60 {
		fmt.Println("及格")
	} else {
		fmt.Println("不及格")
	}

	orders := []string{"order 1", "order 2", "order 3", "order 4"}
	for i, v := range orders {
		fmt.Println("处理的第", i, "个订单", v)
	}
	i := 0
	for {
		fmt.Println("处理订单")
		i++
		if i > 5 {
			break
		}
	}

	statusCode := 201
	switch statusCode {
	case 200, 201:
		fmt.Println("OK")
	case 404:
		fmt.Println("NOT FOUND")
	case 500:
		fmt.Println("SERVER ERROR")
	default:
		fmt.Println("UNKNOWN")
	}

	num := 75
	switch {
	case num >= 90:
		fmt.Println("优秀")
	case num >= 80:
		fmt.Println("良好")
	case num >= 60:
		fmt.Println("及格")
	default:
		fmt.Println("不及格")
	}

	ch := make(chan string, 1)
	go func() {
		time.Sleep(2 * time.Second)
		ch <- "任务完成"
	}()
	select {
	case msg := <-ch:
		fmt.Println(msg)
	case <-time.After(4 * time.Second):
		fmt.Println("任务超时")
	}

	studentScore := map[string]int{"张三": 90, "李四": 80, "王五": 70}
	for name, score := range studentScore {
		if score >= 60 {
			fmt.Println(name, "通过")
		} else {
			fmt.Println(name, "未通过")
		}
	}

	str := "hello 世界"
	for i := 0; i < len(str); i++ {
		fmt.Println(i, string(str[i]))
	}

}

package main

import (
	"fmt"
	"time"
)

func main() {
	// 成绩等级判断
	score := 95
	if score >= 90 {
		fmt.Println("优秀")
	} else if score >= 80 {
		fmt.Println("良好")
	} else if score >= 60 {
		fmt.Println("及格")
	} else {
		fmt.Println("不及格")
	}

	// 模拟批量处理订单
	orders := []string{"order 1", "order 2", "order 3", "order 4"}
	for i, v := range orders {
		fmt.Println("处理的第", i, "个订单", v)
	}

	// http code处理
	statusCode := 200
	switch statusCode {
	case 200:
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

	// select 并发里面控制超时
	ch := make(chan string, 1)
	go func() {
		time.Sleep(2 * time.Second)
		ch <- "任务完成"
	}()

	select {
	case msg := <-ch:
		fmt.Println(msg)
	case <-time.After(5 * time.Second):
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
	students := []string{"张三", "李四", "王五"}
	for _, name := range students {
		fmt.Println(name)
	}

	str := "hello 世界"
	for i := 0; i < len(str); i++ {
		fmt.Println(i, str[i])
	}

}

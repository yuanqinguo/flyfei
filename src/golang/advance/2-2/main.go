package main

import (
	"fmt"
	"math/rand"
	"time"
)

type Order struct {
	ID        int
	UserID    string
	Amount    float64
	Status    string
	CreatedAt time.Time
}

// 生产者--产生订单
func orderProduct(orderChan chan<- Order, number int) {
	for i := 1; i <= number; i++ {
		order := Order{
			ID:        i,
			UserID:    fmt.Sprintf("user_%d", rand.Intn(100)),
			Amount:    rand.Float64() * 1000,
			Status:    "pending",
			CreatedAt: time.Now(),
		}
		orderChan <- order
		fmt.Printf("生成订单：ID=%d, 用户ID=%s, 金额=%.2f\n", order.ID, order.UserID, order.Amount)
		time.Sleep(time.Duration(rand.Intn(1000)) * time.Millisecond)
	}
	close(orderChan)
}

func orderProcessor(orderChan <-chan Order, resultChan chan<- Order) {
	for order := range orderChan {
		fmt.Printf("处理订单：ID=%d, 用户ID=%s, 金额=%.2f\n", order.ID, order.UserID, order.Amount)
		time.Sleep(time.Duration(rand.Intn(1000)) * time.Millisecond)
		order.Status = "completed"
		resultChan <- order
	}
	close(resultChan)
}

func orderResultCollector(resultChan <-chan Order, done chan<- bool) {
	for order := range resultChan {
		fmt.Printf("订单处理结果：ID=%d, 用户ID=%s, 状态=%s\n", order.ID, order.UserID, order.Status)
	}
	done <- true
}

func main() {
	//rand.Seed(time.Now().UnixNano())
	//
	//orderChan := make(chan Order, 10)
	//resultChan := make(chan Order, 10)
	//done := make(chan bool)
	//
	//go orderProduct(orderChan, 20)
	//
	//for i := 0; i <= 3; i++ {
	//	go orderProcessor(orderChan, resultChan)
	//}
	//
	//go orderResultCollector(resultChan, done)
	//
	//<-done

	//ch1 := make(chan string)
	//ch2 := make(chan string)
	//go func() {
	//	time.Sleep(time.Second * 2)
	//	ch1 <- "来自ch1"
	//}()
	//go func() {
	//	time.Sleep(time.Second * 2)
	//	ch1 <- "来自ch2"
	//}()
	//
	//for i := 0; i < 2; i++ {
	//	select {
	//	case msg := <-ch1:
	//		fmt.Println(msg)
	//	case msg := <-ch2:
	//		fmt.Println(msg)
	//	case <-time.After(time.Second * 1):
	//		fmt.Println("超时")
	//		return
	//	}
	//}

	//ticker := time.NewTicker(500 * time.Millisecond)
	//done := make(chan bool)
	//go func() {
	//	for {
	//		select {
	//		case <-done:
	//			return
	//		case t := <-ticker.C:
	//			fmt.Println("当前时间：", t.Format("2006-01-02 15:04:05"))
	//		}
	//	}
	//}()
	//
	//time.Sleep(2 * time.Second)
	//ticker.Stop()
	//done <- true
	//fmt.Println("停止计时器")

	jobs := make(chan int, 100)
	results := make(chan int, 100)

	for i := 0; i < 3; i++ {
		go worker(jobs, results)
	}
	for i := 0; i < 100; i++ {
		jobs <- i
	}
	close(jobs)
	for value := range results {
		fmt.Println("result:", value)
	}
}

func worker(jobs <-chan int, results chan<- int) {
	for j := range jobs {
		fmt.Println("worker:", j)
		time.Sleep(time.Second)
		results <- j * 2
	}
	close(results)
}

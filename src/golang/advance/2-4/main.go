package main

import (
	"fmt"
	"math/rand"
	"sync"
	"time"
)

type Order struct {
	ID       int
	UserID   int
	Amount   float64
	Status   string
	CreateAt time.Time
}

// 1. 生产者消费者模型
func orderProduct(orderChan chan<- Order, number int) {
	defer close(orderChan)
	for i := 1; i <= number; i++ {
		order := Order{
			ID:       i,
			UserID:   rand.Intn(1000) + 1,
			Amount:   rand.Float64() * 1000,
			Status:   "pending",
			CreateAt: time.Now(),
		}
		fmt.Printf("生成订单: ID=%d, 金额=¥%.2f\n", order.ID, order.Amount)
		orderChan <- order
		time.Sleep(time.Duration(rand.Intn(1000)) * time.Millisecond) // 模拟生产间隔
	}
}

func orderConsumer(orderChan <-chan Order, wg *sync.WaitGroup) {
	defer wg.Done()
	for order := range orderChan {
		// 模拟订单处理
		time.Sleep(200 * time.Millisecond)
		order.Status = "processed"
		fmt.Printf("处理订单: ID=%d, 状态=%s\n", order.ID, order.Status)
	}
}

// 扇出
func funOutProcessor(inputChan <-chan Order, orderType int, wg *sync.WaitGroup) {
	defer wg.Done()
	for order := range inputChan {
		switch orderType {
		case 1: // 计算折扣
			order.Amount *= 0.8
			fmt.Printf("计算折扣: ID=%d, 状态=%s, 金额：%.2f\n", order.ID, order.Status, order.Amount)
		case 2: // 发送通知
			fmt.Printf("发送通知: ID=%d, 状态=%s\n", order.ID, order.Status)
		case 3: // 记录日志
			fmt.Printf("记录日志: ID=%d, 状态=%s\n", order.ID, order.Status)
		}
		time.Sleep(time.Millisecond * 100)
	}
}

// 4. Pipeline模式：订单处理流水线
func validationStage(input <-chan Order) <-chan Order {
	output := make(chan Order, 10)
	go func() {
		defer close(output)
		for order := range input {
			// 第一阶段：订单验证
			time.Sleep(50 * time.Millisecond)
			if order.Amount > 0 {
				order.Status = "validated"
				fmt.Printf("验证通过: 订单%d\n", order.ID)
				output <- order
			} else {
				fmt.Printf("验证失败: 订单%d金额异常\n", order.ID)
			}
		}
	}()
	return output
}

func paymentStage(input <-chan Order) <-chan Order {
	output := make(chan Order, 10)
	go func() {
		defer close(output)
		for order := range input {
			// 第二阶段：支付处理
			time.Sleep(100 * time.Millisecond)
			order.Status = "paid"
			fmt.Printf("支付成功: 订单%d\n", order.ID)
			output <- order
		}
	}()
	return output
}

func shippingStage(input <-chan Order) <-chan Order {
	output := make(chan Order, 10)
	go func() {
		defer close(output)
		for order := range input {
			// 第三阶段：发货处理
			time.Sleep(150 * time.Millisecond)
			order.Status = "shipped"
			fmt.Printf("发货完成: 订单%d\n", order.ID)
			output <- order
		}
	}()
	return output
}

func main() {
	//rand.Seed(time.Now().UnixNano())
	//
	//fmt.Println("=== 1. 生产者-消费者模式演示 ===")
	//// 创建订单channel
	//orderCh := make(chan Order, 5)
	//var wg sync.WaitGroup
	//
	//// 启动消费者
	//wg.Add(2)
	//go orderConsumer(orderCh, &wg)
	//go orderConsumer(orderCh, &wg)
	//
	//// 启动生产者
	//go orderProduct(orderCh, 6)
	//
	//wg.Wait()

	//fmt.Println("\n=== 2. 扇出模式演示 ===")
	//// 扇出：一个输入，多个处理器
	//fanOutCh := make(chan Order, 10)
	//var fanOutWg sync.WaitGroup
	//
	//// 启动3个处理器
	//fanOutWg.Add(3)
	//for i := 1; i <= 3; i++ {
	//	go funOutProcessor(fanOutCh, i, &fanOutWg)
	//}
	//
	//// 生产一些测试数据
	//go func() {
	//	for i := 1; i <= 6; i++ {
	//		fanOutCh <- Order{
	//			ID:     i,
	//			Amount: float64(i * 100),
	//			Status: "pending",
	//		}
	//	}
	//	close(fanOutCh)
	//}()
	//
	//fanOutWg.Wait()

	fmt.Println("\n=== 3. Pipeline模式演示 ===")
	// 创建初始输入
	pipelineInput := make(chan Order, 10)

	// 构建流水线
	validatedOrders := validationStage(pipelineInput)
	paidOrders := paymentStage(validatedOrders)
	shippedOrders := shippingStage(paidOrders)

	// 发送测试订单到流水线
	go func() {
		for i := 1; i <= 3; i++ {
			pipelineInput <- Order{
				ID:     i,
				UserID: i * 10,
				Amount: float64(i * 50),
				Status: "new",
			}
		}
		close(pipelineInput)
	}()

	// 收集最终结果
	fmt.Println("流水线处理结果:")
	for order := range shippedOrders {
		fmt.Printf("  完成: 订单%d, 状态: %s\n", order.ID, order.Status)
	}

}

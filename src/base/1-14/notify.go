package main

import "fmt"

type Notifier interface {
	Notify(message string) error
}

type EmailNotifier struct {
	SMTPHost string
	Port     int
}

func (e EmailNotifier) Notify(message string) error {
	fmt.Printf("发送邮件通知：%s\n", message)
	return nil
}

type SmsNotifier struct {
	APIKey   string
	TmplCode string
}

func (s SmsNotifier) Notify(message string) error {
	fmt.Printf("发送短信通知：%s\n", message)
	return nil
}

type BroadCastNotifier struct {
	notifiers []Notifier
}

func (b *BroadCastNotifier) Notify(message string) error {
	for _, n := range b.notifiers {
		err := n.Notify(message)
		if err != nil {
			return err
		}
	}
	return nil
}

type OrderService struct {
	notifier Notifier
}

func (o *OrderService) SetNotifier(n Notifier) {
	o.notifier = n
}

func (o *OrderService) CreateOrder(product string, quantity int) {
	fmt.Printf("创建订单：%s x %d\n", product, quantity)
	err := o.notifier.Notify("订单已创建")
	if err != nil {
		fmt.Println("通知失败：", err)
	}
}

func notifyMain() {
	orderService := &OrderService{}

	emailNotifier := EmailNotifier{
		SMTPHost: "smtp.example.com",
		Port:     587,
	}
	smsNotifier := SmsNotifier{
		APIKey:   "your_api_key",
		TmplCode: "your_template_code",
	}
	broadcastNotifier := &BroadCastNotifier{
		notifiers: []Notifier{emailNotifier, smsNotifier},
	}

	orderService.SetNotifier(emailNotifier)
	orderService.CreateOrder("手机-email", 1)

	orderService.SetNotifier(smsNotifier)
	orderService.CreateOrder("手机-sms", 1)

	orderService.SetNotifier(broadcastNotifier)
	orderService.CreateOrder("手机-broadcast", 1)
}

//- **结构体代替类**：Go使用结构体组织数据，方法通过接收者定义
//- **组合优于继承**：通过结构体嵌入实现代码复用，而非传统继承
//- **方法接收者**：值接收者不修改原对象，指针接收者可修改原对象
//- **接口实现多态**：不同类型实现相同接口，提高代码灵活性
//- **方法提升**：嵌入结构体的方法和字段会自动提升到外部结构体

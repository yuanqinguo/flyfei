package main

import (
	"fmt"
	"time"
)

type Payment interface {
	Pay(amount float64) (string, error)
	Refund(transactionID string, amount float64) (string, error)
}

type Queryer interface {
	Query(transactionID string) (string, error)
}

type PaymentService interface {
	Payment
	Queryer
}

type Alipay struct {
	AppID      string
	AppSecret  string
	MerchantID string
}

func (a Alipay) Pay(amount float64) (string, error) {
	return fmt.Sprintf("ALIPAY-%d", time.Now().Unix()), nil
}

func (a Alipay) Refund(transactionID string, amount float64) (string, error) {
	return fmt.Sprintf("ALIPAY-REFUND-%s", transactionID), nil
}

func (a Alipay) Query(transactionID string) (string, error) {
	return "Alipay 成功", nil
}

type WechatPay struct {
	AppID      string
	AppSecret  string
	MerchantID string
}

func (a WechatPay) Pay(amount float64) (string, error) {
	return fmt.Sprintf("WECHAT-%d", time.Now().Unix()), nil
}

func (a WechatPay) Refund(transactionID string, amount float64) (string, error) {
	return fmt.Sprintf("WECHAT-REFUND-%s", transactionID), nil
}

func (a WechatPay) Query(transactionID string) (string, error) {
	return "Wechat 成功", nil
}

// 抽象 多态
func ProcessPayment(p PaymentService, amount float64) (string, error) {
	fmt.Println("开始处理支付请求....")
	transcationID, err := p.Pay(amount)
	if err != nil {
		return "", err
	}
	fmt.Printf("支付成功，交易号：%s\n", transcationID)
	return transcationID, nil
}

func main() {
	alipay := Alipay{
		AppID:      "123456",
		AppSecret:  "dsfasdfasdf",
		MerchantID: "123",
	}
	wechatPay := WechatPay{
		AppID:      "0987654",
		AppSecret:  "dfasdfasdfadsf",
		MerchantID: "321",
	}

	transcations := []struct {
		Payment PaymentService
		Amount  float64
		Name    string
	}{
		{alipay, 100, "支付宝"},
		{wechatPay, 200, "微信"},
	}

	for _, pp := range transcations {
		transcationID, err := ProcessPayment(pp.Payment, pp.Amount)
		if err != nil {
			fmt.Printf("支付失败，错误信息：%s\n", err.Error())
			continue
		}
		fmt.Printf("ProcessPayment  支付成功，交易号：%s\n", transcationID)
	}

	var anything interface{}
	processEmptyInterface(anything)
	anything = 123
	processEmptyInterface(anything)
	anything = "hello world"
	processEmptyInterface(anything)

}

func processEmptyInterface(i interface{}) {
	switch v := i.(type) {
	case int:
		fmt.Println("int:", v)
	case string:
		ss := i.(string)
		fmt.Println("string:", ss)
	default:
		fmt.Println("unknown")
	}
}

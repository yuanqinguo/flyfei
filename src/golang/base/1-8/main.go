package main

import "fmt"

type CartItem struct {
	Name     string
	Price    float64
	Quantity int
}

func main() {
	//var cart []CartItem
	//cart := make([]CartItem, 0)

	cart := make([]CartItem, 0, 3)

	cart = append(cart, CartItem{
		Name:     "手机",
		Price:    5999.99,
		Quantity: 1,
	})
	cart = append(cart, CartItem{
		Name:     "电脑",
		Price:    3999.99,
		Quantity: 2,
	})
	cart = append(cart, CartItem{
		Name:     "鼠标",
		Price:    100,
		Quantity: 1,
	})

	total := 0.0
	totalQ := 0
	for _, item := range cart {
		fmt.Printf("商品名称：%s, 价格：%.2f, 数量：%d\n", item.Name, item.Price, item.Quantity)
		total += item.Price * float64(item.Quantity)
		totalQ = totalQ + item.Quantity
	}

	fmt.Printf("购物车总价格：%.2f\n", total)
	fmt.Println("商品数量：", totalQ)

	// 模拟上皮你移除
	if len(cart) > 0 {
		cart = cart[1:]
	}

	total = 0.0
	totalQ = 0
	for _, item := range cart {
		fmt.Printf("移除后 -- 商品名称：%s, 价格：%.2f, 数量：%d\n", item.Name, item.Price, item.Quantity)
		total += item.Price * float64(item.Quantity)
		totalQ = totalQ + item.Quantity
	}
	fmt.Println("移除后的商品数量：", totalQ)
}

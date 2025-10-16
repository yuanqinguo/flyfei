package main

import (
	"1-15/product"
	"1-15/user"
	"fmt"
	_ "net/http/pprof"
)

func main() {
	userService := user.NewUserService()

	fmt.Println("用户服务测试")
	userService.AddUser(user.CreateUser("张三", "zhangsan@gmail.com", "123456"))
	userService.AddUser(user.CreateUser("李四", "lisi@gmail.com", "123456"))

	userService.ListAllUsers()

	productService := product.NewProductService()

	fmt.Println("商品服务测试")
	findID := productService.AddProduct("iPhone 17", 5999.00, 100)
	productService.AddProduct("MacBook Pro", 19999.00, 50)

	productService.FindProductByID(findID).DisplayInfo()

	fmt.Println(product.TestMessage)
}

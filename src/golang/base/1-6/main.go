package main

import "fmt"

type User struct {
	ID      int
	Name    string
	Balance float64
}

func updateBalanceValue(user User, amount float64) {
	user.Balance += amount
	fmt.Println("updateBalanceValue 更新后的余额:", user.Balance)
}

func updateBalancePointer(user *User, amount float64) {
	user.Balance += amount
	fmt.Println("updateBalancePointer 更新后的余额:", user.Balance)
}

func main() {
	user := User{ID: 1, Name: "张三", Balance: 100.0}
	updateBalanceValue(user, 50.0)
	fmt.Println("updateBalanceValue ", user)

	updateBalancePointer(&user, 60.0)
	fmt.Println("updateBalancePointer ", user)

	users := []*User{
		&User{ID: 1, Name: "张三", Balance: 100.0},
		&User{ID: 2, Name: "李四", Balance: 200.0},
		&User{ID: 3, Name: "王五", Balance: 300.0},
	}
	for _, user := range users {
		user.Balance += 50.0
	}
	for _, u := range users {
		fmt.Println("更新后的余额:", u.Balance)
	}

	fmt.Println("---------------------------------")
	x := 10
	p := &x
	fmt.Println("x:", x, "p:", p, "*p:", *p)

	pp := &p
	fmt.Println("p:", p, "pp:", pp, "**pp:", **pp)
}

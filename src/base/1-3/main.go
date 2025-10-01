package main

import (
	"fmt"
)

const (
	ReadPermission    = 1 << iota // 0001
	WritePermission               // 0010
	ExecutePermission             // 0100
)

func main() {
	// 订单计算折扣
	price := 299.9
	discount := 0.8

	orderAmount := price * discount
	fmt.Println("原价：", price, " 折扣：", discount, " 折后价:", orderAmount)

	// 权限校验的场景
	isAmin := true
	hasWritePermission := false

	canEdit := isAmin && hasWritePermission
	fmt.Println("可以编辑吗？ ", canEdit)
	// 年龄验证
	age := 18
	canVote := age >= 18
	fmt.Println("可以投票吗？ ", canVote)

	// 检查是否有写的权限
	userPerm := ReadPermission | WritePermission // 0001 | 0010 = 0011
	if userPerm&WritePermission != 0 {           // 0011 & 0010 = 0010
		fmt.Println("有写权限")
	}

	a := 10
	a++ // a = 11

	a += 5 // a = a + 5
	a -= 5 //a = a -5

}

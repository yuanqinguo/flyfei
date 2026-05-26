package main

import "fmt"

const (
	ReadPermission    = 1 << iota // 0001
	WritePermission               // 0010
	ExecutePermission             // 0100
)

func main() {
	price := 299.9
	discount := 0.8
	orderAmount := price * discount
	fmt.Println("原价：", price, " 折扣：", discount, " 折后价:", orderAmount)

	isAdmin := true
	hasWritePermission := false
	canEdit := isAdmin && hasWritePermission
	fmt.Println("可以编辑吗？ ", canEdit)

	age := 18
	canVote := age >= 18
	fmt.Println("可以投票吗？ ", canVote)

	userPerm := ReadPermission | WritePermission // 0001 | 0010 = 0011
	if userPerm&WritePermission != 0 {           // 0011 & 0010 = 0010
		fmt.Println("有写的权限")
	}

	a := 10
	a++ // a = 11

	a += 5 // a = a + 5
	a -= 5 // a = a -5
}

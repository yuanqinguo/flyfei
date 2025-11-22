package main

import "fmt"

type MyInt int

type User struct {
	ID       int
	UserName string
	Password string
	Email    string
	Age      int
	Address  Address
}

type Address struct {
	Province string
	City     string
	Street   string
	ZipCode  string
}

type UserProfile struct {
	ID       int
	UserName string
	Address
}

func main() {
	addr := Address{
		Province: "北京1",
		City:     "北京",
		Street:   "北京1",
		ZipCode:  "100000",
	}
	user1 := User{
		ID:       1,
		UserName: "admin1",
		Password: "password",
		Email:    "1111@qq.com",
		Age:      18,
		Address:  addr,
	}
	user2 := User{
		ID:       2,
		UserName: "admin2",
		Password: "password",
		Email:    "2222@qq.com",
		Age:      18,
		Address: Address{
			Province: "北京2",
			City:     "北京",
			Street:   "北京2",
			ZipCode:  "100000",
		},
	}

	fmt.Printf("用户名：%s, 城市：%s, 街道：%s\n", user1.UserName, user1.Address.Province, user1.Address.Street)
	fmt.Printf("用户名：%s, 城市：%s, 街道：%s\n", user2.UserName, user2.Address.Province, user2.Address.Street)

	userProfile := UserProfile{
		ID:       1,
		UserName: "admin3",
		Address: Address{
			Province: "北京3",
			City:     "北京",
			Street:   "北京3",
			ZipCode:  "100000",
		},
	}
	fmt.Printf("用户名：%s, 城市：%s, 街道：%s\n", userProfile.UserName, userProfile.Province, userProfile.Street)

	user := &User{
		ID:       1111,
		UserName: "指针用户",
		Password: "",
		Email:    "",

		Address: Address{
			Province: "北京4",
			City:     "北京",
			Street:   "北京4",
		},
	}

	fmt.Printf("用户名：%s, 城市：%s, 街道：%s\n", user.UserName, user.Address.Province, user.Address.Street)
	newUser := new(User)
	newUser.UserName = "newUser"
	fmt.Printf("用户名：%s, 城市：%s, 街道：%s\n", newUser.UserName, newUser.Address.Province, newUser.Address.Street)
}

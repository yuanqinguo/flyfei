package user

import (
	"1-15/common"
	"fmt"
	"time"
)

type User struct {
	ID       int64
	UserName string
	Password string
	Email    string
}

func (u *User) DisplayInfo() {
	fmt.Printf("用户ID: %d, 用户名: %s, 邮箱: %s\n", u.ID, u.UserName, u.Email)
}

func (u *User) validatePassword() bool {
	return len(u.Password) >= 6
}

func CreateUser(name, email, password string) *User {
	common.LogOperation("创建用户")
	user := &User{
		ID:       time.Now().Unix(),
		UserName: name,
		Email:    email,
		Password: password,
	}
	if !user.validatePassword() {
		fmt.Println("密码强度不足")
		return user
	}
	return user
}

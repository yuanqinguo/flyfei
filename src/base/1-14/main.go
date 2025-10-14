package main

import (
	"fmt"
	"time"
)

type BaseUser struct {
	ID        int64
	UserName  string
	Email     string
	CreatedAt time.Time
}

func (u *BaseUser) GetCreateDate() string {
	return u.CreatedAt.Format("2006-01-02")
}

func (u *BaseUser) DisplayBasicInfo() {
	fmt.Printf("用户ID: %d, 用户名: %s, 邮箱: %s, 创建时间: %s\n", u.ID, u.UserName, u.Email, u.GetCreateDate())
}

type Address struct {
	Province string
	City     string
	Street   string
	Detail   string
}

func (a Address) GetFullAddress() string {
	return fmt.Sprintf("%s%s%s%s", a.Province, a.City, a.Street, a.Detail)
}

type NormalUser struct {
	BaseUser
	Address []Address
}

func (nu *NormalUser) AddAddress(address Address) {
	nu.Address = append(nu.Address, address)
}

type VIPUser struct {
	BaseUser
	Address    []Address
	VIPLevel   int
	Discount   float64
	ExpireTime time.Time
}

func (vu *VIPUser) IsVipValid() bool {
	return vu.ExpireTime.After(time.Now())
}

func (vu *VIPUser) GetDiscount() float64 {
	if vu.IsVipValid() {
		return vu.Discount
	}
	return 1.0
}

type UserService struct {
}

const (
	UserTypeNormal = "normal"
	UserTypeVIP    = "vip"
)

func genUserID() int64 {
	return time.Now().Unix()
}

func (s *UserService) CreateUser(username, email string, userType string) (interface{}, error) {
	base := BaseUser{
		ID:        genUserID(),
		UserName:  username,
		Email:     email,
		CreatedAt: time.Now(),
	}

	switch userType {
	case UserTypeNormal:
		normal := NormalUser{
			BaseUser: base,
			Address:  []Address{},
		}
		return normal, nil
	case UserTypeVIP:
		vip := VIPUser{
			BaseUser:   base,
			VIPLevel:   1,
			Discount:   0.9,
			ExpireTime: time.Now().AddDate(0, 0, 30),
		}
		return vip, nil
	default:
		return nil, fmt.Errorf("无效的用户类型")
	}
}

func main() {
	service := &UserService{}
	normalUser, err := service.CreateUser("张三", "zhangsan@example.com", UserTypeNormal)
	if err != nil {
		fmt.Println("normalUser", err)
		return
	}
	vipUser, err := service.CreateUser("李四", "zhangsan@example.com", UserTypeVIP)
	if err != nil {
		fmt.Println("vipUser", err)
		return
	}

	nUser := normalUser.(NormalUser)
	nUser.AddAddress(Address{
		Province: "广东省",
		City:     "深圳市",
		Street:   "深圳宝安大道",
		Detail:   "深圳宝安大道123号",
	})
	nUser.DisplayBasicInfo()

	users := []interface{}{nUser, vipUser}
	for _, user := range users {
		switch u := user.(type) {
		case NormalUser:
			fmt.Println("普通用户:")
			fmt.Println("用户ID:", u.ID)
			fmt.Println("用户名:", u.UserName)
			fmt.Println("邮箱:", u.Email)
			fmt.Println("创建时间:", u.GetCreateDate())
			fmt.Println("地址:")
			for _, addr := range u.Address {
				fmt.Println("-", addr.GetFullAddress())
			}
		case VIPUser:
			fmt.Println("VIP用户:")
			fmt.Println("用户ID:", u.ID)
			fmt.Println("用户名:", u.UserName)
			fmt.Println("邮箱:", u.Email)
			fmt.Println("创建时间:", u.GetCreateDate())
			fmt.Println("VIP等级:", u.VIPLevel)
			fmt.Println("折扣:", u.GetDiscount())
			fmt.Println("VIP状态:", u.IsVipValid())
		}
	}

	// notify
	notifyMain()
}

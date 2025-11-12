package main

import (
	"3-6/model"
	"3-6/query"
	"context"
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gen/field"
	"gorm.io/gorm"
)

func main() {
	dsn := "root:123456@tcp(127.0.0.1:3306)/edu.mall?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	ctx := context.Background()
	qs := query.Use(db).User
	//tqs := query.Use(db).UserProfile
	//db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
	//	err := tx.Model(&model.UserProfile{}).Where(tqs.UserID.Eq(1))
	//})

	tx := qs.WithContext(ctx)

	user := &model.User{
		Name:  "张三2",
		Email: "zhangsan@qq.com",
		Age:   18,
	}
	err = tx.Create(user)
	if err != nil {
		panic(err)
	}
	fmt.Println(user.ID)

	get, err := tx.Where(field.Or(qs.ID.Eq(1), qs.Name.Like("张三")), qs.Email.Like("zhangsan@qq.com")).First()
	if err != nil {
		panic(err)
	}

	fmt.Println(get)

}

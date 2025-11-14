package admin

import (
	"context"
	"github.com/go-redis/redis"
	"gorm.io/gorm"
	"mall/adaptor"
	"mall/adaptor/repo/model"
	"mall/adaptor/repo/query"
)

type IAdminUser interface {
	GetUserInfo(ctx context.Context, userId int64) (*model.AdminUser, error)
}

type AdminUser struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewAdminUser(adaptor *adaptor.Adaptor) *AdminUser {
	return &AdminUser{
		db:    adaptor.DbClient,
		redis: adaptor.Redis,
	}
}

func (a *AdminUser) GetUserInfo(ctx context.Context, userId int64) (*model.AdminUser, error) {
	qs := query.Use(a.db).AdminUser
	return qs.WithContext(ctx).Where(qs.ID.Eq(userId)).First()
}

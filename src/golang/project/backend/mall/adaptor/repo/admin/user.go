package admin

import (
	"context"
	"github.com/go-redis/redis"
	"gorm.io/gorm"
	"mall/adaptor"
	"mall/adaptor/repo/model"
	"mall/adaptor/repo/query"
	"mall/consts"
	"mall/service/do"
	"time"
)

type IAdminUser interface {
	CreateUser(ctx context.Context, req *do.CreateUser) (int64, error)
	UpdateUser(ctx context.Context, req *do.UpdateUser) error
	UpdateUserStatus(ctx context.Context, req *do.UpdateUserStatus) error
	UpdateUserPassword(ctx context.Context, req *do.UpdateUserPassword) error

	GetUserInfo(ctx context.Context, userId int64) (*model.AdminUser, error)
}

type AdminUser struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewAdminUser(adaptor adaptor.IAdaptor) *AdminUser {
	return &AdminUser{
		db:    adaptor.GetDB(),
		redis: adaptor.GetRedis(),
	}
}

func (a *AdminUser) CreateUser(ctx context.Context, req *do.CreateUser) (int64, error) {
	timeNow := time.Now()
	qs := query.Use(a.db).AdminUser
	addObj := &model.AdminUser{
		Name:     req.Name,
		NickName: req.NickName,
		Mobile:   req.Mobile,
		Sex:      req.Sex,
		CreateAt: timeNow,
		UpdateAt: timeNow,
		UpdateBy: req.AdminUserID,
		Status:   consts.IsEnable,
		CreateBy: req.AdminUserID,
	}
	err := qs.WithContext(ctx).Create(addObj)
	if err != nil {
		return 0, err
	}
	return addObj.ID, nil
}
func (a *AdminUser) UpdateUser(ctx context.Context, req *do.UpdateUser) error {
	qs := query.Use(a.db).AdminUser
	_, err := qs.WithContext(ctx).Where(qs.ID.Eq(req.ID)).Updates(model.AdminUser{
		Name:     req.Name,
		NickName: req.NickName,
		Sex:      req.Sex,
		UpdateAt: time.Now(),
		UpdateBy: req.AdminUserID,
	})
	if err != nil {
		return err
	}
	return nil
}
func (a *AdminUser) UpdateUserStatus(ctx context.Context, req *do.UpdateUserStatus) error {
	qs := query.Use(a.db).AdminUser
	_, err := qs.WithContext(ctx).Where(qs.ID.Eq(req.ID)).Updates(model.AdminUser{
		Status:   req.Status,
		UpdateAt: time.Now(),
		UpdateBy: req.AdminUserID,
	})
	if err != nil {
		return err
	}
	return nil
}

func (a *AdminUser) UpdateUserPassword(ctx context.Context, req *do.UpdateUserPassword) error {
	qs := query.Use(a.db).AdminUser
	_, err := qs.WithContext(ctx).Where(qs.ID.Eq(req.ID)).Updates(model.AdminUser{
		Password: req.Password,
	})
	if err != nil {
		return err
	}
	return nil
}

func (a *AdminUser) GetUserInfo(ctx context.Context, userId int64) (*model.AdminUser, error) {
	qs := query.Use(a.db).AdminUser
	return qs.WithContext(ctx).Where(qs.ID.Eq(userId)).First()
}

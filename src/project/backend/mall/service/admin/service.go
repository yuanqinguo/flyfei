package admin

import (
	"mall/adaptor"
	"mall/adaptor/repo/admin"
)

type Service struct {
	adminUser admin.IAdminUser
}

func NewService(adaptor *adaptor.Adaptor) *Service {
	return &Service{
		adminUser: admin.NewAdminUser(adaptor),
	}

}

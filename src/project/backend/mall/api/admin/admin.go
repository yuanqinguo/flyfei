package admin

import (
	"mall/adaptor"
	"mall/service/admin"
)

type Ctrl struct {
	adaptor *adaptor.Adaptor
	user    *admin.Service
}

func NewCtrl(adaptor *adaptor.Adaptor) *Ctrl {
	return &Ctrl{
		adaptor: adaptor,
		user:    admin.NewService(adaptor),
	}
}

package admin

import (
	"mall/adaptor"
	"mall/service/admin"
)

type Ctrl struct {
	adaptor adaptor.IAdaptor
	user    *admin.Service
}

func NewCtrl(adaptor adaptor.IAdaptor) *Ctrl {
	return &Ctrl{
		adaptor: adaptor,
		user:    admin.NewService(adaptor),
	}
}

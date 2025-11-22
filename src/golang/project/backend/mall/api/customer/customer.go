package customer

import (
	"mall/adaptor"
)

type Ctrl struct {
	adaptor adaptor.IAdaptor
}

func NewCtrl(adaptor adaptor.IAdaptor) *Ctrl {
	return &Ctrl{
		adaptor: adaptor,
	}
}

package customer

import (
	"mall/adaptor"
)

type Ctrl struct {
	adaptor *adaptor.Adaptor
}

func NewCtrl(adaptor *adaptor.Adaptor) *Ctrl {
	return &Ctrl{
		adaptor: adaptor,
	}
}

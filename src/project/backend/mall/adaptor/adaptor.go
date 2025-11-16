package adaptor

import (
	"github.com/go-redis/redis"
	"gorm.io/gorm"
	"mall/config"
)

type IAdaptor interface {
	GetConfig() *config.Config
	GetDB() *gorm.DB
	GetRedis() *redis.Client
}

type Adaptor struct {
	conf  *config.Config
	db    *gorm.DB
	redis *redis.Client
}

func NewAdaptor(conf *config.Config, db *gorm.DB, redis *redis.Client) *Adaptor {
	return &Adaptor{
		conf:  conf,
		db:    db,
		redis: redis,
	}
}

func (a *Adaptor) GetConfig() *config.Config {
	return a.conf
}

func (a *Adaptor) GetDB() *gorm.DB {
	return a.db
}

func (a *Adaptor) GetRedis() *redis.Client {
	return a.redis
}

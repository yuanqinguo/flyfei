package main

import (
	"errors"
	"fmt"
	"github.com/spf13/viper"
	_ "github.com/spf13/viper/remote"
	"log"
	"os"
	"time"
)

type Config struct {
	App      AppConfig      `yaml:"app"`
	Database DatabaseConfig `yaml:"database"`
	Redis    RedisConfig    `yaml:"redis"`
	Log      LogConfig      `yaml:"log"`
	Email    EmailConfig    `yaml:"email"`
}

type AppConfig struct {
	Name        string `yaml:"name"`
	Port        int    `yaml:"port"`
	Debug       bool   `yaml:"debug"`
	Version     string `yaml:"version"`
	Environment string `yaml:"environment"`
}

type DatabaseConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
	Name     string `yaml:"name"`
}

type RedisConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Password string `yaml:"password"`
	DB       int    `yaml:"db"`
}

type LogConfig struct {
	Level      string `yaml:"level"`
	Path       string `yaml:"path"`
	MaxSize    int    `yaml:"max_size"`
	MaxBackups int    `yaml:"max_backups"`
}

type EmailConfig struct {
	SMTPHost string `yaml:"smtp_host"`
	SMTPPort int    `yaml:"smtp_port"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
}

var C Config

func Load() error {
	v := viper.New()
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")
	v.SetEnvPrefix("APP")
	v.AutomaticEnv()

	// 1. 先尝试本地文件
	if _, err := os.Stat("config111.yaml"); err == nil {
		if err := v.ReadInConfig(); err != nil {
			return err
		}
		return v.Unmarshal(&C)
	}

	// 2. 本地不存在，用 etcd
	if err := v.AddRemoteProvider("etcd3", "127.0.0.1:2379", "/config/demo"); err != nil {
		return err
	}
	if err := v.ReadRemoteConfig(); err != nil {
		return errors.New("local file missing & etcd unreachable")
	}

	// 反序列化到结构体
	if err := v.Unmarshal(&C); err != nil {
		return err
	}

	go func() {
		for {
			time.Sleep(5 * time.Second)
			if err := v.WatchRemoteConfig(); err == nil {
				_ = v.Unmarshal(&C)
				fmt.Println(">>> etcd config hot-reloaded:", C.App.Name, C.App.Port)
			}
		}
	}()
	return nil
}

func main() {
	if err := Load(); err != nil {
		log.Fatal("load:", err)
	}
	fmt.Printf("start %s on :%d\n", C.App.Name, C.App.Port)

	for {
		time.Sleep(time.Second * 5)
		fmt.Printf("start %s on :%d\n", C.App.Name, C.App.Port)
	}

}

package config

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
)

type Config struct {
	Port     int    `json:"port"`
	LogLevel string `json:"log_level"`
}

func LoadConfig(filename string) (*Config, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, fmt.Errorf("打开配置文件失败：%v", err)
	}
	defer file.Close()

	content, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("读取配置文件失败：%v", err)
	}
	var config Config
	err = json.Unmarshal(content, &config)
	if err != nil {
		return nil, fmt.Errorf("解析配置文件失败：%v", err)
	}
	return &config, nil
}

func SaveConfig(filename string, config *Config) error {
	file, err := os.Create(filename)
	if err != nil {
		return fmt.Errorf("创建配置文件失败：%v", err)
	}
	defer file.Close()

	content, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("序列化配置文件失败：%v", err)
	}

	_, err = file.Write(content)
	if err != nil {
		return fmt.Errorf("写入配置文件失败：%v", err)
	}
	return nil
}

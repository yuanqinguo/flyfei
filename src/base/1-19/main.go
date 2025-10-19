package main

import (
	"fmt"
	"reflect"
	"strconv"
)

// 通用配置管理
type Config struct {
	AppName string `config:"app_name" default:"my_app"`
	Port    int    `config:"port" default:"8080"`
	Debug   bool   `config:"debug" default:"true"`
}

func (c *Config) UpdatePort(newPort int) (int, int) {
	old := c.Port
	c.Port = newPort
	return old, c.Port
}

func (c *Config) GetAppInfo() string {
	return fmt.Sprintf("AppName: %s, Port: %d, Debug: %t", c.AppName, c.Port, c.Debug)
}

type ConfigManager struct {
	config interface{}
}

func (cm *ConfigManager) CallMethod(methodName string, args ...interface{}) []interface{} {
	v := reflect.ValueOf(cm.config)
	if v.Kind() != reflect.Ptr {
		v = v.Addr()
	}
	method := v.MethodByName(methodName)
	if !method.IsValid() {
		return []interface{}{fmt.Errorf("方法 %s 不存在", methodName)}
	}
	in := make([]reflect.Value, len(args))
	for i, arg := range args {
		in[i] = reflect.ValueOf(arg)
	}

	out := method.Call(in)
	result := make([]interface{}, len(out))
	for i, out := range out {
		result[i] = out.Interface()
	}

	return result
}

func (cm *ConfigManager) LoadFromMap(data map[string]string) error {
	v := reflect.ValueOf(cm.config).Elem()
	t := v.Type()

	for i := 0; i < t.NumField(); i++ {
		field := v.Field(i)
		fieldType := t.Field(i)

		configKey := fieldType.Tag.Get("config")
		defaultValue := fieldType.Tag.Get("default")
		value := data[configKey]
		if value == "" {
			value = defaultValue
		}

		switch field.Kind() {
		case reflect.String:
			field.SetString(value)
		case reflect.Int:
			intValue, err := strconv.Atoi(value)
			if err != nil {
				return err
			}
			field.SetInt(int64(intValue))
		case reflect.Bool:
			boolValue, err := strconv.ParseBool(value)
			if err != nil {
				return err
			}
			field.SetBool(boolValue)
		}

	}
	return nil
}

type Person struct {
	Name string
	Age  int
}

func createInstance(t reflect.Type) interface{} {
	return reflect.New(t).Interface()
}

func main() {
	config := &Config{}
	configManager := &ConfigManager{config: config}
	configData := map[string]string{
		"app_name": "TestMyApp",
		"port":     "8088",
		"debug":    "false",
	}
	err := configManager.LoadFromMap(configData)
	if err != nil {
		panic(err)
	}
	fmt.Printf("app_name:%s, port: %d\n", config.AppName, config.Port)

	fmt.Println("-----------------------------------")

	results := configManager.CallMethod("UpdatePort", 9090)
	for _, result := range results {
		fmt.Println(result)
	}

	results = configManager.CallMethod("GetAppInfo")
	for _, result := range results {
		fmt.Println("UpdatePort after:", result)
	}

	fmt.Println("-----------------------------------")
	personType := reflect.TypeOf(Person{})
	inst := createInstance(personType)
	if person, ok := inst.(*Person); ok {
		person.Name = "Tom"
		person.Age = 18
		fmt.Println("Person:", person)
	}
}

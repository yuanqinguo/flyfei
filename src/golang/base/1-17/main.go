package main

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"unicode/utf8"
)

func validateEmail(email string) bool {
	pattern := `^^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	match, _ := regexp.MatchString(pattern, email)
	return match
}

func validatePhoneNumber(phoneNumber string) bool {
	pattern := `^1[2-9]\d{9}$`
	match, _ := regexp.MatchString(pattern, phoneNumber)
	return match
}

// input: john doe:25:john@example.com
func processUserInput(input string) map[string]interface{} {
	result := make(map[string]interface{})

	cleaned := strings.TrimSpace(input)
	cleaned = strings.ToLower(cleaned)

	fields := strings.Split(cleaned, ":")
	if len(fields) < 2 {
		result["error"] = "Invalid input format"
		return result
	}
	result["name"] = fields[0]
	age, err := strconv.Atoi(strings.TrimSpace(fields[1]))
	if err != nil {
		result["age"] = "Invalid age"
	} else {
		result["age"] = age
	}

	email := strings.TrimSpace(fields[2])
	if !validateEmail(email) {
		result["email"] = "Invalid email"
	} else {
		result["email"] = email
	}

	result["origin_length"] = len(input)
	result["cleaned_length"] = len(cleaned)
	result["rune_count"] = utf8.RuneCountInString(input)
	return result
}

func main() {
	userInputs := []string{
		"John Doe:25:john@example.com",
		"Jane Smith:30:bademail",
		"Mike Brown:40:mike@example.com",
		"李四:28:lisi@example.com",
	}
	for _, input := range userInputs {
		result := processUserInput(input)
		for key, value := range result {
			if key == "error" {
				fmt.Println("Invalid Input:", value)
			} else {
				fmt.Printf("%s : %v\n", key, value)
			}
		}
		fmt.Println()
	}
	phones := []string{"13812345678", "12345678900", "15887654321"}
	for _, phone := range phones {
		if validatePhoneNumber(phone) {
			fmt.Println("Valid phone number:", phone)
		} else {
			fmt.Println("Invalid phone number:", phone)
		}
	}

	// 字符串构造器
	var builder strings.Builder
	builder.WriteString("Hello, ")
	products := []string{"中国", "美国"}
	for _, v := range products {
		builder.WriteString(v)
		builder.WriteString("\n")
	}
	fmt.Println(builder.String())

	// 字符串替换和重复
	template := "重要通知: {message} | 重复显示: {repeat}"
	replaced := strings.Replace(template, "{message}", "系统维护通知", 1)
	repeated := strings.Repeat("注意!", 3)
	final := strings.Replace(replaced, "{repeat}", repeated, 1)
	fmt.Println(final)

	// 字符串前缀和后缀
	var (
		str  string
		str2 string
	)
	str = "This is a test string."
	str2 = "This is a test string."
	if str == str2 {
		fmt.Println("字符串相等")
	}

	url1 := "https://test.com/api/v1/users"
	url2 := "https://test.com/api/v1/products"

	if strings.HasPrefix(url1, "https://") && strings.HasSuffix(url1, "users") {
		fmt.Println("有效的URL")
	} else {
		fmt.Println("无效的URL")
	}

	if strings.HasPrefix(url2, "https://") && strings.HasSuffix(url2, ".com") {
		fmt.Println("有效的URL")
	}

}

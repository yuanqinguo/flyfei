package common

import (
	"fmt"
	"log"
	"os"
	"time"
)

func NewLogger(prefix string) *log.Logger {
	return log.New(os.Stdout, prefix+" ", log.Ldate|log.Ltime)
}

func LogOperation(operation string) {
	fmt.Printf("[%s]操作： %s\n", time.Now().Format(time.DateTime), operation)
	log.Println(formatLogMessage("INFO", operation))
}

func formatLogMessage(level, message string) string {
	return fmt.Sprintf("[%s] %s: %s", time.Now().Format(time.DateTime), level, message)
}

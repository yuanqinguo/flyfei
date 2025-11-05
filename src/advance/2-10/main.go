package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

type Student struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Age   int    `json:"age"`
	Grade int    `json:"grade"`
}

var students = []Student{
	{
		ID:    1,
		Name:  "张三",
		Age:   18,
		Grade: 1,
	},
	{
		ID:    2,
		Name:  "李四",
		Age:   19,
		Grade: 2,
	},
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s 处理时间: %v",
			r.Method, r.URL.Path, r.RemoteAddr, time.Since(start))
	})
}

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer 123456" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()
	mux.Handle("/students/info", loggingMiddleware(authMiddleware(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		time.Sleep(time.Second * 2)
		str, _ := json.Marshal(students[0])
		writer.Header().Set("Content-Type", "application/json")
		writer.Write(str)
		writer.WriteHeader(http.StatusOK)
	}))))
	http.ListenAndServe(":8080", mux)
}

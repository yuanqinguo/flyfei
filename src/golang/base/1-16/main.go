package main

import (
	"1-16/other"
	"1-16/user"
	"flag"
	"net/http"
)

func main() {

	var configFile string
	var port int
	flag.StringVar(&configFile, "config", "config.json", "path to config file")
	flag.IntVar(&port, "port", 8080, "port to listen")
	flag.Parse()

	//config, err := config.LoadConfig(configFile)
	//if err != nil {
	//	panic(err)
	//}

	hander := user.NewUserHandler(user.NewUserStore())

	http.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			hander.CreateUser(w, r)
		case http.MethodGet:
			hander.GetUsers(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc("/users/", hander.GetUser)
	//addr := fmt.Sprintf(":%d", config.Port)
	//log.Println("启动服务，端口：", config.Port)
	//log.Fatal(http.ListenAndServe(addr, nil))

	//other.DemoTemplate()
	//other.DemoCompression()
	other.DemoBuffIO()
}

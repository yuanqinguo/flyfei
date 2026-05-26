package http

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	url2 "net/url"
	"reflect"
	"strings"
	"time"

	"go.uber.org/zap"
)

var defaultClient = &http.Client{
	Transport: &http.Transport{
		TLSClientConfig:    &tls.Config{InsecureSkipVerify: true},
		DisableCompression: true,
	},
	Timeout: time.Second * 5,
}

func UpdateDefaultClientTimeout(timeout time.Duration) {
	defaultClient.Timeout = timeout
}

var (
	autoRetry = false
	retryNum  = 1
)

func UpdateRetryInfo(isRetry bool, num int) {
	autoRetry = isRetry
	retryNum = num
	fmt.Println("set http auto retry, try num is 3")
}

func attachParam(reqUrl string, data map[string]interface{}) (string, error) {
	u, err := url2.Parse(reqUrl)
	if err != nil {
		return "", err
	}
	q := u.Query()
	for k, v := range data {
		val, isNil := getParam(v)
		if isNil {
			continue
		}
		q.Add(k, val)
	}
	u.RawQuery = q.Encode()
	return u.String(), nil
}

func Get(ctx context.Context, reqUrl string, header map[string]string, data map[string]interface{}, out interface{}) error {
	if len(data) > 0 {
		uStr, err := attachParam(reqUrl, data)
		if err != nil {
			return err
		}
		reqUrl = uStr
	}

	req, err := http.NewRequest("GET", reqUrl, nil)
	if err != nil {
		return err
	}

	req = req.WithContext(ctx)

	if len(header) != 0 {
		for key, value := range header {
			req.Header.Add(key, value)
		}
	}

	return do(ctx, req, out)
}

func getParam(v interface{}) (data string, isNil bool) {
	switch v.(type) {
	case nil:
		return "", true
	case string:
		return v.(string), false
	case int:
		return fmt.Sprintf("%d", v.(int)), false
	case int8:
		return fmt.Sprintf("%d", v.(int8)), false
	case int16:
		return fmt.Sprintf("%d", v.(int16)), false
	case int32:
		return fmt.Sprintf("%d", v.(int32)), false
	case int64:
		return fmt.Sprintf("%d", v.(int64)), false
	case uint:
		return fmt.Sprintf("%d", v.(uint)), false
	case uint8:
		return fmt.Sprintf("%d", v.(uint8)), false
	case uint16:
		return fmt.Sprintf("%d", v.(uint16)), false
	case uint32:
		return fmt.Sprintf("%d", v.(uint32)), false
	case uint64:
		return fmt.Sprintf("%d", v.(uint64)), false
	case float32, float64, bool:
		return fmt.Sprintf("%v", v), false
	default:
		value := reflect.ValueOf(v)
		if value.Kind() == reflect.Ptr {
			if value.IsNil() {
				return "", true
			}
			return getParam(value.Elem().Interface())
		}
		if value.Kind() == reflect.Struct {
			if strFn := value.MethodByName("String"); strFn.IsValid() {
				if rst := strFn.Call(nil); len(rst) > 0 && rst[0].Kind() == reflect.String {
					return rst[0].String(), false
				}
			}
			if strFn := value.MethodByName("MarshalText"); strFn.IsValid() {
				if rst := strFn.Call(nil); len(rst) > 0 {
					if str, ok := rst[0].Interface().([]byte); !ok {
						panic("MarshalText should return []byte")
					} else {
						return string(str), false
					}
				}
			}
			panic("not support struct in url param")
		}
		if value.IsNil() {
			return "", true
		}

		return fmt.Sprintf("%v", v), false
	}
}

func PostForm(ctx context.Context, url string, header map[string]string, body map[string]string, out interface{}) error {
	var (
		req             *http.Request
		err             error
		isFormUrlEncode = false
		urlVals         = url2.Values{}
		payload         = bytes.Buffer{}
	)
	if body == nil {
		return errors.New("body is empty")
	}

	if len(header) > 0 {
		if v, ok := header["Content-Status"]; ok {
			if v == "application/x-www-form-urlencoded" {
				isFormUrlEncode = true
			}
		}
	}

	if isFormUrlEncode {
		for k, v := range body {
			urlVals.Set(k, v)
		}
		req, err = http.NewRequest("POST", url, strings.NewReader(urlVals.Encode()))
		if err != nil {
			return err
		}
	} else {
		writer := multipart.NewWriter(&payload)
		for k, v := range body {
			_ = writer.WriteField(k, v)
		}
		err = writer.Close()
		if err != nil {
			return err
		}
		req, err = http.NewRequest("POST", url, &payload)
		if err != nil {
			return err
		}
		req.Header.Set("Content-Type", writer.FormDataContentType())
	}

	req = req.WithContext(ctx)
	if len(header) != 0 {
		for key, value := range header {
			req.Header.Add(key, value)
		}
	}

	return do(ctx, req, out)
}

func Post(ctx context.Context, url string, header map[string]string, body interface{}, out interface{}) error {
	var (
		req *http.Request
		err error
	)
	if body != nil {
		bs, err := json.Marshal(body)
		if err != nil {
			return err
		}
		req, err = http.NewRequest("POST", url, bytes.NewReader(bs))
	} else {
		req, err = http.NewRequest("POST", url, nil)
	}

	if err != nil {
		return err
	}
	req = req.WithContext(ctx)

	if len(header) != 0 {
		for key, value := range header {
			req.Header.Add(key, value)
		}
	}

	return do(ctx, req, out)
}

func Put(ctx context.Context, url string, header map[string]string, body interface{}, out interface{}) error {
	var (
		req *http.Request
		err error
	)
	if body != nil {
		bs, err := json.Marshal(body)
		if err != nil {
			return err
		}
		req, err = http.NewRequest("PUT", url, bytes.NewReader(bs))
	} else {
		req, err = http.NewRequest("PUT", url, nil)
	}

	if err != nil {
		return err
	}
	req = req.WithContext(ctx)

	if len(header) != 0 {
		for key, value := range header {
			req.Header.Add(key, value)
		}
	}

	return do(ctx, req, out)
}

func do(ctx context.Context, req *http.Request, out interface{}) error {
	if !autoRetry {
		return normalDo(ctx, req, out)
	}
	return retryDo(ctx, req, out)
}

func retryDo(ctx context.Context, req *http.Request, out interface{}) (err error) {
	for i := 0; i < retryNum; i++ {
		if err = baseDo(ctx, req, out); err == nil {
			return nil
		}
		if strings.Contains(err.Error(), "EOF") {
			fmt.Println("Error: got EOF and retry")
			req.Close = true
		}
	}
	return
}

func baseDo(ctx context.Context, req *http.Request, out interface{}) (err error) {
	begin := time.Now()
	body, _ := getBody(req)
	ip := ctx.Value("ip")
	if ipStr, ok := ip.(string); ok && ipStr != "" {
		req.Header.Add("X-Customer-Ip", ipStr)
	}
	defer func() {
		fmt.Println("http",
			zap.Duration("elapsed", time.Since(begin)),
			zap.String("host", req.Host),
			zap.String("method", req.Method),
			zap.String("url", req.URL.EscapedPath()),
			zap.String("url param", req.URL.RawQuery),
			zap.ByteString("body", body),
			printAny("out", out))
	}()
	var res *http.Response
	res, err = defaultClient.Do(req)
	if err != nil {
		return err
	}

	defer res.Body.Close()

	if res.StatusCode >= 400 {
		if out != nil { // 有些服务会返回非200的状态码
			decoder := json.NewDecoder(res.Body)
			if err = decoder.Decode(out); err == nil {
				return nil
			}
		}
		var body []byte
		body, err = ioutil.ReadAll(res.Body)
		if err != nil {
			return err
		}
		return fmt.Errorf("status: %s, body: %s", res.Status, string(body))
	}
	if out != nil {
		decoder := json.NewDecoder(res.Body)
		return decoder.Decode(out)
	}
	return nil
}

func normalDo(ctx context.Context, req *http.Request, out interface{}) error {
	return baseDo(ctx, req, out)
}

func getBody(req *http.Request) ([]byte, error) {
	if req.Body == nil {
		return []byte{}, nil
	}
	data, err := ioutil.ReadAll(req.Body)
	if err != nil {
		return nil, err
	}
	req.Body = ioutil.NopCloser(bytes.NewBuffer(data))
	return data, nil
}

func printAny(key string, data interface{}) zap.Field {
	if data == nil {
		return zap.String(key, "\"null\"")
	}
	value := reflect.ValueOf(data)
	if value.Kind() == reflect.Ptr {
		value = value.Elem()
	}
	if value.Kind() == reflect.Struct {
		bs, _ := json.Marshal(value.Interface())
		return zap.ByteString(key, bs)
	}
	return zap.Any(key, data)
}

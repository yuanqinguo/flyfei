package router

import (
	"bytes"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"io"
	"mall/consts"
	"mall/utils/logger"
	"time"
)

func GetRequestBody(ctx *gin.Context) string {
	data, _ := io.ReadAll(ctx.Request.Body)
	return string(data)
}

func GetResponseBody(ctx *gin.Context) string {
	resp := ctx.Request.Response
	if resp == nil || resp.Body == nil {
		return ""
	}
	data, _ := io.ReadAll(ctx.Request.Response.Body)
	return string(data)
}

type responseWriterWrapper struct {
	gin.ResponseWriter
	Writer io.Writer
}

func (w *responseWriterWrapper) Write(b []byte) (int, error) {
	return w.Writer.Write(b)
}

func AccessLogMiddleware(filter func(*gin.Context) bool) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if filter != nil && !filter(ctx) {
			ctx.Next()
			return
		}
		body := GetRequestBody(ctx)
		ctx.Request.Body = io.NopCloser(bytes.NewBuffer([]byte(body)))
		begin := time.Now()
		fields := []zap.Field{
			zap.String("ip", ctx.RemoteIP()),
			zap.String("method", ctx.Request.Method),
			zap.String("path", ctx.Request.URL.Path),
			zap.String("params", ctx.Request.URL.RawQuery),
			zap.Any("body", body),
			zap.String("token", ctx.GetHeader(consts.UserTokenKey)),
		}
		var responseBody bytes.Buffer
		multiWriter := io.MultiWriter(ctx.Writer, &responseBody)
		ctx.Writer = &responseWriterWrapper{
			ResponseWriter: ctx.Writer,
			Writer:         multiWriter,
		}

		ctx.Next()
		respBody := responseBody.String()
		if len(respBody) > 1024 {
			respBody = respBody[:1024]
		}
		fields = append(fields, zap.Int64("dur_ms", time.Since(begin).Milliseconds()))
		fields = append(fields, zap.Int("status", ctx.Writer.Status()))
		fields = append(fields, zap.String("resp", respBody))
		logger.Info("access_log", fields...)
	}
}

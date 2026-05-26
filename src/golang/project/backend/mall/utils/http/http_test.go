package http

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGet(t *testing.T) {
	type response struct {
		Value string `json:"value"`
		Count int    `json:"count"`
	}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			t.Fatalf("method = %s, want %s", r.Method, http.MethodGet)
		}
		if got := r.URL.Query().Get("page"); got != "2" {
			t.Fatalf("query page = %s, want %s", got, "2")
		}
		if got := r.Header.Get("Accept"); got != "application/json" {
			t.Fatalf("accept = %s, want %s", got, "application/json")
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(response{Value: "ok", Count: 2})
	}))
	defer server.Close()

	out := &response{}
	err := Get(context.Background(), server.URL, map[string]string{
		"Accept": "application/json",
	}, map[string]interface{}{
		"page": 2,
	}, out)
	if err != nil {
		t.Fatalf("Get() error = %v", err)
	}
	if out.Value != "ok" || out.Count != 2 {
		t.Fatalf("Get() got = %+v", out)
	}
}

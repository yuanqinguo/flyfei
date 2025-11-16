package tools

import (
	"github.com/google/uuid"
	"strings"
)

func UUIDHex() string {
	return strings.ReplaceAll(uuid.New().String(), "-", "")
}

package router

var AdminAuthWhiteList = map[string]bool{
	"/ping":                                true,
	"/metrics":                             true,
	"/admin/v1/user/verify/captcha/check":  true,
	"/admin/v1/user/verify/captcha":        true,
	"/admin/v1/user/verify/smscode":        true,
	"/admin/v1/user/mobile/verify_login":   true,
	"/admin/v1/user/mobile/password_login": true,
	"/admin/v1/user/password/reset":        true,
}

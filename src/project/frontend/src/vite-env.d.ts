/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_CDN_URL: string
  readonly VITE_DEV_URL: string
  readonly VITE_NEVER_SIGN_OUT: boolean | string
  readonly VITE_LARK_CLIENT_ID: string
  readonly VITE_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export interface RequestOptions {
  timeout?: number
  useDefaultErrorProcess?: boolean
  showErrorMessage?: boolean
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
  headers?: Record<string, string>
  data?: any
  onUploadProgress?(event: any): any
  transform?: (response: any) => Promise<any>
}

export default interface HttpClient {
  doRequest<T>(request: RequestOptions): Promise<T>
}

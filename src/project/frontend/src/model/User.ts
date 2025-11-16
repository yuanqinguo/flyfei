export default interface User {
  create_at: number
  create_by_name: string
  id: number
  mobile: string
  name: string
  sex: number
  lark_open_id: string
  lark_nickname: string
  status: number
  update_at: number
  roles: { id: number; name: string }[]
  update_by_name: string
}

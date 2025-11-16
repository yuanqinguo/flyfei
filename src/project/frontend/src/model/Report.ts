import { ObjectType } from '@/utils/constants/Common'

export interface SubjectDataCount {
  subject_id: number
  data_count_list: {
    obj_name: string
    count: number
    obj_type: ObjectType
  }[]
}

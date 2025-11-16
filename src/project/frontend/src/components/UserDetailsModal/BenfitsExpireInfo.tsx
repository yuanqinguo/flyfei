import CustomerService from '@/service/CustomerService'
import { FastColumnProps, FastTable } from '@/components/FastTable'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

const BenfitsExpireInfo = ({ user_id, subject_id }: { user_id?: number; subject_id?: number }) => {
  const [goodsBenefits, setGoodsBenefits] = useState([])

  const columns: FastColumnProps<any>[] = [
    {
      title: '商品名称',
      dataIndex: 'goods_name'
    },
    {
      title: '看课到期时间',
      dataIndex: 'course_viewable_expire_at',
      valueType: 'datetime'
    }
  ]

  useEffect(() => {
    if (user_id && subject_id) {
      CustomerService.courseGoods({ user_id, subject_id }).then(res => {
        setGoodsBenefits(res?.goods_benefits || [])
      })
    }
  }, [user_id, subject_id])

  return (
    <div>
      <FastTable
        bordered
        rowKey={record => record.goods_id}
        pagination={false}
        options={false}
        isCard={false}
        columns={columns}
        dataSource={goodsBenefits}
      />
    </div>
  )
}

export default BenfitsExpireInfo

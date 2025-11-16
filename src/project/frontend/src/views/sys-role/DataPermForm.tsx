import { useEffect, useState } from 'react'
import { ModalForm, ModalFormProps } from '@/components/ModalForm'
import { Badge, Button, Checkbox, Flex, Form, Input, Select, Tooltip } from 'antd'
import { AuditRequestParam } from '@/service/RoleService'
import Role from '@/model/Role'
import Stage from '@/model/Stage'
import Subject from '@/model/Subject'
import { arrayToObject } from '@/utils'
import { CloseCircleOutlined } from '@ant-design/icons'
import { useAppSelector } from '@/store'

const getSubjectNames = ({
  stageId,
  subjects,
  stageList,
  subjectList
}: {
  stageId?: number
  subjects?: number[]
  stageList: Stage[]
  subjectList: Subject[]
}) => {
  const subjectMap = arrayToObject(
    subjectList,
    item => item.id,
    item => item.name
  )
  const stageName = stageList?.find(item => item.id === stageId)?.name
  const subjectNames = subjects?.map(item => {
    return {
      name: `${stageName || ''}${subjectMap[item]}`,
      stageId,
      subjectId: item
    }
  })
  return subjectNames
}

const SubjectSelect: React.FC<{
  value?: AuditRequestParam['audits']
  onChange?: (value: AuditRequestParam['audits']) => void
}> = ({ value, onChange }) => {
  const [stageId, setStageId] = useState<number>()
  const [subjects, setSubjects] = useState<number[]>()
  const { stageList, subjectList } = useAppSelector(state => state.baseData)
  const [subjectOptions, setSubjectOptions] = useState<any[]>([])

  useEffect(() => {
    if (stageList.length) {
      setStageId(stageList?.[0].id)
    }
  }, [stageList])

  useEffect(() => {
    setSubjectOptions(subjectList?.filter(item => item.stage_id === stageId) || [])
    setSubjects(value?.find(item => item.stage_id === stageId)?.subjects || [])
  }, [stageId, value, subjectList])

  const onSubjectChange = (stageId?: number, subjectIds?: number[]) => {
    const index = value?.findIndex(item => item.stage_id === stageId)
    const newValue = value ? [...value] : []
    if (typeof index === 'number' && index > -1) {
      newValue[index].subjects = subjectIds
    } else {
      newValue.push({
        stage_id: stageId,
        subjects: subjectIds
      })
    }
    setSubjects(subjectIds)
    onChange?.(newValue)
  }

  return (
    <>
      <Select
        value={stageId}
        options={stageList?.map(item => ({ value: item.id, label: item.name }))}
        onChange={setStageId}
      ></Select>
      <Checkbox.Group style={{ marginTop: '16px' }} value={subjects} onChange={ids => onSubjectChange(stageId, ids)}>
        {subjectOptions?.map(item => (
          <Checkbox value={item.id} key={item.id}>
            {item.name}
          </Checkbox>
        ))}
      </Checkbox.Group>
      <Flex gap="small" wrap style={{ marginTop: '16px' }}>
        {value?.map(item => {
          const names = getSubjectNames({
            subjectList,
            stageList,
            stageId: item.stage_id,
            subjects: item.subjects
          })
          return names?.map((name, index) => (
            <Button
              size="small"
              key={name.subjectId}
              type="dashed"
              iconPosition="end"
              icon={
                <Tooltip title="删除">
                  <CloseCircleOutlined
                    style={{ color: 'red' }}
                    onClick={e => {
                      e.stopPropagation()
                      item.subjects?.splice(index, 1)
                      onSubjectChange(stageId, item.subjects)
                    }}
                  />
                </Tooltip>
              }
            >
              {name.name}
            </Button>
          ))
        })}
      </Flex>
    </>
  )
}

export default ({ ...props }: ModalFormProps<Role>) => {
  return (
    <ModalForm {...props}>
      <Form.Item label="角色名称" name="name">
        <Input disabled />
      </Form.Item>
      <Form.Item label="审核学科" name="data_perms">
        <SubjectSelect />
      </Form.Item>
    </ModalForm>
  )
}

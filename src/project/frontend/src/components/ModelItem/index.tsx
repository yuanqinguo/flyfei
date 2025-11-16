import { ModelBank } from '@/model/ModelBank'
import QuestionItem, { Action, Field, QuestionItemProps } from '../QuestionItem'
import QuesRender from '../QuesRender'
import { Button, Flex, Tag } from 'antd'

interface ModelItemProps extends QuestionItemProps<ModelBank> {
  getTopFields?: (row: ModelBank) => Field[]
  getFooterFields?: (row: ModelBank) => Field[]
  getTopActions?: (row: ModelBank) => Action[]
  onKeywordClick?: (keyword: any) => void
  onKnowledgeClick?: (knowledge: any) => void
}

const ModelItem = ({
  rowData: row,
  getTopFields,
  getFooterFields,
  getTopActions,
  onKeywordClick,
  onKnowledgeClick,
  ...restProps
}: ModelItemProps) => {
  const Content = () => {
    return (
      <Flex className={`card-list-item-content-center`} vertical gap={'middle'}>
        <QuesRender value={row.content} />
        {row?.key_words?.length ? (
          <Flex>
            <span>关键词：</span>
            <Flex gap={'small'}>
              {row?.key_words.map(keyword => {
                return (
                  <Tag style={{ cursor: 'pointer' }} onClick={() => onKeywordClick?.(keyword)} key={keyword.id}>
                    {keyword.name}
                  </Tag>
                )
              })}
            </Flex>
          </Flex>
        ) : null}
        {row?.knowledges?.length ? (
          <Flex>
            <span>关联知识点：</span>
            <Flex gap={'small'}>
              {row?.knowledges.map(knowledge => {
                return (
                  <Tag style={{ cursor: 'pointer' }} onClick={() => onKnowledgeClick?.(knowledge)} key={knowledge.id}>
                    {knowledge.name}
                  </Tag>
                )
              })}
            </Flex>
          </Flex>
        ) : null}
      </Flex>
    )
  }

  return (
    <QuestionItem
      key={row.id}
      topFields={getTopFields?.(row)}
      footerFields={getFooterFields?.(row)}
      topActions={getTopActions?.(row)}
      rowData={row}
      contentRender={Content}
      {...restProps}
    />
  )
}

export default ModelItem

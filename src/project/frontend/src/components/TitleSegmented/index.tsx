import { Segmented, SegmentedProps, Space } from 'antd'

interface TitleSegmentedProps<T> extends SegmentedProps<T> {
  title: string
  containerStyle?: React.CSSProperties
}

const TitleSegmented = <T extends number | string>({
  title,
  options,
  onChange,
  containerStyle,
  ...resetProps
}: TitleSegmentedProps<T>) => {
  if (!options.length) return
  return (
    <Space style={containerStyle}>
      <span>{title}：</span>
      <Segmented options={options} onChange={onChange} {...resetProps} />
    </Space>
  )
}

export default TitleSegmented

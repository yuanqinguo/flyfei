import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface EChartsProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  option: EChartsOption
  onClick?: (e: any) => void
}

const ECharts: React.FC<EChartsProps> = ({ option, onClick, ...props }) => {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)

    chart.setOption(option)

    const handleResize = () => {
      chart.resize()
    }
    window.addEventListener('resize', handleResize)
    chart.on('click', e => onClick?.(e))

    return () => {
      chart.off('click')
      chart.dispose()
      window.removeEventListener('resize', handleResize)
    }
  }, [option])

  return <div ref={chartRef} {...props} />
}

export default ECharts

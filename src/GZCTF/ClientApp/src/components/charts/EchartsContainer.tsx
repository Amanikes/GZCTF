import { useMantineColorScheme } from '@mantine/core'
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts'
import { FC, useEffect, useMemo, useRef } from 'react'
import { ChartPalette } from '@Components/charts/chartTheme'

export interface EchartsContainerProps extends React.ComponentPropsWithoutRef<'div'> {
  option: EChartsOption
  opts?: echarts.EChartsInitOpts
  style?: React.CSSProperties
}

export const EchartsContainer: FC<EchartsContainerProps> = (props) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const { option, opts, style, ...rest } = props

  const { colorScheme } = useMantineColorScheme()

  // callers can still override the palette by passing their own `color`
  const themedOption = useMemo<EChartsOption>(() => ({ color: ChartPalette, ...option }), [option])

  useEffect(() => {
    if (chartRef.current && !chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, colorScheme === 'dark' ? 'dark' : 'default', opts)
      chartInstance.current.setOption(themedOption)
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose()
        chartInstance.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.dispose()
    }
    chartInstance.current = echarts.init(chartRef.current, colorScheme === 'dark' ? 'dark' : 'default', opts)
    chartInstance.current.setOption(themedOption)
  }, [colorScheme])

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(themedOption, true)
    }
  }, [themedOption])

  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <div ref={chartRef} style={style} {...rest} />
}

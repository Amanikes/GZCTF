import { Box, Center, useMantineColorScheme, useMantineTheme } from '@mantine/core'
import dayjs from 'dayjs'
import type { EChartsOption, SeriesOption } from 'echarts'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { Empty } from '@Components/Empty'
import { EchartsContainer } from '@Components/charts/EchartsContainer'
import { normalizeLanguage, useLanguage } from '@Utils/I18n'
import { getGameStatus, useGame, useGameScoreboard } from '@Hooks/useGame'
import { TimeLine, TopTimeLine } from '@Api'

const CHART_HEIGHT = 460
const EMPTY_HEIGHT = 200

interface TimeLineProps {
  divisionId: number | null
}

export const ScoreTimeLine: FC<TimeLineProps> = ({ divisionId }) => {
  const { id } = useParams()
  const numId = parseInt(id ?? '-1')
  const theme = useMantineTheme()

  const { scoreboard } = useGameScoreboard(numId)

  const { game } = useGame(numId)

  const { startTime, endTime, progress, finished } = getGameStatus(game)

  const totDuration = endTime.diff(startTime, 'd')
  const longGame = totDuration > 14

  const weekProgress = (7 / totDuration) * 100
  const weekStart = progress - weekProgress
  const weekEnd = progress

  const drawStart = longGame && !finished ? weekStart : 0
  const drawEnd = longGame && !finished ? weekEnd : 100

  const { colorScheme } = useMantineColorScheme()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const locale = normalizeLanguage(language)

  const divisionTimelineMap = useMemo(() => {
    const map = new Map<number, TopTimeLine[]>()

    if (!scoreboard?.timelines) return map

    scoreboard.timelines.forEach((item) => {
      const key = item.divisionId ?? 0
      map.set(key, item.teams ?? [])
    })

    return map
  }, [scoreboard])

  const selectedDivisionId = useMemo(() => (divisionId === null ? 0 : divisionId), [divisionId])

  const activeTeams = useMemo(() => {
    if (divisionTimelineMap.size === 0) return undefined

    const direct = divisionTimelineMap.get(selectedDivisionId)
    if (direct) return direct

    const overall = divisionTimelineMap.get(0)
    if (overall) return overall

    const iterator = divisionTimelineMap.values().next()
    return iterator.done ? undefined : iterator.value
  }, [divisionTimelineMap, selectedDivisionId])

  const chartData: SeriesOption[] = useMemo(() => {
    if (!activeTeams || !game) return []

    const timeLine = activeTeams
    const current = dayjs()
    const last = endTime.diff(current, 's') < 0 ? endTime : current

    const nowMarkLine =
      dayjs(game.end).diff(dayjs(), 's') < 0
        ? undefined
        : {
            symbol: 'none',
            // https://echarts.apache.org/en/option.html#series-line.markLine.data
            data: [
              {
                // xAxis?: string | number, but we need to use a Date object
                xAxis: last.toDate() as unknown as number,
                lineStyle: {
                  color: colorScheme === 'dark' ? theme.colors.gray[3] : theme.colors.gray[6],
                  width: 2,
                },
                label: {
                  textBorderWidth: 0,
                  fontWeight: 500,
                  formatter: (time: any) => dayjs(time.value).format('YYYY-MM-DD HH:mm'),
                },
              },
            ],
          }

    return (
      timeLine?.map(
        (team, index) =>
          ({
            type: 'line',
            step: 'end',
            name: team.name,
            // only the first series carries the marker, so the legend stays clean
            markLine: index === 0 ? nowMarkLine : undefined,
            data: [
              [dayjs(game.start).toDate(), 0],
              ...(team.items?.map((timeline: TimeLine) => [timeline.time, timeline.score]) ?? []),
              [last.toDate(), (team.items && team.items[team.items.length - 1]?.score) ?? 0],
            ],
          }) satisfies SeriesOption
      ) ?? []
    )
  }, [activeTeams, game, endTime, colorScheme, theme])

  const staticOption: EChartsOption = useMemo(() => {
    const isDark = colorScheme === 'dark'
    const labelColor = isDark ? theme.colors.light[1] : theme.colors.dark[5]
    const lineColor = isDark ? theme.colors.gray[3] : theme.colors.gray[6]
    const backgroundColor = isDark ? theme.colors.gray[6] : theme.colors.light[1]

    return {
      animation: true,
      backgroundColor: 'transparent',
      toolbox: {
        show: true,
        feature: {
          dataZoom: {},
          restore: {},
          saveAsImage: {},
        },
      },
      xAxis: {
        type: 'time',
        min: dayjs(game?.start).toDate(),
        max: dayjs(game?.end).toDate(),
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        name: t('game.label.score'),
        nameTextStyle: {
          color: labelColor,
          fontWeight: 'normal',
        },
        boundaryGap: [0, '100%'],
        axisLabel: {
          formatter: t('game.label.score_formatter'),
          color: labelColor,
        },
        // keep at least a 1 000 pt range so a single low score does not collapse the axis
        max: (value: any) => Math.max(1000, (Math.floor((value.max ?? 0) / 1000) + 1) * 1000),
        splitLine: {
          show: true,
          lineStyle: {
            color: [lineColor],
            type: 'dashed',
          },
        },
      },
      tooltip: {
        trigger: 'axis',
        borderWidth: 0,
        textStyle: {
          fontSize: 12,
          color: labelColor,
        },
        backgroundColor: backgroundColor,
      },
      legend: {
        orient: 'horizontal',
        bottom: longGame ? 82 : 8,
        textStyle: {
          fontSize: 12,
          color: labelColor,
        },
      },
      grid: {
        top: 50,
        left: 70,
        // the y-axis zoom slider used to sit in this margin and read as a stray scrollbar
        right: 24,
        bottom: longGame ? 124 : 60,
      },
      dataZoom: [
        {
          type: 'inside',
          start: drawStart,
          end: drawEnd,
          xAxisIndex: 0,
          filterMode: 'none',
        },
        // a slider is only useful for long games, otherwise it renders as dead chrome
        ...(longGame
          ? [
              {
                type: 'slider' as const,
                start: drawStart,
                end: drawEnd,
                xAxisIndex: 0,
                showDetail: false,
                bottom: 46,
                height: 18,
              },
            ]
          : []),
        {
          type: 'inside',
          start: 0,
          end: 100,
          yAxisIndex: 0,
          filterMode: 'none',
        },
      ],
    } satisfies EChartsOption
  }, [t, game?.start, game?.end, colorScheme, theme, drawStart, drawEnd, longGame])

  if (!chartData.length)
    return (
      <Box h={EMPTY_HEIGHT}>
        <Center h="100%">
          <Empty bordered iconSize={3} />
        </Center>
      </Box>
    )

  return (
    <EchartsContainer
      option={{
        ...staticOption,
        series: chartData,
      }}
      opts={{
        renderer: 'svg',
        locale,
      }}
      style={{
        width: '100%',
        height: `${CHART_HEIGHT}px`,
        display: 'flex',
      }}
    />
  )
}

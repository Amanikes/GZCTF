import { Badge, Group, Pagination, SimpleGrid, Stack, Text, UnstyledButton, useMantineTheme } from '@mantine/core'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Empty } from '@Components/Empty'
import { GameCard, GameColorMap } from '@Components/GameCard'
import { PageHeader } from '@Components/PageHeader'
import { WithNavBar } from '@Components/WithNavbar'
import { GanttTimeLine } from '@Components/charts/GanttTimeline'
import { RecentGameCarousel } from '@Components/mobile/RecentGameCarousel'
import { useIsMobile } from '@Utils/ThemeOverride'
import { getGameStatus, toLimitTag, useRecentGames } from '@Hooks/useGame'
import { usePageTitle } from '@Hooks/usePageTitle'
import api from '@Api'
import ganttClasses from '@Styles/GanttTimeline.module.css'

const ITEM_PER_PAGE = 12

const Games: FC = () => {
  const { t } = useTranslation()

  const { recentGames } = useRecentGames()
  const [activePage, setPage] = useState(1)

  const { data: games } = api.game.useGameGames(
    { count: ITEM_PER_PAGE, skip: (activePage - 1) * ITEM_PER_PAGE },
    {
      refreshInterval: 5 * 60 * 1000,
    }
  )

  usePageTitle(t('game.title.index'))

  const theme = useMantineTheme()
  const isMobile = useIsMobile(900)

  const recents =
    recentGames?.map((game) => {
      const { startTime, endTime, status } = getGameStatus(game)
      const color = GameColorMap.get(status) ?? 'gray'
      // shade 6 keeps every status readable on both schemes; shade 9 was
      // indistinguishable from the dark timeline background
      const colorHex = theme.colors[color][6]

      return {
        id: game.id,
        textTitle: game.title ?? '',
        color: colorHex,
        title: (
          <UnstyledButton w="100%" component={Link} to={`/games/${game.id}`}>
            <Group gap="sm" className={ganttClasses.gameBox}>
              <Text size="sm" className={ganttClasses.title}>
                {game.title}
              </Text>
              <Badge size="sm" color={color}>
                {toLimitTag(t, game.limit)}
              </Badge>
            </Group>
          </UnstyledButton>
        ),
        start: startTime,
        end: endTime,
      }
    }) ?? []

  const pageCount = Math.ceil((games?.total ?? 0) / ITEM_PER_PAGE)

  return (
    <WithNavBar minWidth={0} withFooter withHeader stickyHeader>
      <PageHeader title={t('game.title.index')} mb="sm" />
      {/* the 7-week timeline is unusable on a phone; reuse the home carousel there */}
      {isMobile ? (
        recentGames && recentGames.length > 0 && <RecentGameCarousel games={recentGames} />
      ) : (
        <GanttTimeLine items={recents} />
      )}
      <Stack pt={isMobile ? 0 : 'md'} mih="calc(100vh - 78px)" justify="space-between">
        {games && games.data.length === 0 ? (
          <Empty bordered iconSize={4} />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 1, md: 2, lg: 3, xl: 3, w18: 4, w24: 5 }} spacing="lg" verticalSpacing="lg">
            {games && games.data.map((g) => <GameCard key={g.id} game={g} />)}
          </SimpleGrid>
        )}
        <Pagination.Root total={pageCount} siblings={3} value={activePage} onChange={setPage} mb="xl">
          <Group gap={5} justify="flex-end">
            <Pagination.First />
            <Pagination.Previous />
            <Pagination.Items />
            <Pagination.Next />
            <Pagination.Last />
          </Group>
        </Pagination.Root>
      </Stack>
    </WithNavBar>
  )
}

export default Games

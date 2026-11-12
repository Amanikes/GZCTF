import { Group, Stack, Title, VisuallyHidden, useMantineTheme } from '@mantine/core'
import { useViewportSize } from '@mantine/hooks'
import { mdiFlagCheckered } from '@mdi/js'
import { Icon } from '@mdi/react'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Empty } from '@Components/Empty'
import { RecentGame } from '@Components/RecentGame'
import { WithNavBar } from '@Components/WithNavbar'
import { RecentGameCarousel } from '@Components/mobile/RecentGameCarousel'
import { useIsMobile } from '@Utils/ThemeOverride'
import { useRecentGames } from '@Hooks/useGame'
import { usePageTitle } from '@Hooks/usePageTitle'
import classes from '@Styles/Index.module.css'

const Home: FC = () => {
  const { t } = useTranslation()

  const { recentGames } = useRecentGames()

  const theme = useMantineTheme()
  const isMobile = useIsMobile(900)
  const { height } = useViewportSize()

  const showGames = isMobile ? recentGames : recentGames?.slice(0, Math.ceil((height - 300) / 240))

  usePageTitle()

  return (
    <WithNavBar minWidth={0} withFooter withHeader stickyHeader>
      <VisuallyHidden>
        <h1>{t('common.tab.home')}</h1>
      </VisuallyHidden>
      {isMobile ? (
        recentGames && recentGames.length > 0 && <RecentGameCarousel games={recentGames} />
      ) : (
        <Stack align="center" gap="md" className={classes.section}>
          <Group wrap="nowrap" gap="xs">
            <Icon path={mdiFlagCheckered} size={1.5} color={theme.colors[theme.primaryColor][4]} />
            <Title order={2} size="h3">
              {t('common.content.home.recent_games')}
            </Title>
          </Group>
          {showGames && showGames.length > 0 ? (
            <Stack w="100%" maw="48rem" gap="md">
              {showGames.map((game) => (
                <RecentGame key={game.id} game={game} />
              ))}
            </Stack>
          ) : (
            <Empty bordered iconSize={3} />
          )}
        </Stack>
      )}
    </WithNavBar>
  )
}

export default Home

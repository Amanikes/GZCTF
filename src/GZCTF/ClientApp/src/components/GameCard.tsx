import {
  Badge,
  Box,
  Card,
  Center,
  Group,
  Image,
  MantineColor,
  Stack,
  Title,
  Text,
  useMantineTheme,
} from '@mantine/core'
import { mdiChevronTripleRight, mdiFlagOutline } from '@mdi/js'
import { Icon } from '@mdi/react'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useLanguage } from '@Utils/I18n'
import { getGameStatus, toLimitTag } from '@Hooks/useGame'
import { BasicGameInfoModel } from '@Api'
import classes from '@Styles/GameCard.module.css'
import misc from '@Styles/Misc.module.css'

export enum GameStatus {
  Coming = 'coming',
  OnGoing = 'ongoing',
  Ended = 'ended',
}

export const GameColorMap = new Map<GameStatus, MantineColor>([
  [GameStatus.Coming, 'yellow'],
  [GameStatus.OnGoing, 'teal'],
  [GameStatus.Ended, 'gray'],
])

interface GameCardProps {
  game: BasicGameInfoModel
}

export const GameCard: FC<GameCardProps> = ({ game, ...others }) => {
  const theme = useMantineTheme()
  const { t } = useTranslation()
  const { locale } = useLanguage()

  const { summary, title, poster, limit } = game
  const { startTime, endTime, status } = getGameStatus(game)

  const duration = endTime.diff(startTime, 'hours')

  const color = GameColorMap.get(status)

  return (
    <Card {...others} shadow="sm" component={Link} to={`/games/${game.id}`} classNames={{ root: misc.hoverCard }}>
      <Card.Section>
        <Box className={classes.media} data-poster={poster || undefined}>
          {poster ? (
            <Image src={poster} alt="" className={classes.poster} />
          ) : (
            <Icon path={mdiFlagOutline} size={3} color={theme.colors.gray[5]} className={classes.mark} />
          )}
          <Center pos="absolute" top={8} right={8}>
            <Badge color={color} size="sm" variant="filled">
              {status}
            </Badge>
          </Center>
        </Box>
      </Card.Section>
      <Stack gap="xs" pt="sm">
        <Group wrap="nowrap" gap="xs">
          <Badge size="xs" color={color}>
            {toLimitTag(t, limit)}
          </Badge>
          <Badge size="xs" color={color}>
            {t('game.content.duration', {
              hours: duration,
            })}
          </Badge>
        </Group>
        <Title order={3} ta="left" lineClamp={2}>
          {title}
        </Title>
        <Group wrap="nowrap" gap={3}>
          <Badge size="xs" color={color}>
            {startTime.locale(locale).format('L LTS')}
          </Badge>
          <Icon path={mdiChevronTripleRight} size={1} />
          <Badge size="xs" color={color}>
            {endTime.locale(locale).format('L LTS')}
          </Badge>
        </Group>
        {summary ? (
          <Text fw={500} size="sm" lineClamp={2} className={classes.summary}>
            {summary}
          </Text>
        ) : null}
      </Stack>
    </Card>
  )
}

import { Anchor, Stack, Text, Title } from '@mantine/core'
import { useViewportSize } from '@mantine/hooks'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { IconWiderScreenRequired } from '@Components/icon/WiderScreenRequiredIcon'
import classes from '@Styles/Placeholder.module.css'

interface WithWiderScreenProps extends React.PropsWithChildren {
  minWidth?: number
}

export const WithWiderScreen: FC<WithWiderScreenProps> = ({ children, minWidth = 1080 }) => {
  const view = useViewportSize()

  const { t } = useTranslation()

  const tooSmall = minWidth > 0 && view.width > 0 && view.width < minWidth

  return tooSmall ? (
    <Stack gap="xs" className={classes.board}>
      <IconWiderScreenRequired />
      <Title order={1}>{t('common.content.wider.title')}</Title>
      <Text fw="bold">{t('common.content.wider.text')}</Text>
      <Text c="dimmed" size="sm" ff="monospace">
        {`>= ${minWidth}px`}
      </Text>
      <Anchor component={Link} to="/" size="sm">
        {t('common.tab.home')}
      </Anchor>
    </Stack>
  ) : (
    <>{children}</>
  )
}

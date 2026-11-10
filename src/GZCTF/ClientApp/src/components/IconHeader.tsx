import { Box, Group, Text } from '@mantine/core'
import { FC } from 'react'
import { LogoHeader } from '@Components/LogoHeader'
import { useIsMobile } from '@Utils/ThemeOverride'
import { useConfig } from '@Hooks/useConfig'
import classes from '@Styles/IconHeader.module.css'

interface StickyHeaderProps {
  sticky?: boolean
  px?: string
}

export const IconHeader: FC<StickyHeaderProps> = ({ sticky, px }) => {
  const { config } = useConfig()
  const isMobile = useIsMobile()

  return isMobile ? (
    <Box h={8} />
  ) : (
    <Group
      __vars={{
        '--header-px': px || undefined,
      }}
      data-sticky={sticky || undefined}
      className={classes.group}
    >
      <LogoHeader />
      <Text className={classes.subtitle} fz="1.375rem" lh={1.4}>
        &gt;&nbsp;{config?.slogan ?? 'Hack for fun not for profit'}
        <Text span className={classes.blink}>
          _
        </Text>
      </Text>
    </Group>
  )
}

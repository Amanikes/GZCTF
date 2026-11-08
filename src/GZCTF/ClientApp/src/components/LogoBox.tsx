import defaultLogo from '@Resources/logo.svg'
import { Box, BoxProps, createPolymorphicComponent, ElementProps, Image, StyleProp } from '@mantine/core'
import { forwardRef } from 'react'
import { useConfig } from '@Hooks/useConfig'

type LogoProps = BoxProps &
  ElementProps<'div'> & {
    size?: StyleProp<React.CSSProperties['width']>
    url?: string
  }

export const LogoBox = createPolymorphicComponent<'div', LogoProps>(
  forwardRef<HTMLDivElement, LogoProps>((props, ref) => {
    const { size, url, ...others } = props
    const { config } = useConfig()
    const custom = url || config.logoUrl

    return (
      <Box {...others} ref={ref} w={size}>
        <Image src={custom ?? defaultLogo} w={size} h={size} fit="contain" alt="logo" />
      </Box>
    )
  })
)

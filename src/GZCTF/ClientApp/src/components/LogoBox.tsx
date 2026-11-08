import defaultLogo from '@Resources/logo.png'
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
      <Box {...others} ref={ref} w={size} h={size}>
        {custom ? (
          <Image src={custom} w={size} h="auto" maw={size} mah={size} alt="logo" />
        ) : (
          <Image src={defaultLogo} w={size} h="auto" maw={size} mah={size} fit="contain" alt="logo" />
        )}
      </Box>
    )
  })
)

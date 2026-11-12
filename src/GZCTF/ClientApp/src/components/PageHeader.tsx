import { Group, MantineSpacing, Stack, Text, Title } from '@mantine/core'
import { FC, ReactNode } from 'react'
import headline from '@Styles/Headline.module.css'

interface PageHeaderProps {
  title: ReactNode
  eyebrow?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  mb?: MantineSpacing
}

/**
 * Page-level heading: renders the single `h1` of a route, with an optional
 * eyebrow, description and right-aligned actions.
 */
export const PageHeader: FC<PageHeaderProps> = ({ title, eyebrow, description, actions, mb }) => (
  <Group justify="space-between" align="flex-end" wrap="nowrap" gap="md" mb={mb} w="100%">
    <Stack gap={2} miw={0}>
      {eyebrow && (
        <Text className={headline.eyebrow} size="xs">
          {eyebrow}
        </Text>
      )}
      <Title order={1} className={headline.gradientTitle}>
        {title}
      </Title>
      {description && (
        <Text c="dimmed" size="sm">
          {description}
        </Text>
      )}
    </Stack>
    {actions && (
      <Group gap="sm" wrap="nowrap">
        {actions}
      </Group>
    )}
  </Group>
)

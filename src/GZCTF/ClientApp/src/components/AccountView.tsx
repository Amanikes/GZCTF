import { Center, Stack, VisuallyHidden } from '@mantine/core'
import { FC } from 'react'
import { PropsWithChildren, ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { LogoHeader } from '@Components/LogoHeader'
import misc from '@Styles/Misc.module.css'

interface AccountViewProps extends PropsWithChildren {
  title?: ReactNode
  onSubmit?: (event: React.SubmitEvent<HTMLFormElement>) => Promise<void>
}

export const AccountView: FC<AccountViewProps> = ({ title, onSubmit, children }) => {
  const navigate = useNavigate()

  return (
    <Center h="100vh">
      <Stack align="center" justify="center">
        <LogoHeader onClick={() => navigate('/')} />
        {title && (
          <VisuallyHidden>
            <h1>{title}</h1>
          </VisuallyHidden>
        )}
        <form className={misc.accountForm} onSubmit={onSubmit}>
          <Stack gap="xs" align="center" justify="center">
            {children}
          </Stack>
        </form>
      </Stack>
    </Center>
  )
}

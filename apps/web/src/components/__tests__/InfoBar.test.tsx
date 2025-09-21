import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from '../../../tamagui.config'
import { InfoBar, CurrentUserProvider } from '@repo/ui'

describe('InfoBar', () => {
  it('renders greeting, rank and role', () => {
    render(
      <TamaguiProvider config={tamaguiConfig}>
        <CurrentUserProvider
          user={{ firstName: 'John', lastName: 'Doe', fullName: 'John Doe', rank: 'Silver', role: 'Player' }}
        >
          <InfoBar />
        </CurrentUserProvider>
      </TamaguiProvider>
    )

    expect(screen.getByText(/Hi, John Doe/i)).toBeInTheDocument()
    expect(screen.getByText(/Silver/i)).toBeInTheDocument()
    expect(screen.getByText(/Player/i)).toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { asFragment } = render(
      <TamaguiProvider config={tamaguiConfig}>
        <CurrentUserProvider user={{ fullName: 'Alex Smith', rank: 'Gold', role: 'Admin' }}>
          <InfoBar />
        </CurrentUserProvider>
      </TamaguiProvider>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})



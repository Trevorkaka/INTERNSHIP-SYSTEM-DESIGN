import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider } from '../contexts/AuthContext'
import WelcomePage from '../pages/WelcomePage'

describe('WelcomePage', () => {
  it('renders without crashing', () => {
    render(
      <AuthProvider>
        <WelcomePage onEnter={() => {}} />
      </AuthProvider>
    )
    expect(document.body).toBeTruthy()
  })

  it('shows the ILES title', () => {
    render(
      <AuthProvider>
        <WelcomePage onEnter={() => {}} />
      </AuthProvider>
    )
    expect(screen.getByText(/ILES/i)).toBeInTheDocument()
  })
})
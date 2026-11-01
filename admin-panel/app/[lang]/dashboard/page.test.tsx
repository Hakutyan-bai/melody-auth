import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest'
import {
  screen, fireEvent,
} from '@testing-library/react'
import Page from './page'
import { configSignal } from 'signals'
import { render } from 'vitest.setup'

// Mock the required modules
vi.mock(
  'next-intl',
  () => ({ useTranslations: vi.fn(() => (key: string) => key) }),
)

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn(() => ({ push: vi.fn() })) }),
)

describe(
  'Dashboard Page',
  () => {
    const mockConfigs = {
      AUTH_SERVER_URL: 'https://auth.example.com',
      COMPANY_LOGO_URL: 'https://example.com/logo.png',
      ENABLE_SIGN_IN_LOG: true,
      ENABLE_SMS_LOG: false,
      SUPPORTED_LOCALES: ['en', 'fr'],
      AUTHORIZATION_CODE_EXPIRES_IN: 300,
      PASSWORD_RESET_CODE_THRESHOLD: 5,
      CHANGE_EMAIL_CODE_THRESHOLD: 5,
      EMAIL_VERIFICATION_CODE_THRESHOLD: 5,
    }

    beforeEach(() => {
      configSignal.value = mockConfigs as any
    })

    it(
      'shows loading spinner when configs is null',
      () => {
        configSignal.value = null
        render(<Page />)
        expect(screen.getByTestId('spinner')).toBeInTheDocument()
      },
    )

    it(
      'renders system links section',
      () => {
        render(<Page />)

        const expectedLinks = [
          `${mockConfigs.AUTH_SERVER_URL}/.well-known/openid-configuration`,
          `${mockConfigs.AUTH_SERVER_URL}/.well-known/jwks.json`,
          `${mockConfigs.AUTH_SERVER_URL}/api/v1/swagger`,
        ]

        expectedLinks.forEach((link) => {
          const linkElement = screen.getByRole(
            'link',
            { name: link },
          )
          expect(linkElement).toHaveAttribute(
            'href',
            link,
          )
          expect(linkElement).toHaveAttribute(
            'target',
            '_blank',
          )
          expect(linkElement).toHaveAttribute(
            'rel',
            'noreferrer',
          )
        })
      },
    )

    it(
      'renders config sections with correct titles',
      () => {
        render(<Page />)

        const expectedSections = [
          'dashboard.informationConfigs',
          'dashboard.localeConfigs',
          'dashboard.suppressionConfigs',
          'dashboard.authConfigs',
          'dashboard.mfaConfigs',
          'dashboard.bruteForceConfigs',
          'dashboard.ssoConfigs',
          'dashboard.logConfigs',
        ]

        expectedSections.forEach((section) => {
          expect(screen.getByText(section)).toBeInTheDocument()
        })
      },
    )

    it(
      'renders array config values as comma-separated strings',
      () => {
        render(<Page />)

        const localesCell = screen.getByText('SUPPORTED_LOCALES')
          .closest('td')?.nextElementSibling
        expect(localesCell).toHaveTextContent('en, fr')
      },
    )

    it(
      'filters configuration and expands matching groups',
      () => {
        render(<Page />)
        const search = screen.getByRole('searchbox', { name: 'dashboard.searchConfigs' })
        fireEvent.change(search, { target: { value: 'PASSWORD_RESET_CODE_THRESHOLD' } })
        expect(screen.getByText('PASSWORD_RESET_CODE_THRESHOLD')).toBeInTheDocument()
        expect(screen.queryByText('COMPANY_LOGO_URL')).not.toBeInTheDocument()
        expect(screen.getByText('PASSWORD_RESET_CODE_THRESHOLD').closest('details')).toHaveAttribute('open')
        fireEvent.change(search, { target: { value: '' } })
        expect(screen.getByText('COMPANY_LOGO_URL')).toBeInTheDocument()
      },
    )

    it(
      'shows an empty state for a configuration search without matches',
      () => {
        render(<Page />)
        fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'no-such-setting' } })
        expect(screen.getByText('dashboard.noConfigs')).toBeInTheDocument()
      },
    )

    it(
      'renders string and number config values as is',
      () => {
        render(<Page />)

        const expiresInCell = screen.getByText('AUTHORIZATION_CODE_EXPIRES_IN')
          .closest('td')?.nextElementSibling
        expect(expiresInCell).toHaveTextContent('300')

        const passwordResetCodeAttemptCell = screen.getByText('PASSWORD_RESET_CODE_THRESHOLD')
          .closest('td')?.nextElementSibling
        expect(passwordResetCodeAttemptCell).toHaveTextContent('5')

        const changeEmailCodeAttemptCell = screen.getByText('CHANGE_EMAIL_CODE_THRESHOLD')
          .closest('td')?.nextElementSibling
        expect(changeEmailCodeAttemptCell).toHaveTextContent('5')

        const emailVerificationCodeAttemptCell = screen.getByText('EMAIL_VERIFICATION_CODE_THRESHOLD')
          .closest('td')?.nextElementSibling
        expect(emailVerificationCodeAttemptCell).toHaveTextContent('5')
      },
    )
  },
)

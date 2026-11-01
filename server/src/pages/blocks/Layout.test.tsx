import {
  getByText, fireEvent,
} from '@testing-library/dom'
import {
  expect, describe, it, beforeEach, vi,
} from 'vitest'
import { render } from 'hono/jsx/dom'
import Layout from './Layout'
import {
  variableConfig, typeConfig,
} from 'configs'
import { View } from 'configs/route'

// Unit tests for the Layout Component

describe(
  'Layout Component',
  () => {
    const dummyLocale = 'en' as typeConfig.Locale
    const dummyLocales = ['en', 'fr'] as typeConfig.Locale[]
    const singleLocale = ['en'] as typeConfig.Locale[]
    const dummyLogo = 'https://example.com/logo.png'
    const dummyChild = <div data-testid='child'>Child Content</div>
    const onSwitchLocale = vi.fn()

    const setup = (props: Partial<Parameters<typeof Layout>[0]> = {}) => {
      const defaultProps = {
        logoUrl: dummyLogo,
        children: dummyChild,
        locale: dummyLocale,
        locales: dummyLocales,
        onSwitchLocale,
        ...props,
      }
      const container = document.createElement('div')
      render(
        <Layout {...defaultProps} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      onSwitchLocale.mockReset()
    })

    it(
      'renders children content',
      () => {
        const container = setup()
        expect(getByText(
          container,
          'Child Content',
        )).toBeDefined()
      },
    )

    it(
      'renders logo image with correct src and alt',
      () => {
        const container = setup()
        const logo = container.querySelector('img')
        expect(logo).toBeDefined()
        expect(logo?.getAttribute('src')).toBe(dummyLogo)
        expect(logo?.getAttribute('alt')).toBe('Logo')
      },
    )

    it(
      'renders LocaleSelector when multiple locales are provided',
      () => {
        const container = setup()
        const localeSelector = container.querySelector('select[aria-label="Select Locale"]')
        expect(localeSelector).not.toBeNull()
      },
    )

    it(
      'does not render LocaleSelector when only one locale is provided',
      () => {
        const container = setup({ locales: singleLocale })
        const localeSelector = container.querySelector('select[aria-label="Select Locale"]')
        expect(localeSelector).toBeNull()
      },
    )

    it(
      'shows the actual destination application as text',
      () => {
        const container = setup({ appName: 'Sakura Notes <private>' })
        expect(container.querySelector('.auth-destination p')?.textContent).toBe('Sakura Notes <private>')
        expect(container.querySelector('.auth-destination private')).toBeNull()
      },
    )

    it(
      'switches account views and honours disabled registration',
      () => {
        const onSwitchView = vi.fn()
        const container = setup({
          onSwitchView,
          enableSignUp: false,
          enablePasswordReset: true,
        })
        const nav = container.querySelector('nav')!
        expect(nav.querySelectorAll('button')).toHaveLength(2)
        fireEvent.click(getByText(
          nav,
          'Recover access',
        ))
        expect(onSwitchView).toHaveBeenCalledWith(View.ResetPassword)
      },
    )

    it(
      'does not offer account navigation during a verification step',
      () => {
        const container = setup({
          view: View.OtpMfa,
          onSwitchView: vi.fn(),
          enableSignUp: true,
        })
        expect(container.querySelector('nav')).toBeNull()
      },
    )

    it(
      'identifies the authentication service in the footer',
      () => {
        const container = setup()
        const footer = container.querySelector('footer')
        expect(footer?.textContent).toContain(variableConfig.systemConfig.name)
        expect(footer?.textContent).toContain('Account authentication')
      },
    )
  },
)

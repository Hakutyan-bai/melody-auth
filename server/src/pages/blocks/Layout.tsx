import {
  typeConfig, variableConfig,
} from 'configs'
import { LocaleSelector } from 'pages/components'
import { authLayout } from 'pages/tools/locale'
import { View } from 'configs/route'

export interface LayoutProps {
  children: any;
  locale: typeConfig.Locale;
  locales: typeConfig.Locale[];
  logoUrl: string;
  onSwitchLocale: (locale: typeConfig.Locale) => void;
  appName?: string;
  view?: string;
  enableSignUp?: boolean;
  enablePasswordReset?: boolean;
  onSwitchView?: (view: View) => void;
}

const Layout = ({
  children, locale, locales, logoUrl, onSwitchLocale,
  appName, view = View.SignIn, enableSignUp, enablePasswordReset, onSwitchView,
}: LayoutProps) => {
  const copy = authLayout[locale] ?? authLayout.en
  const accountViews = [View.SignIn, View.SignUp, View.ResetPassword]
  const showAccountNav = accountViews.includes(view as View) && !!onSwitchView
  const destinations = [
    {
      view: View.SignIn,
      label: copy.signIn,
      visible: true,
    },
    {
      view: View.SignUp,
      label: copy.signUp,
      visible: enableSignUp,
    },
    {
      view: View.ResetPassword,
      label: copy.recovery,
      visible: enablePasswordReset,
    },
  ]

  return (
    <div
      className='auth-shell'
      lang={locale}
    >
      <aside className='auth-rail'>
        <div className='auth-brand'>
          {logoUrl && <img
            src={logoUrl}
            alt='Logo'
            className='auth-logo'
          />}
          <span>{variableConfig.systemConfig.name}</span>
        </div>
        <div className='auth-rail-content'>
          <p className='auth-rail-label'>{copy.account}</p>
          {showAccountNav && (
            <nav
              className='auth-nav'
              aria-label={copy.account}
            >
              {destinations.filter((destination) => destination.visible).map((destination) => (
                <button
                  key={destination.view}
                  type='button'
                  aria-current={view === destination.view ? 'page' : undefined}
                  onClick={() => onSwitchView?.(destination.view)}
                >
                  {destination.label}
                  <span aria-hidden='true'>→</span>
                </button>
              ))}
            </nav>
          )}
        </div>
        <div className='auth-rail-note'>
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            stroke-width='1.5'
            aria-hidden='true'
          >
            <path d='M12 3 4.5 6v5.5c0 4.2 3.2 7.6 7.5 9.5 4.3-1.9 7.5-5.3 7.5-9.5V6L12 3Z' />
            <path d='m8.5 12 2.3 2.3 4.7-4.8' />
          </svg>
          <p>{copy.railNote}</p>
        </div>
      </aside>
      <div className='auth-workspace'>
        <header className='auth-topbar'>
          <span className='auth-mobile-brand'>
            {logoUrl && <img
              src={logoUrl}
              alt=''
              className='auth-logo'
            />}
            {variableConfig.systemConfig.name}
          </span>
          <span className='auth-topbar-title'>{copy.accountCenter}</span>
          {locales.length > 1 && (
            <div className='auth-language'>
              <LocaleSelector
                locale={locale}
                locales={locales}
                onChange={onSwitchLocale}
              />
            </div>
          )}
        </header>
        <main
          className='auth-sheet'
          id='main-content'
        >
          <div className='auth-content-grid'>
            <div className='auth-context'>
              <p className='auth-context-title'>{copy.identity}</p>
              <p className='auth-context-description'>{copy.description}</p>
              {appName && (
                <div className='auth-destination'>
                  <span>{copy.destination}</span>
                  <p>{appName}</p>
                </div>
              )}
              <p className='auth-context-note'>{copy.contextNote}</p>
            </div>
            <div className='auth-form-content'>
              {children}
            </div>
          </div>
          <footer className='auth-footer'>
            <span>{variableConfig.systemConfig.name}</span>
            <span>{copy.footerNote}</span>
          </footer>
        </main>
      </div>
    </div>
  )
}

export default Layout

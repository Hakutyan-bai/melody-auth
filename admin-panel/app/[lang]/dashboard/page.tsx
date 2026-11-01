'use client'

import { useTranslations } from 'next-intl'
import {
  useMemo, useState,
} from 'react'
import { ArrowUpRight, ChevronDown, Search } from 'lucide-react'

import ConfigBooleanValue from 'components/ConfigBooleanValue'
import PageTitle from 'components/PageTitle'
import { configSignal } from 'signals'
import useSignalValue from 'app/useSignalValue'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import Breadcrumb from 'components/Breadcrumb'
import LoadingPage from 'components/LoadingPage'
import { Input } from 'components/ui/input'

const configNameClass = 'w-96 max-md:w-60'

const Page = () => {
  const t = useTranslations()

  const configs = useSignalValue(configSignal)
  const [search, setSearch] = useState('')

  const configTypes = [
    {
      name: t('dashboard.informationConfigs'),
      value: [
        'COMPANY_LOGO_URL',
        'COMPANY_EMAIL_LOGO_URL',
        'EMAIL_SENDER_NAME',
        'TERMS_LINK',
        'PRIVACY_POLICY_LINK',
      ],
    },
    {
      name: t('dashboard.localeConfigs'),
      value: ['SUPPORTED_LOCALES', 'ENABLE_LOCALE_SELECTOR'],
    },
    {
      name: t('dashboard.suppressionConfigs'),
      value: [
        'ENABLE_NAMES',
        'NAMES_IS_REQUIRED',
        'ENABLE_SIGN_UP',
        'ENABLE_PASSWORD_SIGN_IN',
        'ENABLE_PASSWORDLESS_SIGN_IN',
        'ENABLE_EMAIL_VERIFICATION',
        'REPLACE_EMAIL_VERIFICATION_WITH_WELCOME_EMAIL',
        'ENABLE_PASSWORD_RESET',
        'ENABLE_USER_APP_CONSENT',
        'ENABLE_APP_BANNER',
        'ENABLE_ORG',
        'BLOCKED_POLICIES',
      ],
    },
    {
      name: t('dashboard.authConfigs'),
      value: [
        'AUTHORIZATION_CODE_EXPIRES_IN',
        'SPA_ACCESS_TOKEN_EXPIRES_IN',
        'SPA_REFRESH_TOKEN_EXPIRES_IN',
        'S2S_ACCESS_TOKEN_EXPIRES_IN',
        'ID_TOKEN_EXPIRES_IN',
        'SERVER_SESSION_EXPIRES_IN',
      ],
    },
    {
      name: t('dashboard.mfaConfigs'),
      value: [
        'OTP_MFA_IS_REQUIRED',
        'SMS_MFA_IS_REQUIRED',
        'EMAIL_MFA_IS_REQUIRED',
        'ENFORCE_ONE_MFA_ENROLLMENT',
        'ALLOW_EMAIL_MFA_AS_BACKUP',
        'ALLOW_PASSKEY_ENROLLMENT',
        'ENABLE_RECOVERY_CODE',
        'ENABLE_MFA_REMEMBER_DEVICE',
      ],
    },
    {
      name: t('dashboard.bruteForceConfigs'),
      value: [
        'ACCOUNT_LOCKOUT_THRESHOLD', 'ACCOUNT_LOCKOUT_EXPIRES_IN',
        'UNLOCK_ACCOUNT_VIA_PASSWORD_RESET', 'PASSWORD_RESET_EMAIL_THRESHOLD',
        'PASSWORD_RESET_CODE_THRESHOLD', 'CHANGE_EMAIL_EMAIL_THRESHOLD',
        'CHANGE_EMAIL_CODE_THRESHOLD', 'EMAIL_VERIFICATION_CODE_THRESHOLD',
        'EMAIL_MFA_EMAIL_THRESHOLD',
        'SMS_MFA_MESSAGE_THRESHOLD', 'MFA_CODE_VERIFY_THRESHOLD',
        'AUTH_CODE_VERIFIER_THRESHOLD',
      ],
    },
    {
      name: t('dashboard.ssoConfigs'),
      value: [
        'GOOGLE_AUTH_CLIENT_ID',
        'FACEBOOK_AUTH_CLIENT_ID',
        'GITHUB_AUTH_CLIENT_ID',
        'GITHUB_AUTH_APP_NAME',
        'DISCORD_AUTH_CLIENT_ID',
        'OIDC_AUTH_PROVIDERS',
      ],
    },
    {
      name: t('dashboard.logConfigs'),
      value: ['ENABLE_EMAIL_LOG', 'ENABLE_SMS_LOG', 'ENABLE_SIGN_IN_LOG'],
    },
  ]

  const links = useMemo(
    () => configs
      ? ({
        openidConfig: `${configs.AUTH_SERVER_URL}/.well-known/openid-configuration`,
        jwks: `${configs.AUTH_SERVER_URL}/.well-known/jwks.json`,
        apiSwagger: `${configs.AUTH_SERVER_URL}/api/v1/swagger`,
        embeddedSwagger: `${configs.AUTH_SERVER_URL}/api/v1/embedded-swagger`,
      })
      : null,
    [configs],
  )

  if (!configs) return <LoadingPage />

  const endpoints = links ? [
    { label: 'OpenID configuration', href: links.openidConfig },
    { label: 'JWKS', href: links.jwks },
    { label: t('dashboard.apiSwagger'), href: links.apiSwagger },
    { label: t('dashboard.embeddedSwagger'), href: links.embeddedSwagger },
  ] : []
  const summary = [
    { name: t('dashboard.signUp'), key: 'ENABLE_SIGN_UP' },
    { name: t('dashboard.passwordSignIn'), key: 'ENABLE_PASSWORD_SIGN_IN' },
    { name: t('dashboard.appConsent'), key: 'ENABLE_USER_APP_CONSENT' },
    { name: t('dashboard.passkeys'), key: 'ALLOW_PASSKEY_ENROLLMENT' },
  ]
  const query = search.trim().toLowerCase()
  const groups = configTypes.map((group) => ({
    ...group,
    value: group.value.filter((key) => !query || `${group.name} ${key} ${configs[key] ?? ''}`.toLowerCase().includes(query)),
  })).filter((group) => group.value.length)

  return (
    <section className='admin-overview'>
      <Breadcrumb
        page={{ label: t('layout.dashboard') }}
      />
      <p className='admin-page-description'>{t('dashboard.overviewDescription')}</p>
      <section className='admin-auth-capabilities' aria-label={t('dashboard.authenticationStatus')}>
        {summary.map((item) => (
          <div key={item.key}>
            <span>{item.name}</span>
            <ConfigBooleanValue config={configs[item.key]} />
          </div>
        ))}
      </section>
      <div className='admin-overview-grid'>
        <section className='admin-endpoints'>
          <PageTitle title={t('dashboard.links')} />
          <p className='admin-section-description'>{t('dashboard.endpointDescription')}</p>
          <div className='admin-endpoint-list'>
            {endpoints.map((endpoint) => (
              <div className='admin-endpoint' key={endpoint.href}>
                <span>{endpoint.label}</span>
                <a href={endpoint.href} target='_blank' rel='noreferrer'>
                  <span>{endpoint.href}</span>
                  <ArrowUpRight aria-hidden='true' />
                </a>
              </div>
            ))}
          </div>
          <div className='admin-service-note'>
            <span>{t('dashboard.authServer')}</span>
            <p>{configs.AUTH_SERVER_URL || '—'}</p>
            <span>{t('dashboard.configReadOnly')}</span>
          </div>
        </section>
        <section className='admin-configs'>
          <PageTitle title={t('dashboard.allConfigs')} />
          <p className='admin-section-description'>{t('dashboard.configDescription')}</p>
          <div className='admin-config-search'>
            <Search aria-hidden='true' />
            <Input
              type='search'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('dashboard.searchConfigs')}
              aria-label={t('dashboard.searchConfigs')}
            />
          </div>
          {!groups.length && <p className='admin-empty-state'>{t('dashboard.noConfigs')}</p>}
          {groups.map((configType) => (
            <details
              key={configType.name}
              className='admin-config-group'
              open={query ? true : undefined}
            >
              <summary>
                <span>{configType.name}</span>
                <span className='admin-config-group-count'>{configType.value.length}</span>
                <ChevronDown aria-hidden='true' />
              </summary>
              <Table className='admin-config-table'>
            <TableHeader>
              <TableRow>
                <TableHead className={configNameClass}>{t('dashboard.configName')}</TableHead>
                <TableHead>{t('dashboard.configValue')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configType.value.map((configName) => (
                <TableRow key={configName}>
                  <TableCell><code>{configName}</code></TableCell>
                  <TableCell className={typeof configs[configName] === 'number' ? 'admin-numeric' : undefined}>
                    {typeof configs[configName] === 'boolean' && <ConfigBooleanValue config={configs[configName]} />}
                    {Array.isArray(configs[configName]) && configs[configName].join(', ')}
                    {typeof configs[configName] !== 'boolean' && !Array.isArray(configs[configName]) && (configs[configName] === '' || configs[configName] == null ? '—' : configs[configName])}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
              </Table>
            </details>
          ))}
        </section>
      </div>
    </section>
  )
}

export default Page

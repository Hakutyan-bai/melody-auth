import { useTranslations } from 'next-intl'

const ConfigBooleanValue = ({ config }: { config?: boolean }) => {
  const t = useTranslations()
  return (
    <span
      className='admin-config-state'
      data-enabled={config === true}
    >
      <span aria-hidden='true' />
      {config === undefined ? '—' : t(config ? 'common.enable' : 'common.disabled')}
    </span>
  )
}

export default ConfigBooleanValue

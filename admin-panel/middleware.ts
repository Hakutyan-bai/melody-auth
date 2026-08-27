import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  localeDetection: false,
})

export const config = { matcher: ['/', '/(zh|en)/:path*'] }

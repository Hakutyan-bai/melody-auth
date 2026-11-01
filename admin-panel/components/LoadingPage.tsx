import { Spinner } from 'components/ui/spinner'

const LoadingPage = () => {
  return (
    <section className='admin-loading'>
      <Spinner data-testid='spinner' />
    </section>
  )
}

export default LoadingPage

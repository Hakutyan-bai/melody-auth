import classNames from 'classnames'

const PageTitle = ({
  title,
  className,
}: {
  title: string;
  className?: string;
}) => {
  return (
    <h2
      className={classNames(
        'font-semibold text-lg',
        className,
      )}>{title}
    </h2>
  )
}

export default PageTitle

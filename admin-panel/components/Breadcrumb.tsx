import classNames from 'classnames'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from 'components/ui/breadcrumb'
import { useRouter } from 'i18n/navigation'

const ShadcnBreadcrumb = ({
  parent,
  page,
  action,
  className,
}: {
  parent?: {
    label: string;
    href: string;
  };
  page?: {
    label: string;
  };
  action?: React.ReactNode;
  className?: string;
}) => {
  const router = useRouter()
  return (
    <section
      className={classNames(
        'admin-page-heading',
        className,
      )}>
      <Breadcrumb>
        <BreadcrumbList>
          {parent && (
            <>
              <BreadcrumbItem className='cursor-pointer'>
                <BreadcrumbLink
                  onClick={() => {
                    router.push(parent.href)
                  }}
                >
                  {parent.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}

          {page && (
            <>
              <h1 className='admin-page-title'>
                {page.label}
              </h1>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      {action && <div className='admin-heading-action'>{action}</div>}
    </section>
  )
}

export default ShadcnBreadcrumb

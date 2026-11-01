export interface ViewTitleProps {
  title: string;
}

const ViewTitle = ({ title }: ViewTitleProps) => {
  return <h1 className='auth-view-title'>{title}</h1>
}

export default ViewTitle

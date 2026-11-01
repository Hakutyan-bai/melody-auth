import Spinner from './Spinner'

export interface PrimaryButtonProps {
  title: string | React.ReactNode;
  className?: string;
  type: 'submit' | 'button';
  onClick?: (e: Event) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const PrimaryButton = ({
  title, className, type, onClick, isLoading, disabled,
}: PrimaryButtonProps) => {
  return (
    <button
      className={`auth-primary flex items-center justify-center cursor-pointer p-2 bg-primaryButtonColor text-primaryButtonLabelColor border border-primaryButtonBorderColor font-medium text-base ${className ?? ''}`}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      onClick={onClick}
    >
      {title}
      {isLoading && (
        <span className='ml-2'>
          <Spinner />
        </span>
      )}
    </button>
  )
}

export default PrimaryButton

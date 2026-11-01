const SubmitError = ({ error }: {
  error: string | null;
}) => {
  if (!error) {
    return null
  }

  return (
    <p
      className='auth-submit-error break-words w-(--text-width) box-border'
      role='alert'
    >
      {error}
    </p>
  )
}

export default SubmitError

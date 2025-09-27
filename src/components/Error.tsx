import React from 'react';

type ErrorMessageProps = {
  id: string;
  message?: string;
  touched?: boolean;
};

const ErrorMessageComponent: React.FC<ErrorMessageProps> = ({
  id,
  message,
  touched,
}) => {
  // console.log('Rendering ErrorMessage:', { id, message, touched });

  if (!touched || !message) return null;

  return (
    <span data-testid={id} className="error">
      {message}
    </span>
  );
};

const ErrorMessage = React.memo(ErrorMessageComponent);

export default ErrorMessage;

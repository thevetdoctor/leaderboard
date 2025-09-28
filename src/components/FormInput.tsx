import React from 'react';

import ErrorMessage from './Error';

interface FormInputProps {
  name: string;
  type?: string;
  placeholder?: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => any;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

const FormInput: React.FC<FormInputProps> = ({
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  errors,
  touched,
}) => {
  return (
    <div className="form-group">
      <input
        data-testid={`${name}-input`}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onChange}
        className={touched[name] && errors[name] ? 'error-input' : ''}
      />
      <ErrorMessage
        id={`${name}-error`}
        message={errors[name]}
        touched={touched[name]}
      />
    </div>
  );
};

export default FormInput;

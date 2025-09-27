// import React from 'react';

// interface FormInputProps {
//   name: string;
//   type?: string;
//   placeholder?: string;
//   value: string;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
//   errors: Record<string, string>;
//   touched: Record<string, boolean>;
// }

// const ErrorMessage: React.FC<{
//   id: string;
//   message?: string;
//   touched?: boolean;
// }> = ({ id, message, touched }) => {
//   if (!touched || !message) return null;
//   return (
//     <span data-testid={id} className="error">
//       {message}
//     </span>
//   );
// };

// const FormInput: React.FC<FormInputProps> = ({
//   name,
//   type = 'text',
//   placeholder,
//   value,
//   onChange,
//   onBlur,
//   errors,
//   touched,
// }) => {
//   return (
//     <div className="form-group">
//       <input
//         data-testid={`${name}-input`}
//         name={name}
//         type={type}
//         placeholder={placeholder}
//         value={value}
//         onChange={e => onChange(name, e.target.value)}
//         onBlur={onBlur}
//         className={touched[name] && errors[name] ? 'error-input' : ''}
//       />
//       <ErrorMessage
//         id={`${name}-error`}
//         message={errors[name]}
//         touched={touched[name]}
//       />
//     </div>
//   );
// };

// export default FormInput;

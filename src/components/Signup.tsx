import { useState } from 'react';

import axiosInstance from '../utils/axiosInstance';
import { validate } from '../utils/util.function';
import type { Step, Values } from '../utils/util.type';
import ErrorMessage from './Error';
import FormInput from './FormInput';

type SignupProps = {
  onShowLogin: () => void;
  connectionId: string | null;
  onSetSignupSuccess: () => void;
  onSetStep: () => void;
};

const Signup: React.FC<SignupProps> = ({
  onShowLogin,
  connectionId,
  onSetSignupSuccess,
  onSetStep,
}) => {
  const [values, setValues] = useState<Values>({
    email: '',
    username: '',
    password: '',
    name: '',
    preferred_username: '',
    confirmationCode: '',
    score: '',
  });
  const [errors, setErrors] = useState<Partial<Values>>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof Values, boolean>>
  >({});
  const [signupLoading, setSignupLoading] = useState<boolean>(false);
  const { email, username, preferred_username, name, password } = values;

  const handleChange = (step: Step, field: keyof Values, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    const newErrors = validate(
      step,
      { ...values, [field]: value },
      field,
      value,
    );
    console.log('handleChange', step, field, value, newErrors);
    setErrors(newErrors);
  };

  const handleSignup = async () => {
    try {
      setErrors({});
      console.log('signing up');
      const newErrors = validate('signup', values);
      // mark all fields as touched
      setTouched(
        Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      );
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setSignupLoading(true);

      await axiosInstance.post(
        `/auth/register`,
        {
          email,
          username,
          preferred_username,
          name,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            connectionId: connectionId,
          },
        },
      );

      onSetSignupSuccess();
      onSetStep();
    } catch (err: any) {
      console.error(err.message);
      setSignupLoading(false);
      setErrors((prev) => ({
        ...prev,
        signupError: err.message,
      }));
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div>
      <h2 data-testid="signup-header">Signup</h2>
      <FormInput
        name="email"
        type="text"
        placeholder="Email"
        value={values.email}
        onChange={(e) => handleChange('signup', 'email', e.target.value)}
        errors={errors}
        touched={touched}
      />
      <FormInput
        name="username"
        type="text"
        placeholder="Username"
        value={values.username}
        onChange={(e) => handleChange('signup', 'username', e.target.value)}
        errors={errors}
        touched={touched}
      />
      <FormInput
        name="preferred_username"
        type="text"
        placeholder="Preferred Username"
        value={values.preferred_username}
        onChange={(e) =>
          handleChange('signup', 'preferred_username', e.target.value)
        }
        errors={errors}
        touched={touched}
      />
      <FormInput
        name="name"
        type="text"
        placeholder="Name"
        value={values.name}
        onChange={(e) => handleChange('signup', 'name', e.target.value)}
        errors={errors}
        touched={touched}
      />
      <FormInput
        name="password"
        type="text"
        placeholder="Password"
        value={values.password}
        onChange={(e) => handleChange('signup', 'password', e.target.value)}
        errors={errors}
        touched={touched}
      />
      <div>
        {signupLoading ? (
          <div className="spinner">
            <div></div>
          </div>
        ) : (
          <>
            <button data-testid="submit-signup-button" onClick={handleSignup}>
              Sign Up
            </button>
            <button data-testid="submit-login-button" onClick={onShowLogin}>
              Login
            </button>
          </>
        )}
      </div>
      <div>
        <ErrorMessage id="signup-error" touched message={errors.signupError} />
      </div>
    </div>
  );
};

export default Signup;

import React, { useState } from 'react';

import type { AxiosResponse } from 'axios';

import axiosInstance from '../utils/axiosInstance';
import { validate } from '../utils/util.function';
import {
  type LoginResponse,
  type Step,
  type Values,
  decrypt,
} from '../utils/util.type';
import ErrorMessage from './Error';
import FormInput from './FormInput';

type LoginProps = {
  onShowSignup: () => void;
  connectionId: string | null;
  onSetLoggedIn: () => void;
  onSetStep: () => void;
  onFetchScores: () => void;
};

const Login: React.FC<LoginProps> = ({
  onShowSignup,
  connectionId,
  onSetLoggedIn,
  onSetStep,
  onFetchScores,
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
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const { username, password } = values;

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

  const handleLogin = async () => {
    try {
      setErrors({});
      console.log('logging in');
      const newErrors = validate('login', values);
      // mark all fields as touched
      setTouched(
        Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      );
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setLoginLoading(true);
      const login: AxiosResponse<LoginResponse> = await axiosInstance.post(
        `/auth/login`,
        {
          username,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            connectionId: connectionId,
          },
        },
      );
      const userData = decrypt(login.data.data.user);
      console.log('encrypted', login.data.data.user && 'valid');
      console.log('decrypted', userData && 'valid');
      localStorage.setItem('user_id', JSON.stringify(login.data.data.user_id));
      localStorage.setItem(
        'username',
        JSON.stringify(login.data.data.username),
      );
      onSetLoggedIn();
      onSetStep();
      onFetchScores();
    } catch (err: any) {
      console.error(err.message);
      setLoginLoading(false);
      setErrors((prev) => ({
        ...prev,
        loginError: err.message,
      }));
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div>
      <h2 data-testid="login-header">Login</h2>

      <FormInput
        name="username"
        type="text"
        placeholder="Username"
        value={values.username}
        onChange={(e) => handleChange('login', 'username', e.target.value)}
        errors={errors}
        touched={touched}
      />
      <FormInput
        name="password"
        type="password"
        placeholder="Password"
        value={values.password}
        onChange={(e) => handleChange('login', 'password', e.target.value)}
        errors={errors}
        touched={touched}
      />

      {loginLoading ? (
        <div className="spinner">
          <div></div>
        </div>
      ) : (
        <>
          <button data-testid="submit-login-button" onClick={handleLogin}>
            Login
          </button>
          <button data-testid="submit-signup-button" onClick={onShowSignup}>
            Sign Up
          </button>
        </>
      )}
      <div>
        <ErrorMessage id="login-error" touched message={errors.loginError} />
      </div>
    </div>
  );
};

export default Login;

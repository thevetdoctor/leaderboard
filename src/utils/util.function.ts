import type { Step } from './util.type';

export const scoreRegex = /^(0|[1-9][0-9]*)$/;
export const emailRegex = /\S+@\S+\.\S+/;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export type FormValues = {
  email?: string;
  username?: string;
  preferred_username?: string;
  name?: string;
  password?: string;
  confirmationCode?: string;
  score?: string;
};

export const validate = (
  type: Step,
  values: FormValues,
  field?: string,
  currentValue?: string,
) => {
  const {
    email,
    username,
    preferred_username,
    name,
    password,
    confirmationCode,
    score,
  } = values;
  const newErrors: Record<string, string> = {};
  // console.log('before:', newErrors);
  const isEmpty = (value?: string) => !value || !value.trim();

  // reset only the field being validated (so old error messages disappear if fixed)
  if (field) delete newErrors[field];

  console.log('validating', type, field, currentValue);

  // Dynamic lookup: use currentValue if provided, otherwise use state
  const getValue = (name: string, fallback: string | undefined) =>
    field === name && currentValue !== undefined ? currentValue : fallback;

  if (type === 'login') {
    const usernameVal = getValue('username', username);
    if ((!field || field === 'username') && isEmpty(usernameVal))
      newErrors.username = 'Username is required';

    const passwordVal = getValue('password', password) ?? '';
    if ((!field || field === 'password') && isEmpty(passwordVal)) {
      newErrors.password = 'Password is required';
    } else if (
      (!field || field === 'password') &&
      !passwordRegex.test(passwordVal)
    ) {
      newErrors.password =
        'Password must be at least 8 characters, include uppercase, lowercase, number, and special character';
    }
  }

  if (type === 'signup') {
    const emailVal = getValue('email', email) ?? '';
    if ((!field || field === 'email') && isEmpty(emailVal)) {
      newErrors.email = 'Email is required';
    } else if ((!field || field === 'email') && !emailRegex.test(emailVal)) {
      newErrors.email = 'Enter a valid email';
    }

    const preferredUsernameVal = getValue(
      'preferred_username',
      preferred_username,
    );
    if (
      (!field || field === 'preferred_username') &&
      isEmpty(preferredUsernameVal)
    )
      newErrors.preferred_username = 'Preferred username is required';

    const nameVal = getValue('name', name);
    if ((!field || field === 'name') && isEmpty(nameVal))
      newErrors.name = 'Name is required';

    const usernameVal = getValue('username', username);
    if ((!field || field === 'username') && isEmpty(usernameVal))
      newErrors.username = 'Username is required';

    const passwordVal = getValue('password', password) ?? '';
    if ((!field || field === 'password') && isEmpty(passwordVal)) {
      newErrors.password = 'Password is required';
    } else if (
      (!field || field === 'password') &&
      !passwordRegex.test(passwordVal)
    ) {
      newErrors.password =
        'Password must be at least 8 characters, include uppercase, lowercase, number, and special character';
    }
  }

  if (type === 'confirm') {
    if ((!field || field === 'confirmationCode') && isEmpty(confirmationCode)) {
      newErrors.confirmationCode = 'Confirmation code is required';
    }
  }

  if (type === 'submit') {
    const scoreVal = getValue('score', score) ?? '';

    if ((!field || field === 'score') && isEmpty(score)) {
      newErrors.score = 'Score is required';
    } else if ((!field || field === 'score') && !scoreRegex.test(scoreVal)) {
      newErrors.score = 'Score must be a positive integer';
    }
  }

  // console.log('after', newErrors);
  return newErrors;
};

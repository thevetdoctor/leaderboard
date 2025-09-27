/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';

import { type AxiosResponse } from 'axios';

import axiosInstance from '../utils/axiosInstance';
import { validate } from '../utils/util.function';
import {
  type AuthProps,
  type LeaderboardItem,
  type LeaderboardResponse,
  type LoginResponse,
  type Step,
  type Values,
  decrypt,
} from '../utils/util.type';
import './Auth.css';
import ErrorMessage from './Error';
import './Popup.css';

const Auth = ({ connectionId }: AuthProps) => {
  const [loggedIn, setLoggedIn] = useState(
    () => !!localStorage.getItem('user_id'),
  );

  const [values, setValues] = useState<Values>({
    email: '',
    username: '',
    password: '',
    name: '',
    preferred_username: '',
    confirmationCode: '',
    score: '',
  });

  const [touched, setTouched] = useState<
    Partial<Record<keyof Values, boolean>>
  >({});
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>(
    {},
  );

  const [step, setStep] = useState<Step>(loggedIn ? 'home' : 'signup');

  const [scores, setScores] = useState<LeaderboardItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [signupLoading, setSignupLoading] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [signupSuccess, setSignupSuccess] = useState<boolean>(false);
  const [confirmSuccess, setConfirmSuccess] = useState<boolean>(false);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);

  const [showHighest, setShowHighest] = useState<boolean>(false);
  const [highestLoading, setHighestLoading] = useState<boolean>(false);
  const [highestScore, setHighestScore] = useState<LeaderboardItem>();

  const [page, setPage] = useState<number>(1);
  const totalPages = Math.ceil(totalCount / 10);
  const [lastKeys, setLastKeys] = useState<Record<number, string>>({});

  const [deleteScore, setDeleteScore] = useState<boolean>(false);
  const [deleteItem, setDeleteItem] = useState<{
    score: number;
    user_name: string;
    id?: string;
  }>();
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const {
    email,
    username,
    preferred_username,
    name,
    password,
    confirmationCode,
    score,
  } = values;

  const handlePrevPage = () => {
    if (page > 1) {
      console.log('Going to page:', page - 1);
      setPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      console.log('Going to page:', page + 1);
      setPage((prev) => prev + 1);
    }
  };

  const handleChange = (step: Step, field: keyof Values, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    console.log('handleChange', step, field, value);
    const newErrors = validate(
      step,
      { ...values, [field]: value },
      field,
      value,
    );
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

      setSignupSuccess(true);
      setStep('popup');
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

  const handleConfirm = async () => {
    try {
      setErrors({});
      console.log('confirming code');
      const newErrors = validate('confirm', values);
      // mark all fields as touched
      setTouched(
        Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      );
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setConfirmLoading(true);
      await axiosInstance.post(
        `/auth/confirm`,
        {
          username,
          code: confirmationCode,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            connectionId: connectionId,
          },
        },
      );

      setConfirmSuccess(true);
      setStep('popup');
    } catch (err: any) {
      console.error(err.message);
      setConfirmLoading(false);
      setErrors((prev) => ({
        ...prev,
        confirmError: err.message,
      }));
    } finally {
      setConfirmLoading(false);
    }
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
      setLoggedIn(true);
      setStep('home');
      fetchScores(page);
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

  const handleSubmit = async () => {
    try {
      setErrors({});
      console.log('submitting scores');
      const newErrors = validate('submit', values);
      // mark all fields as touched
      setTouched(
        Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      );
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setSubmitLoading(true);
      const userId = localStorage.getItem('user_id');
      const usernameStored = localStorage.getItem('username');

      await axiosInstance.post(
        `/leaderboard/score`,
        {
          score: parseInt(score ?? '0', 10),
          user_name: usernameStored ? JSON.parse(usernameStored) : '',
          user_id: userId ? JSON.parse(userId) : '',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            connectionId: connectionId,
          },
        },
      );
      setStep('home');
      fetchScores(page);
    } catch (err: any) {
      console.error(err.message);
      setSubmitLoading(false);
      setErrors((prev) => ({
        ...prev,
        submitError: err.message,
      }));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteScore = async (id: string) => {
    try {
      setErrors({});
      console.log('deleting score');
      setDeleteLoading(true);
      const userId = localStorage.getItem('user_id');
      const usernameStored = localStorage.getItem('username');

      await axiosInstance.delete(`/leaderboard/score/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          connectionId: connectionId,
          userId,
          username: usernameStored ? JSON.parse(usernameStored) : '',
        },
      });
      setDeleteItem(undefined);
      setDeleteSuccess(true);
    } catch (err: any) {
      console.error(err.message);
      setDeleteLoading(false);
      setErrors((prev) => ({
        ...prev,
        deleteError: err.message,
      }));
    } finally {
      setDeleteLoading(false);
    }
  };

  const showLogin = () => {
    setStep('login');
  };

  const showSignup = () => {
    setStep('signup');
  };

  const fetched = useRef(false);
  async function fetchScores(page: number) {
    try {
      setErrors({});
      console.log('Fetching scores for page:', page);
      setLoading(true);
      const lastKey = lastKeys[page - 1];
      const lastKeyParam = lastKey ? `&lastKey=${lastKey}` : '';
      const res: AxiosResponse<LeaderboardResponse> = await axiosInstance.get(
        `/leaderboard/all?limit=10${lastKeyParam}`,
        {
          headers: {
            'Content-Type': 'application/json',
            connectionId: connectionId,
          },
        },
      );
      setScores(res.data.data);
      setTotalCount(res.data.count);
      setLastKeys((prev) => ({
        ...prev,
        [page]: res.data.lastKey ?? '',
      }));
      console.log('lastKeys', lastKeys);
    } catch (err: any) {
      setLoading(false);
      setErrors((prev) => ({
        ...prev,
        fetchScoresError: err.message,
      }));
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchHighestScore() {
    try {
      setErrors({});
      setHighestLoading(true);
      console.log('Fetching highest score');
      const res: AxiosResponse<LeaderboardResponse> = await axiosInstance.get(
        `/leaderboard/top`,
        {
          headers: {
            'Content-Type': 'application/json',
            connectionId: connectionId,
          },
        },
      );
      setHighestScore(res.data.data[0]);
      setTotalCount(res.data.count);
    } catch (err: any) {
      console.error('Error fetching highest score:', err.message);
      setErrors((prev) => ({
        ...prev,
        fetchHighestScoreError: err.message,
      }));
      setHighestLoading(false);
    } finally {
      setHighestLoading(false);
    }
  }

  useEffect(() => {
    if (step !== 'home' || page === 0) return;
    fetched.current = true;
    fetchScores(page);
    console.log('fetching connectionId', connectionId);
    return () => {};
  }, [page]);

  useEffect(() => {
    if (showHighest) {
      fetchHighestScore();
    }
    return () => {};
  }, [showHighest]);

  return (
    <div>
      {step === 'signup' && (
        <div>
          <h2 data-testid="signup-header">Signup</h2>
          <div className="form-group">
            <input
              data-testid="email-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => handleChange('signup', 'email', e.target.value)}
              onBlur={(e) => handleChange('signup', 'email', e.target.value)}
              className={touched.email && errors.email ? 'error-input' : ''}
            />
            <ErrorMessage
              id="email-error"
              touched={touched.email}
              message={errors.email}
            />
          </div>
          <div className="form-group">
            <input
              data-testid="username-input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) =>
                handleChange('signup', 'username', e.target.value)
              }
              onBlur={(e) => handleChange('signup', 'username', e.target.value)}
              className={
                touched.username && errors.username ? 'error-input' : ''
              }
            />
            <ErrorMessage
              id="username-error"
              touched={touched.username}
              message={errors.username}
            />
          </div>
          <div className="form-group">
            <input
              data-testid="preferred-username-input"
              type="text"
              placeholder="Preferred Username"
              value={preferred_username}
              onChange={(e) =>
                handleChange('signup', 'preferred_username', e.target.value)
              }
              onBlur={(e) =>
                handleChange('signup', 'preferred_username', e.target.value)
              }
              className={
                touched.preferred_username && errors.preferred_username
                  ? 'error-input'
                  : ''
              }
            />
            <ErrorMessage
              id="preferred-username-error"
              touched={touched.preferred_username}
              message={errors.preferred_username}
            />
          </div>
          <div className="form-group">
            <input
              data-testid="name-input"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => handleChange('signup', 'name', e.target.value)}
              onBlur={(e) => handleChange('signup', 'name', e.target.value)}
              className={touched.name && errors.name ? 'error-input' : ''}
            />
            <ErrorMessage
              id="name-error"
              touched={touched.name}
              message={errors.name}
            />
          </div>
          <div className="form-group">
            <input
              data-testid="password-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                handleChange('signup', 'password', e.target.value)
              }
              onBlur={(e) => handleChange('signup', 'password', e.target.value)}
              className={
                touched.password && errors.password ? 'error-input' : ''
              }
            />
            <ErrorMessage
              id="password-error"
              touched={touched.password}
              message={errors.password}
            />
          </div>
          <div>
            {signupLoading ? (
              <div className="spinner">
                <div></div>
              </div>
            ) : (
              <>
                <button
                  data-testid="submit-signup-button"
                  onClick={handleSignup}
                >
                  Sign Up
                </button>
                <button data-testid="submit-login-button" onClick={showLogin}>
                  Login
                </button>
              </>
            )}
          </div>
          <ErrorMessage id="signup-error" message={errors.signupError} />
        </div>
      )}

      {signupSuccess && (
        <div className="popup">
          <div className="popup-content">
            <h3>✅ Signup Successful!</h3>
            <p>Please check your email for the confirmation code.</p>
            <button
              onClick={() => {
                setSignupSuccess(false);
                setStep('confirm');
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div>
          <h2 data-testid="confirm-header">Confirm Signup</h2>
          <div className="form-group">
            <input
              placeholder="Confirmation Code"
              value={confirmationCode}
              onChange={(e) =>
                handleChange('confirm', 'confirmationCode', e.target.value)
              }
              onBlur={(e) =>
                handleChange('confirm', 'confirmationCode', e.target.value)
              }
              className={
                touched.confirmationCode && errors.confirmationCode
                  ? 'error-input'
                  : ''
              }
            />
            <ErrorMessage
              id="confirmation-code-error"
              touched={touched.confirmationCode}
              message={errors.confirmationCode}
            />
          </div>
          <div>
            {confirmLoading ? (
              <div className="spinner">
                <div></div>
              </div>
            ) : (
              <>
                <button onClick={handleConfirm}>Confirm</button>
                <button onClick={() => setStep('signup')}>Cancel</button>
              </>
            )}
          </div>
          <ErrorMessage id="confirm-error" message={errors.confirmError} />
        </div>
      )}

      {confirmSuccess && (
        <div className="popup">
          <div className="popup-content">
            <h3>✅ Signup confirmed!</h3>
            <p>Please proceed to login.</p>
            <button
              onClick={() => {
                setConfirmSuccess(false);
                setStep('login');
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 'login' && (
        <div>
          <h2 data-testid="login-header">Login</h2>
          <div className="form-group">
            <input
              type="text"
              data-testid="username-input"
              placeholder="Username"
              value={username}
              onChange={(e) =>
                handleChange('login', 'username', e.target.value)
              }
              onBlur={(e) => handleChange('login', 'username', e.target.value)}
              className={
                touched.username && errors.username ? 'error-input' : ''
              }
            />
            <ErrorMessage
              id="username-error"
              touched={touched.username}
              message={errors.username}
            />
          </div>
          <div className="form-group">
            <input
              data-testid="password-input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) =>
                handleChange('login', 'password', e.target.value)
              }
              onBlur={(e) => handleChange('login', 'password', e.target.value)}
              className={
                touched.password && errors.password ? 'error-input' : ''
              }
            />
            <ErrorMessage
              id="password-error"
              touched={touched.password}
              message={errors.password}
            />
          </div>
          {loginLoading ? (
            <div className="spinner">
              <div></div>
            </div>
          ) : (
            <>
              <button data-testid="submit-login-button" onClick={handleLogin}>
                Login
              </button>
              <button data-testid="submit-signup-button" onClick={showSignup}>
                Sign Up
              </button>
            </>
          )}
          <ErrorMessage id="login-error" message={errors.loginError} />
        </div>
      )}

      {step === 'submit' && (
        <div>
          <h2 data-testid="submit-header">Submit Score</h2>
          <div className="form-group">
            <input
              type="text"
              data-testid="score-input"
              placeholder="Score"
              value={score}
              onChange={(e) => handleChange('submit', 'score', e.target.value)}
              onBlur={(e) => handleChange('submit', 'score', e.target.value)}
              className={touched.score && errors.score ? 'error-input' : ''}
            />
            <ErrorMessage
              id="score-error"
              touched={touched.score}
              message={errors.score}
            />
          </div>

          {submitLoading ? (
            <div className="spinner">
              <div></div>
            </div>
          ) : (
            <>
              <button onClick={handleSubmit}>Submit</button>
              <button onClick={() => setStep('home')}>Cancel</button>
            </>
          )}
          <ErrorMessage id="submit-error" message={errors.submitError} />
        </div>
      )}

      {step === 'home' && (
        <div className="container">
          {loggedIn && (
            <button
              data-testid="submit-score-btn"
              className="submit"
              onClick={() => {
                setStep('submit');
              }}
            >
              Submit Score
            </button>
          )}

          {!loading && !highestLoading && (
            <button
              className="toggleBtn"
              onClick={() => setShowHighest((prev) => !prev)}
              disabled={loading || highestLoading}
            >
              {showHighest ? 'All Scores' : 'Highest Score'}
            </button>
          )}

          {loggedIn && (
            <button
              data-testid="signout-btn"
              className="signout"
              onClick={() => {
                localStorage.removeItem('user_id');
                setLoggedIn(false);
                window.location.reload();
              }}
            >
              Signout
            </button>
          )}

          <h2 data-testid="scoreboard-header" className="title">
            🏆 Scoreboard
          </h2>
          <h4 data-testid="records-count" className="records">
            {!showHighest
              ? `Records : ${totalCount}`
              : `Highest Score: ${highestScore?.score || 0}`}
          </h4>
          <div data-testid="scoreboard-header" className="header">
            <span>Username</span>
            <span>Score</span>
          </div>
          {loading ? (
            <div className="spinner"></div>
          ) : showHighest ? (
            highestLoading ? (
              <div className="spinner"></div>
            ) : highestScore ? (
              <div className="scoreItem highlight">
                <span className="user">{highestScore.user_name}</span>
                <span className="points">{highestScore.score}</span>
              </div>
            ) : (
              <p>No highest score found</p>
            )
          ) : (
            scores.map((score, index) => (
              <div
                key={index}
                className="scoreItem"
                onClick={() => {
                  console.log(
                    score.user_name,
                    JSON.parse(localStorage.getItem('username') ?? ''),
                  );
                  if (
                    score.user_name !==
                    JSON.parse(localStorage.getItem('username') ?? '')
                  )
                    return;
                  setDeleteItem(score);
                  setDeleteScore(true);
                }}
              >
                <span className="user">{score.user_name}</span>
                <span className="points">{score.score}</span>
              </div>
            ))
          )}
          {!showHighest && !loading && (
            <div className="pagination">
              <button
                className="page-btn first"
                onClick={() => {
                  setPage(1);
                }}
                disabled={page === 1}
              >
                ⏮ First
              </button>

              <button
                className="page-btn"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                ⬅ Prev
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="page-btn"
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                Next ➡
              </button>

              <button
                className="page-btn last"
                onClick={() => {
                  if (lastKeys[totalPages - 1]) {
                    setPage(totalPages);
                  }
                }}
                disabled={page === totalPages || !lastKeys[totalPages - 1]}
              >
                Last ⏭
              </button>
            </div>
          )}
          <ErrorMessage
            id="fetch-scores-error"
            message={errors.fetchScoresError}
          />
          <ErrorMessage
            id="fetch-highest-score-error"
            message={errors.fetchHighestScoreError}
          />
          <ErrorMessage id="delete-error" message={errors.deleteError} />
        </div>
      )}

      {deleteScore && (
        <div className="popup">
          <div className="popup-content">
            {!deleteSuccess ? (
              <>
                <h3>✅ Do you want to delete this score ?</h3>
                <div>
                  <span>Username: {deleteItem?.user_name}</span>
                </div>
                <div>
                  <span>Score: {deleteItem?.score}</span>
                </div>
                {deleteLoading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <button
                      className="cancel"
                      onClick={() => {
                        setDeleteScore(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="delete"
                      onClick={() => {
                        handleDeleteScore(deleteItem?.id ?? '');
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <h3>✅ Score deleted!</h3>
                <p>Your score has been deleted successfully.</p>
                <button
                  onClick={() => {
                    setDeleteScore(false);
                    setDeleteSuccess(false);
                    fetchScores(1);
                  }}
                >
                  Continue
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;

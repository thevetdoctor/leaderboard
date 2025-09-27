/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';

import { type AxiosResponse } from 'axios';

import axiosInstance from '../utils/axiosInstance';
import {
  type AuthProps,
  type LeaderboardItem,
  type LeaderboardResponse,
  type LoginResponse,
  type Step,
  decrypt,
} from '../utils/types';
import './Auth.css';
import ErrorMessage from './Error';
import './Popup.css';

const Auth = ({ connectionId }: AuthProps) => {
  const [loggedIn, setLoggedIn] = useState(
    () => !!localStorage.getItem('user_id'),
  );
  const [touched, setTouched] = useState<any>({});
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [preferred_username, setPreferredUsername] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [step, setStep] = useState<Step>(loggedIn ? 'home' : 'signup');

  const [scores, setScores] = useState<LeaderboardItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [signupLoading, setSignupLoading] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signupSuccess, setSignupSuccess] = useState<boolean>(false);
  const [confirmSuccess, setConfirmSuccess] = useState<boolean>(false);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);

  const [showHighest, setShowHighest] = useState<boolean>(false);
  const [highestLoading, setHighestLoading] = useState<boolean>(false);
  const [highestScore, setHighestScore] = useState<LeaderboardItem>();

  const [page, setPage] = useState<number>(1);
  const totalPages = Math.ceil(totalCount / 10);
  const [lastKeys, setLastKeys] = useState<Record<number, string>>({});

  const [score, setScore] = useState<string>('');
  const [deleteScore, setDeleteScore] = useState<boolean>(false);
  const [deleteItem, setDeleteItem] = useState<{
    score: number;
    user_name: string;
    id?: string;
  }>();
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  // const [submitScore, setSubmitScore] = useState(false);
  // const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const scoreRegex = /^(0|[1-9][0-9]*)$/;

  const validate = (type: string, field?: string) => {
    const newErrors: Record<string, string> = {};

    // reset only the field being validated (so old error messages disappear if fixed)
    if (field) delete newErrors[field];

    if (type === 'login') {
      if ((!field || field === 'username') && !username)
        newErrors.username = 'Username is required';

      if ((!field || field === 'password') && !password) {
        newErrors.password = 'Password is required';
      } else if (!passwordRegex.test(password)) {
        newErrors.password =
          'Password must be at least 8 characters, include uppercase, lowercase, number, and special character';
      }
    }

    if (type === 'signup') {
      if ((!field || field === 'email') && !email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Enter a valid email';
      }

      if ((!field || field === 'preferred_username') && !preferred_username)
        newErrors.preferred_username = 'Preferred username is required';

      if ((!field || field === 'name') && !name)
        newErrors.name = 'Name is required';

      if ((!field || field === 'username') && !username)
        newErrors.username = 'Username is required';

      if ((!field || field === 'password') && !password) {
        newErrors.password = 'Password is required';
      } else if (!passwordRegex.test(password)) {
        newErrors.password =
          'Password must be at least 8 characters, include uppercase, lowercase, number, and special character';
      }
    }

    if (type === 'confirm') {
      if ((!field || field === 'confirmationCode') && !confirmationCode) {
        newErrors.confirmationCode = 'Confirmation code is required';
      }
    }

    if (type === 'submit') {
      if ((!field || field === 'score') && !score) {
        newErrors.score = 'Score is required';
      } else if (!scoreRegex.test(score)) {
        newErrors.score = 'Score must be a positive integer';
      }
    }

    setErrors(newErrors);
    console.log(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    try {
      setErrors({});
      if (!validate('signup')) return;
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
      if (!validate('confirm')) return;
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
      setConfirmationCode('');
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
      if (!validate('login')) return;
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
      // const parsedData = JSON.parse(userData)
      // console.log(parsedData);
      // localStorage.setItem('user', JSON.stringify(parsedData));

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
      if (!validate('submit')) return;
      setSubmitLoading(true);
      const userId = localStorage.getItem('user_id');
      const usernameStored = localStorage.getItem('username');

      await axiosInstance.post(
        `/leaderboard/score`,
        {
          score: parseInt(score, 10),
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
      setScore('');
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
      // setStep('home');
      // fetchScores(page);
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
              onChange={(e) => {
                setEmail(e.target.value);
                setTouched({ ...touched, email: true });
                validate('signup', 'email');
              }}
              onBlur={() => {
                setTouched({ ...touched, email: true });
                validate('signup', 'email');
              }}
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
              onChange={(e) => {
                setUsername(e.target.value);
                setTouched({ ...touched, username: true });
                validate('signup', 'username');
              }}
              onBlur={() => {
                setTouched({ ...touched, username: true });
                validate('signup', 'username');
              }}
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
              onChange={(e) => {
                setPreferredUsername(e.target.value);
                setTouched({ ...touched, preferred_username: true });
                validate('signup', 'preferred_username');
              }}
              onBlur={() => {
                setTouched({ ...touched, preferred_username: true });
                validate('signup', 'preferred_username');
              }}
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
              onChange={(e) => {
                setName(e.target.value);
                setTouched({ ...touched, name: true });
                validate('signup', 'name');
              }}
              onBlur={() => {
                setTouched({ ...touched, name: true });
                validate('signup', 'name');
              }}
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
              onChange={(e) => {
                setPassword(e.target.value);
                setTouched({ ...touched, password: true });
                validate('signup', 'password');
              }}
              onBlur={() => {
                setTouched({ ...touched, password: true });
                validate('signup', 'password');
              }}
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
          <h2>Confirm Signup</h2>
          <input
            placeholder="Confirmation Code"
            value={confirmationCode}
            onChange={(e) => {
              setConfirmationCode(e.target.value);
              validate('signup', 'confirmationCode');
            }}
            onBlur={() => {
              setTouched({ ...touched, confirmationCode: true });
              validate('signup', 'confirmationCode');
            }}
          />
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
          <ErrorMessage
            id="confirmation-code-error"
            message={errors.confirmationCode}
          />
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
              onChange={(e) => {
                setUsername(e.target.value);
                validate('login', 'username');
              }}
              onBlur={() => {
                setTouched({ ...touched, username: true });
                validate('login', 'username');
              }}
              className={errors.username ? 'error-input' : ''}
            />
            <ErrorMessage id="username-error" message={errors.username} />
          </div>
          <div className="form-group">
            <input
              data-testid="password-input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validate('login', 'password');
              }}
              onBlur={() => {
                setTouched({ ...touched, password: true });
                validate('login', 'password');
              }}
              className={errors.password ? 'error-input' : ''}
            />
            <ErrorMessage id="password-error" message={errors.password} />
          </div>
          {loginLoading ? (
            <div className="spinner">
              <div></div>
            </div>
          ) : (
            <>
              <button onClick={handleLogin}>Login</button>
              <button onClick={showSignup}>Signup</button>
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
              onChange={(e) => {
                setScore(e.target.value);
                validate('submit', 'score');
              }}
              onBlur={() => {
                setTouched({ ...touched, score: true });
                validate('submit', 'score');
              }}
              className={errors.score ? 'error-input' : ''}
            />
            <ErrorMessage id="score-error" message={errors.score} />
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
                // setSubmitScore(true);
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

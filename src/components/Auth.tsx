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
  decrypt,
} from '../utils/types';
import './Auth.css';
import './Popup.css';

const Auth = ({ connectionId }: AuthProps) => {
  const [loggedIn, setLoggedIn] = useState(
    () => !!localStorage.getItem('user_id'),
  );
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [preferred_username, setPreferredUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [step, setStep] = useState<
    'signup' | 'popup' | 'confirm' | 'login' | 'home' | 'submit'
  >(loggedIn ? 'home' : 'signup');

  const [scores, setScores] = useState<LeaderboardItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [signupLoading, setSignupLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const [showHighest, setShowHighest] = useState(false);
  const [highestLoading, setHighestLoading] = useState(false);
  const [highestScore, setHighestScore] = useState<LeaderboardItem>();

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(totalCount / 10);
  const [lastKeys, setLastKeys] = useState<Record<number, string>>({});

  const [score, setScore] = useState('');
  const [deleteScore, setDeleteScore] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{
    score: number;
    user_name: string;
    id?: string;
  }>();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
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

  const validate = (type = 'login') => {
    const newErrors: Record<string, string> = {};
    if (!username) newErrors.username = 'Username is required';

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        'Password must be at least 8 characters, include uppercase, lowercase, number, and special character';
    }

    if (type === 'signup') {
      if (!email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Enter a valid email';
      }

      if (!preferred_username)
        newErrors.preferred_username = 'Preferred username is required';

      if (!name) newErrors.name = 'Name is required';
    }

    if (type === 'confirm') {
      if (!confirmationCode) {
        newErrors.confirmationCode = 'Confirmation code is required';
      }
    }

    if (type === 'submit') {
      if (!score) {
        newErrors.score = 'Score is required';
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
      if (!validate()) return;
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
      console.log(userData);
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
    } catch (err: any) {
      setLoading(false);
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchHighestScore() {
    try {
      setHighestLoading(true);
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
          <h2>Signup</h2>
          <div className="form-group">
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'error-input' : ''}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={errors.username ? 'error-input' : ''}
            />
            {errors.username && (
              <span className="error">{errors.username}</span>
            )}
          </div>
          <div className="form-group">
            <input
              placeholder="Preferred Username"
              value={preferred_username}
              onChange={(e) => setPreferredUsername(e.target.value)}
              className={errors.preferred_username ? 'error-input' : ''}
            />
            {errors.preferred_username && (
              <span className="error">{errors.preferred_username}</span>
            )}
          </div>
          <div className="form-group">
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'error-input' : ''}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'error-input' : ''}
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>
          <div>
            {signupLoading ? (
              <div className="spinner">
                <div></div>
              </div>
            ) : (
              <>
                <button onClick={handleSignup}>Sign Up</button>
                <button onClick={showLogin}>Login</button>
              </>
            )}
          </div>
          {errors.signupError && (
            <div className="error">{errors.signupError}</div>
          )}
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
            onChange={(e) => setConfirmationCode(e.target.value)}
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
          {errors.confirmError && (
            <div className="error">{errors.confirmError}</div>
          )}
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
          <h2>Login</h2>
          <div className="form-group">
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={errors.username ? 'error-input' : ''}
            />
            {errors.username && (
              <span className="error">{errors.username}</span>
            )}
          </div>
          <div className="form-group">
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'error-input' : ''}
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
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
          {errors.loginError && (
            <div className="error">{errors.loginError}</div>
          )}
        </div>
      )}

      {step === 'submit' && (
        <div>
          <h2>Submit Score</h2>
          <div className="form-group">
            <input
              placeholder="Score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className={errors.score ? 'error-input' : ''}
            />
            {errors.score && <span className="error">{errors.score}</span>}
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
          {errors.submitError && (
            <div className="error">{errors.submitError}</div>
          )}
        </div>
      )}

      {step === 'home' && (
        <div className="container">
          {loggedIn && (
            <button
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
              {showHighest ? 'Show All Scores' : 'Show Highest Score'}
            </button>
          )}

          {loggedIn && (
            <button
              onClick={() => {
                localStorage.removeItem('user_id');
                setLoggedIn(false);
                window.location.reload();
              }}
            >
              Signout
            </button>
          )}

          <h2 className="title">🏆 Scoreboard</h2>
          <h4>
            {!showHighest
              ? `Records : ${totalCount}`
              : `Highest Score: ${highestScore?.score || 0}`}
          </h4>
          <div className="header">
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
                  if (lastKeys[totalPages]) {
                    setPage(totalPages);
                  }
                }}
                disabled={page === totalPages || !lastKeys[totalPages]}
              >
                Last ⏭
              </button>
            </div>
          )}
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

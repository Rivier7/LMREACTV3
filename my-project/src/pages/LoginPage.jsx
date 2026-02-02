import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { initiateLogin, verify2FA, resend2FACode } from '../api/auth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [stage, setStage] = useState('credentials');
  const [verificationCode, setVerificationCode] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const navigate = useNavigate();
  const { login } = useAuth();

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (stage === 'verify' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            clearInterval(timer);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  // Format time left as mm:ss
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      const response = await initiateLogin(email, password);

      // Reset timer and show verification form
      setTimeLeft(600);
      setInfoMessage(response.message || '2FA code sent to your email');
      setStage('verify');
    } catch (err) {
      setError(err.message || 'Invalid credentials or server error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async e => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      // Ensure code is exactly 6 digits
      if (!/^\d{6}$/.test(verificationCode)) {
        throw new Error('Please enter a valid 6-digit code');
      }

      const response = await verify2FA(email, verificationCode);

      // Response contains JWT token and expiration
      if (response.token) {
        try {
          await login(response.token);
          navigate('/dashboard');
        } catch (e) {
          localStorage.setItem('token', response.token);
          navigate('/dashboard');
        }
      } else {
        setError('Verification failed: no token received');
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      await resend2FACode(email);
      setTimeLeft(600); // Reset timer
      setInfoMessage('A new verification code has been sent to your email.');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Could not resend verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {stage === 'verify' ? 'Verify Code' : 'Login'}
            </h2>
          </div>

          {/* Form */}
          {stage === 'credentials' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Login
              </button>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                  {error}
                </div>
              )}
            </form>
          )}

          {stage === 'verify' && (
            <>
              {/* Show the 2FA sent message at the top */}
              {infoMessage && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-600 text-sm text-center">{infoMessage}</p>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-5">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Enter Verification Code
                  </h3>
                  <p className="text-sm text-gray-500">
                    Please check your email for the 6-digit code
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="sr-only">Verification Code</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    className="w-full text-center tracking-[0.5em] text-3xl py-4 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="text-sm text-gray-500 text-center mt-2">
                  Code expires in{' '}
                  <span className="font-medium text-gray-900">{formatTimeLeft()}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isLoading || timeLeft === 0}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="bg-white border border-gray-200 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors duration-200 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Resend'}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStage('credentials')}
                    disabled={isLoading}
                    className="text-sm text-gray-600 hover:text-gray-900 underline disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Back to Login
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail } from '../../features/auth/authSlice';

const VerifyEmailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, pendingEmail } = useSelector((s) => s.auth);
  const [digits, setDigits] = useState(['','','','','','']);
  const inputs = useRef([]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputs.current[i+1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i-1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== 6) return;
    dispatch(verifyEmail({ email: pendingEmail, otp })).then((action) => {
      if (verifyEmail.fulfilled.match(action)) navigate('/dashboard');
    });
  };

  const otp = digits.join('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-700 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">USMS</h1>
          <p className="text-primary-200 mt-2">University Student Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
            <p className="text-gray-500 mt-2 text-sm">
              We sent a 6-digit code to<br />
              <span className="font-medium text-gray-700">{pendingEmail || 'your email'}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg outline-none transition-colors
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                    border-gray-300 text-gray-900"
                />
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-primary w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Wrong email?{' '}
            <Link to="/register" className="text-primary-600 hover:underline font-medium">Register again</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

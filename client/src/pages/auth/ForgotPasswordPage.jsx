import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ForgotPasswordPage = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-700 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h2>
        {sent ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium">✅ Reset link sent to your email!</p>
            <Link to="/login" className="text-primary-600 text-sm mt-4 inline-block hover:underline">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <input {...register('email', { required: true })} type="email" className="input-field" placeholder="Your email address" />
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Reset Link'}</button>
            <Link to="/login" className="block text-center text-sm text-gray-500 hover:underline">Back to login</Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
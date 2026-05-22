import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.patch(`/auth/reset-password/${token}`, { password: data.password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-surface-subtle p-4"
      style={{ backgroundImage: 'radial-gradient(ellipse at 15% 10%, rgba(6,182,212,0.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 90%, rgba(14,116,144,0.10) 0%, transparent 55%)' }}
    >
      <div className="bg-white rounded-3xl shadow-card border border-primary-100/60 p-8 w-full max-w-sm">
        <h2 className="font-display text-2xl text-primary-900 mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register('password', { required: true, minLength: 8 })}
            type="password"
            className="input-field"
            placeholder="New password (min 8 chars)"
          />
          <input
            {...register('confirm', { validate: v => v === watch('password') || 'Passwords must match' })}
            type="password"
            className="input-field"
            placeholder="Confirm new password"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { registerUser } from '../../features/auth/authSlice';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics', 'Mechanical Engineering',
  'Civil Engineering', 'Business Administration', 'Mathematics', 'Physics', 'Chemistry', 'Other',
];

const RegisterPage = () => {
  const dispatch = useDispatch();
  const { loading, registrationPending } = useSelector((s) => s.auth);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'student' } });
  const selectedRole = watch('role');

  const onSubmit = (data) => {
    const { confirmPassword, ...rest } = data;
    dispatch(registerUser(rest));
  };

  if (registrationPending) return <Navigate to="/verify-email" />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-700 p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">USMS</h1>
          <p className="text-primary-200 mt-2">University Student Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your profile will be reviewed and activated by an admin after registration.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input {...register('name', { required: 'Name required' })} className="input-field" placeholder="John Doe" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select {...register('role')} className="input-field">
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                {...register('email', {
                  required: 'Email required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                })}
                type="email" className="input-field" placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select {...register('department', { required: 'Department required' })} className="input-field">
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input {...register('phone')} className="input-field" placeholder="+91 ..." />
              </div>
            </div>

            {selectedRole === 'student' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="col-span-2 text-xs font-semibold text-blue-700 uppercase tracking-wide">Student Details</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                  <input {...register('program')} className="input-field" placeholder="e.g. B.Tech, MBA" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <input {...register('batch')} className="input-field" placeholder="e.g. 2024-2028" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
                  <input {...register('semester')} type="number" min="1" max="12" className="input-field" placeholder="1" />
                </div>
              </div>
            )}

            {selectedRole === 'faculty' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="col-span-2 text-xs font-semibold text-purple-700 uppercase tracking-wide">Faculty Details</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input {...register('designation')} className="input-field" placeholder="e.g. Assistant Professor" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input {...register('qualification')} className="input-field" placeholder="e.g. Ph.D, M.Tech" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                  <input {...register('experience')} type="number" min="0" className="input-field" placeholder="0" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  {...register('password', {
                    required: 'Password required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Need uppercase, lowercase & number' },
                  })}
                  type="password" className="input-field" placeholder="••••••••"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm',
                    validate: (v) => v === watch('password') || 'Passwords do not match',
                  })}
                  type="password" className="input-field" placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
              ⏳ Your profile will be reviewed and activated by a university admin before you can access all features.
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-1">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

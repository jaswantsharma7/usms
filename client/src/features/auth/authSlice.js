import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

let stored = null;
try {
  stored = JSON.parse(localStorage.getItem('auth') || 'null');
} catch {
  localStorage.removeItem('auth');
}

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async ({ email, otp }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/verify-email', { email, otp });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Verification failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: stored?.user || null,
    accessToken: stored?.accessToken || null,
    refreshToken: stored?.refreshToken || null,
    loading: false,
    error: null,
    registrationPending: false,
    pendingEmail: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.registrationPending = false;
      state.pendingEmail = null;
      localStorage.removeItem('auth');
    },
    setTokens(state, action) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      try {
        const prev = JSON.parse(localStorage.getItem('auth') || '{}');
        localStorage.setItem('auth', JSON.stringify({ ...prev, ...action.payload }));
      } catch {}
    },
    clearError(state) {
      state.error = null;
    },
    clearRegistrationPending(state) {
      state.registrationPending = false;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationPending = true;
        state.pendingEmail = action.meta.arg.email;
        toast.success('Account created! Check your email for your OTP.');
      })
      .addCase(registerUser.rejected, (state, action) => {
        rejected(state, action);
        toast.error(action.payload);
      })
      .addCase(verifyEmail.pending, pending)
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.registrationPending = false;
        state.pendingEmail = null;
        try { localStorage.setItem('auth', JSON.stringify(action.payload)); } catch {}
        toast.success('Email verified! Welcome to USMS.');
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        rejected(state, action);
        toast.error(action.payload);
      })
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        try { localStorage.setItem('auth', JSON.stringify(action.payload)); } catch {}
        toast.success('Welcome back!');
      })
      .addCase(loginUser.rejected, (state, action) => {
        rejected(state, action);
        toast.error(action.payload);
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        localStorage.removeItem('auth');
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, setTokens, clearError, clearRegistrationPending } = authSlice.actions;
export default authSlice.reducer;

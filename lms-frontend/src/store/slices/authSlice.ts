import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import apiClient, { getErrorMessage } from '@/lib/api';
import { AUTH_LOGIN_ENDPOINT, AUTH_REGISTER_ENDPOINT, AUTH_PROFILE_ENDPOINT } from '@/constAPI';
import { User, AuthResponseData } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk<
  AuthResponseData,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(AUTH_LOGIN_ENDPOINT, credentials);
    const data: AuthResponseData = response.data.data;

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      Cookies.set('token', data.access_token, { expires: 7 });
      Cookies.set('userRole', data.user.role, { expires: 7 });
    }

    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const registerUser = createAsyncThunk<
  User,
  { name: string; email: string; password: string; role?: string },
  { rejectValue: string }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(AUTH_REGISTER_ENDPOINT, userData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/profile', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(AUTH_PROFILE_ENDPOINT);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token') || Cookies.get('token') || null;
        let user: User | null = null;
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            user = JSON.parse(savedUser);
          } catch {
            user = null;
          }
        }
        state.token = token;
        state.user = user;
        state.isAuthenticated = !!token;
      }
      state.isHydrated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isHydrated = true;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Cookies.remove('token');
        Cookies.remove('userRole');
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isHydrated = true;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.isHydrated = true;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isHydrated = true;
        state.error = action.payload || 'Login failed';
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      });

    // Fetch Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isHydrated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user profile';
      });
  },
});

export const { hydrateAuth, logout, clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;


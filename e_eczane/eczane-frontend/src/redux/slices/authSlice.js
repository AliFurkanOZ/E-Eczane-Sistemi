import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';

// Login
export const login = createAsyncThunk(
  'auth/login',
  async ({ identifier, password, userType }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(identifier, password, userType);
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('userType', response.user_type);
      localStorage.setItem('userId', response.user_id);
      
      toast.success('Giriş başarılı!');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Giriş başarısız');
      return rejectWithValue(error.response?.data);
    }
  }
);

// Register Hasta
export const registerHasta = createAsyncThunk(
  'auth/registerHasta',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.registerHasta(data);
      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Kayıt başarısız');
      return rejectWithValue(error.response?.data);
    }
  }
);

// Register Eczane
export const registerEczane = createAsyncThunk(
  'auth/registerEczane',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.registerEczane(data);
      toast.success('Kayıt başarılı! Admin onayı bekleniyor.');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Kayıt başarısız');
      return rejectWithValue(error.response?.data);
    }
  }
);

// Get current user
export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getMe();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    userType: localStorage.getItem('userType'),
    userId: localStorage.getItem('userId'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.userType = null;
      state.userId = null;
      state.isAuthenticated = false;
      
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      
      toast.success('Çıkış yapıldı');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
        state.userType = action.payload.user_type;
        state.userId = action.payload.user_id;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register Hasta
      .addCase(registerHasta.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerHasta.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerHasta.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register Eczane
      .addCase(registerEczane.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerEczane.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerEczane.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.userType = null;
        state.userId = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

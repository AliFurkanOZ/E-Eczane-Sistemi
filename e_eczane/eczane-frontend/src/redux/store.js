import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import hastaReducer from './slices/hastaSlice';
import eczaneReducer from './slices/eczaneSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hasta: hastaReducer,
    eczane: eczaneReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import viewingRecordsSlice from './slices/viewingRecordsSlice';
import apiKeysSlice from './slices/apiKeysSlice';
import usersSlice from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    viewingRecords: viewingRecordsSlice,
    apiKeys: apiKeysSlice,
    users: usersSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
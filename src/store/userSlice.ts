import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { StoredUser } from '@/utils/storage';

export type UserState = {
  profile: StoredUser | null;
};

const initialState: UserState = {
  profile: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<StoredUser | null>) {
      state.profile = action.payload;
    },
    clearUser(state) {
      state.profile = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;

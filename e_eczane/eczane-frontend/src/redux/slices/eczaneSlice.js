import { createSlice } from '@reduxjs/toolkit';

const eczaneSlice = createSlice({
  name: 'eczane',
  initialState: {
    stoklar: [],
    siparisler: [],
    loading: false,
    error: null,
  },
  reducers: {
    setStoklar: (state, action) => {
      state.stoklar = action.payload;
    },
    setSiparisler: (state, action) => {
      state.siparisler = action.payload;
    },
  },
});

export const { setStoklar, setSiparisler } = eczaneSlice.actions;
export default eczaneSlice.reducer;

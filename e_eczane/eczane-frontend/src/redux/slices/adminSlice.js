import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    eczaneler: [],
    hastalar: [],
    siparisler: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    setEczaneler: (state, action) => {
      state.eczaneler = action.payload;
    },
    setHastalar: (state, action) => {
      state.hastalar = action.payload;
    },
    setSiparisler: (state, action) => {
      state.siparisler = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
  },
});

export const { setEczaneler, setHastalar, setSiparisler, setStats } = adminSlice.actions;
export default adminSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const hastaSlice = createSlice({
  name: 'hasta',
  initialState: {
    siparisler: [],
    sepet: [],
    loading: false,
    error: null,
  },
  reducers: {
    setSiparisler: (state, action) => {
      state.siparisler = action.payload;
    },
    addToSepet: (state, action) => {
      const existingItem = state.sepet.find(
        item => item.ilac_id === action.payload.ilac_id
      );
      
      if (existingItem) {
        existingItem.miktar += action.payload.miktar;
      } else {
        state.sepet.push(action.payload);
      }
    },
    removeFromSepet: (state, action) => {
      state.sepet = state.sepet.filter(
        item => item.ilac_id !== action.payload
      );
    },
    updateSepetItem: (state, action) => {
      const item = state.sepet.find(
        i => i.ilac_id === action.payload.ilac_id
      );
      if (item) {
        item.miktar = action.payload.miktar;
      }
    },
    clearSepet: (state) => {
      state.sepet = [];
    },
  },
});

export const {
  setSiparisler,
  addToSepet,
  removeFromSepet,
  updateSepetItem,
  clearSepet,
} = hastaSlice.actions;

export default hastaSlice.reducer;

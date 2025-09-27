
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  npk: '',
  ph: '',
  tempHumidity: '',
};

const predictionSlice = createSlice({
  name: 'prediction',
  initialState,
  reducers: {
    // This action will receive the parsed data and update the state
    setPredictionData: (state, action) => {
      const { npk, ph, tempHumidity } = action.payload;
      state.npk = npk;
      state.ph = ph;
      state.tempHumidity = tempHumidity;
    },
    // Optional: An action to clear the data if needed
    clearPredictionData: (state) => {
      state.npk = '';
      state.ph = '';
      state.tempHumidity = '';
    },
  },
});

export const { setPredictionData, clearPredictionData } = predictionSlice.actions;

// Selector to get the whole prediction state
export const selectPredictionData = (state) => state.prediction;

export default predictionSlice.reducer;
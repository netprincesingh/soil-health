import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  savedMessages: [], // Array will store { id, text } objects
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // This action adds a message if it's not saved, or removes it if it is.
    toggleSaveMessage: (state, action) => {
      const message = action.payload;
      const existingIndex = state.savedMessages.findIndex(
        (m) => m.id === message.id
      );

      if (existingIndex >= 0) {
        // If message exists, remove it (unsave)
        state.savedMessages.splice(existingIndex, 1);
      } else {
        // If message doesn't exist, add it (save)
        state.savedMessages.push(message);
      }
    },
    // This action specifically deletes a message from the saved list
    deleteSavedMessage: (state, action) => {
      const messageId = action.payload;
      state.savedMessages = state.savedMessages.filter(
        (message) => message.id !== messageId
      );
    },
  },
});

export const { toggleSaveMessage, deleteSavedMessage } = messagesSlice.actions;

// Selector to get the saved messages from the state
export const selectSavedMessages = (state) => state.messages.savedMessages;

export default messagesSlice.reducer;
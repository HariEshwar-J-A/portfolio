import { combineReducers } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import contactReducer from './slices/contactSlice';
import navigationReducer from './slices/navigationSlice';

export const rootReducer = combineReducers({
  theme: themeReducer,
  contact: contactReducer,
  navigation: navigationReducer,
});
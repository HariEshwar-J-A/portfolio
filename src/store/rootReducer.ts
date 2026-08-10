import { combineReducers } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import contactReducer from './slices/contactSlice';
import navigationReducer from './slices/navigationSlice';
import viewReducer from './slices/viewSlice';

export const rootReducer = combineReducers({
  theme: themeReducer,
  contact: contactReducer,
  navigation: navigationReducer,
  view: viewReducer,
});
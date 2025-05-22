import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactState {
  form: ContactFormData;
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string;
}

const initialState: ContactState = {
  form: {
    name: '',
    email: '',
    subject: '',
    message: '',
  },
  isSubmitting: false,
  isSuccess: false,
  isError: false,
  errorMessage: '',
};

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    updateForm: (state, action: PayloadAction<Partial<ContactFormData>>) => {
      state.form = { ...state.form, ...action.payload };
    },
    submitForm: (state) => {
      state.isSubmitting = true;
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = '';
    },
    submitSuccess: (state) => {
      state.isSubmitting = false;
      state.isSuccess = true;
      state.form = initialState.form;
    },
    submitFailure: (state, action: PayloadAction<string>) => {
      state.isSubmitting = false;
      state.isError = true;
      state.errorMessage = action.payload;
    },
    resetStatus: (state) => {
      state.isSubmitting = false;
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = '';
    },
  },
});

export const {
  updateForm,
  submitForm,
  submitSuccess,
  submitFailure,
  resetStatus,
} = contactSlice.actions;

export default contactSlice.reducer;
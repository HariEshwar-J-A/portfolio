import { takeLatest, call, put, select } from 'redux-saga/effects';
import { submitForm, submitSuccess, submitFailure } from '../slices/contactSlice';
import emailjs from '@emailjs/browser';
import { portfolioData } from '../../data/portfolioData';

interface EmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function sendEmail(params: EmailParams) {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    params,
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );
}

function* handleSubmitForm(action: ReturnType<typeof submitForm>) {
  try {
    const state = yield select((state: any) => state.contact.form);
    yield call(sendEmail, state);
    yield put(submitSuccess());
  } catch (error) {
    yield put(submitFailure(error instanceof Error ? error.message : 'An error occurred'));
  }
}

export function* watchContact() {
  yield takeLatest(submitForm.type, handleSubmitForm);
}

// Add this to fix the TypeScript error
function select(selector: any) {
  return { type: 'SELECT', selector };
}
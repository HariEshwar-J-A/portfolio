import { takeLatest, call, put, select, fork } from 'redux-saga/effects';
import { submitForm, submitSuccess, submitFailure } from '../slices/contactSlice';
import emailjs from '@emailjs/browser';
import { portfolioData } from '../../data/portfolioData';

interface EmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function* sendEmail() {
  const params = yield select((state) => state.contact.form);
  console.log(params);
  const templateParams = {
    name: params.name,
    email: params.email,
    subject: params.subject,
    message: params.message
  };

  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    templateParams
  );
}

function* handleSubmitForm(action: ReturnType<typeof submitForm>) {
  try {
    // const localState = yield select((state: any) => state.contact.form);
    yield fork(sendEmail);
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
import { takeLatest, call, put } from 'redux-saga/effects';
import { submitForm, submitSuccess, submitFailure } from '../slices/contactSlice';
import emailjs from 'emailjs-com';
import { portfolioData } from '../../data/portfolioData';

interface EmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function sendEmail(params: EmailParams) {
  const { emailjsServiceId, emailjsTemplateId, emailjsUserId } = portfolioData.contact;
  
  return emailjs.send(
    emailjsServiceId,
    emailjsTemplateId,
    params,
    emailjsUserId
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
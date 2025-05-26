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

function* handleSubmitForm(action: ReturnType<typeof submitForm>) {
  try {
    const formData: EmailParams = yield select((state: any) => state.contact.form);
    
    const templateParams = {
      to_name: 'Admin',
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
    };

    yield call(emailjs.send,
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams
    );
    
    yield put(submitSuccess());
  } catch (error) {
    yield put(submitFailure(error instanceof Error ? error.message : 'An error occurred'));
  }
}

export function* watchContact() {
  yield takeLatest(submitForm.type, handleSubmitForm);
}
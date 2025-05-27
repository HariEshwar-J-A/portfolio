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

function* handleSubmitForm() {
  try {
    const formData: EmailParams = yield select((state: any) => state.contact.form);
    const { emailjsServiceId, emailjsTemplateId, emailjsUserId } = portfolioData.contact;
    
    const templateParams = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    };

    yield call(
      emailjs.send,
      emailjsServiceId,
      emailjsTemplateId,
      templateParams,
      emailjsUserId
    );
    
    yield put(submitSuccess());
  } catch (error) {
    console.error('Email sending error:', error);
    yield put(submitFailure(error instanceof Error ? error.message : 'Failed to send email'));
  }
}

export function* watchContact() {
  yield takeLatest(submitForm.type, handleSubmitForm);
}
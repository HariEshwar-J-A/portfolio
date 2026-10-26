import { takeLatest, call, put, select } from 'redux-saga/effects';
import { submitForm, submitSuccess, submitFailure } from '../slices/contactSlice';
import type { RootState } from '../store';
import { contactExtras } from '../../lib/contact/clientMeta';

interface EmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const FAILURE = 'Please try again in a moment';

function* handleSubmitForm() {
  try {
    const formData: EmailParams = yield select((state: RootState) => state.contact.form);
    const extras = contactExtras();
    const response: Response = yield call(fetch, '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        company: extras.company,
        t: extras.t,
      }),
    });

    if (!response.ok) {
      yield put(submitFailure(FAILURE));
      return;
    }

    yield put(submitSuccess());
  } catch {
    yield put(submitFailure(FAILURE));
  }
}

export function* watchContact() {
  yield takeLatest(submitForm.type, handleSubmitForm);
}

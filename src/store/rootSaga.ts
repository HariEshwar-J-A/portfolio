import { all } from 'redux-saga/effects';
import { watchTheme } from './sagas/themeSaga';
import { watchContact } from './sagas/contactSaga';
import { watchNavigation } from './sagas/navigationSaga';

export default function* rootSaga() {
  yield all([
    watchTheme(),
    watchContact(),
    watchNavigation(),
  ]);
}
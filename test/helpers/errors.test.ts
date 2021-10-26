import test from 'ava';

import { getErrorMessage } from '@/helpers/errors';

test('getErrorMessage() should return the error message when an error is given', t => {
  const actual = getErrorMessage(Error('error message'));

  t.is(actual, 'error message');
});

test('getErrorMessage() should return `unknown error` when no error is given', t => {
  const actual = getErrorMessage({
    code: 'TEST',
  });

  t.is(actual, 'unknown error');
});

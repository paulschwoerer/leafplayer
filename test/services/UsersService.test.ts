import createUsersService from '~/services/UsersService';
import { createPasswordHash } from '~/helpers/passwords';

import { MOCK_USER } from '../testdata/mocks';
import test from '../setupTestDB';

const USER = {
  ...MOCK_USER,
  password: createPasswordHash('supersecret'),
};

test('it returns false when given an incorrect password', async t => {
  const { db } = t.context;

  await db('users').insert(USER);

  const service = createUsersService({ db });

  t.is(
    await service.isCorrectPassword({
      userId: USER.id,
      password: 'notthepassword',
    }),
    false,
  );
});

test('it returns true when given the correct password', async t => {
  const { db } = t.context;

  await db('users').insert(USER);

  const service = createUsersService({ db });

  t.is(
    await service.isCorrectPassword({
      userId: USER.id,
      password: 'supersecret',
    }),
    true,
  );
});

test('it returns false when a given user does not exist', async t => {
  const { db } = t.context;

  const service = createUsersService({ db });

  t.is(await service.exists('notauser'), false);
});

test('it returns true when a given user does exist', async t => {
  const { db } = t.context;

  await db('users').insert(USER);

  const service = createUsersService({ db });

  t.is(await service.exists(USER.username), true);
});

test('it does not return a non-existing user', async t => {
  const { db } = t.context;

  const service = createUsersService({ db });

  t.is(await service.findWithPasswordByUsername('notauser'), undefined);
});

test('it returns an existing user with their password', async t => {
  const { db } = t.context;

  await db('users').insert(USER);

  const service = createUsersService({ db });

  const user = await service.findWithPasswordByUsername(USER.username);

  t.plan(2);

  if (user) {
    t.is(user.username, USER.username);
    t.is(user.password, USER.password);
  }
});

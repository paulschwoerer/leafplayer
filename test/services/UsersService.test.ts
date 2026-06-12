import createUsersService from '@/services/UsersService';

import test from '../setupTestDB';

const USER = {
  username: 'admin',
  displayName: '',
  password: 'supersecret',
};

test('it returns false when given an incorrect password', t => {
  const { db } = t.context;

  const service = createUsersService({ db });
  const userId = service.create(USER);

  t.is(
    service.isCorrectPassword({
      userId,
      password: 'notthepassword',
    }),
    false,
  );
});

test('it returns true when given the correct password', t => {
  const { db } = t.context;

  const service = createUsersService({ db });
  const userId = service.create(USER);

  t.is(
    service.isCorrectPassword({
      userId,
      password: 'supersecret',
    }),
    true,
  );
});

test('it returns false when a given user does not exist', t => {
  const { db } = t.context;

  const service = createUsersService({ db });

  t.is(service.exists('notauser'), false);
});

test('it returns true when a given user does exist', t => {
  const { db } = t.context;

  const service = createUsersService({ db });
  service.create(USER);

  t.is(service.exists(USER.username), true);
});

test('it does not return a non-existing user', t => {
  const { db } = t.context;

  const service = createUsersService({ db });

  t.is(service.findWithPasswordByUsername('notauser'), undefined);
});

test('it returns an existing user with their password', t => {
  const { db } = t.context;

  const service = createUsersService({ db });
  service.create(USER);

  const user = service.findWithPasswordByUsername(USER.username);

  t.plan(2);

  if (user) {
    t.is(user.username, USER.username);
    t.is(typeof user.password, 'string');
  }
});

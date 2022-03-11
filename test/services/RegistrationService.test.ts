import { Knex } from 'knex';

import { generateUuid } from '@/helpers/uuid';
import createInvitationsService from '@/services/InvitationsService';
import createPasswordService from '@/services/PasswordService';
import createRegistrationService, {
  RegistrationService,
} from '@/services/RegistrationService';
import createUsersService from '@/services/UsersService';
import { getCurrentUnixTimestamp } from '@/helpers/time';
import { NotAuthorizedError } from '@/errors/NotAuthorizedError';
import { ValidationError } from '@/errors/ValidationError';
import { createPasswordHash } from '@/helpers/passwords';

import { createLeafplayerConfig } from '../testHelpers';
import test from '../setupTestDB';

function setupService(db: Knex): RegistrationService {
  const config = createLeafplayerConfig();
  return createRegistrationService({
    usersService: createUsersService({ db }),
    invitationsService: createInvitationsService({ db, config }),
    passwordService: createPasswordService({ db, config }),
  });
}

test('registerUser() should throw when given an invalid invite code', async t => {
  const registrationService = setupService(t.context.db);

  await t.throwsAsync(
    () =>
      registrationService.registerUser('invalid_invite_code', {
        username: 'newuser',
        password: 'supersecret',
      }),
    { instanceOf: NotAuthorizedError },
  );
});

test('registerUser() should throw when given an expired invite code', async t => {
  const { db } = t.context;
  await db('invitations').insert({
    code: 'expired_invite_code',
    expiresAt: getCurrentUnixTimestamp() - 10000,
  });

  const registrationService = setupService(db);

  await t.throwsAsync(
    () =>
      registrationService.registerUser('expired_invite_code', {
        username: 'newuser',
        password: 'supersecret',
      }),
    { instanceOf: NotAuthorizedError },
  );
});

test('registerUser() should throw when given an unsafe password', async t => {
  const { db } = t.context;
  await db('invitations').insert({
    code: 'supersecret_invite_code',
    expiresAt: getCurrentUnixTimestamp() + 10000,
  });

  const registrationService = setupService(db);

  await t.throwsAsync(
    () =>
      registrationService.registerUser('supersecret_invite_code', {
        username: 'newuser',
        password: 'pw',
      }),
    { instanceOf: ValidationError },
  );
});

test('registerUser() should throw when given a username that already exists', async t => {
  const { db } = t.context;
  await db('users').insert({
    id: generateUuid(),
    username: 'testuser',
    displayName: 'Test User',
    password: createPasswordHash('supersecret'),
  });
  await db('invitations').insert({
    code: 'supersecret_invite_code',
    expiresAt: getCurrentUnixTimestamp() + 10000,
  });

  const registrationService = setupService(db);

  await Promise.all(
    ['testuser', 'testUser', 'Testuser', 'TESTUSER'].map(username =>
      t.throwsAsync(
        () =>
          registrationService.registerUser('supersecret_invite_code', {
            username,
            password: 'supersecret',
          }),
        { instanceOf: ValidationError },
      ),
    ),
  );
});

test('registerUser() should invalidate invite code and create user', async t => {
  const { db } = t.context;
  await db('invitations').insert({
    code: 'supersecret_invite_code',
    expiresAt: getCurrentUnixTimestamp() + 10000,
  });

  const registrationService = setupService(db);

  await registrationService.registerUser('supersecret_invite_code', {
    username: 'newuser',
    password: 'supersecret',
  });

  const invitation = await db('invitations')
    .where({
      code: 'supersecret_invite_code',
    })
    .first();
  const user = await db('users')
    .where({
      username: 'newuser',
    })
    .first();

  t.truthy(user);
  t.truthy(invitation?.used);
});

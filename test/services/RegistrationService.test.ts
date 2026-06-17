import createInvitationsService from '../../lib/services/InvitationsService.ts';
import createPasswordService from '../../lib/services/PasswordService.ts';
import createRegistrationService, {
  type RegistrationService,
} from '../../lib/services/RegistrationService.ts';
import createUsersService from '../../lib/services/UsersService.ts';
import { getCurrentUnixTimestamp } from '../../lib/helpers/time.ts';
import { NotAuthorizedError } from '../../lib/errors/NotAuthorizedError.ts';
import { ValidationError } from '../../lib/errors/ValidationError.ts';
import { createPasswordHash } from '../../lib/helpers/passwords.ts';
import { type DB } from '../../lib/database/index.ts';
import type { InvitationRow, UserRow } from '../../lib/database/rows.ts';
import { createLeafplayerConfig } from '../testHelpers.ts';
import test from '../setupTestDB.ts';

function setupService(db: DB): RegistrationService {
  const config = createLeafplayerConfig();
  return createRegistrationService({
    usersService: createUsersService({ db }),
    invitationsService: createInvitationsService({ db, config }),
    passwordService: createPasswordService({ db, config }),
  });
}

test('registerUser() should throw when given an invalid invite code', t => {
  const registrationService = setupService(t.context.db);

  t.throws(
    () =>
      registrationService.registerUser('invalid_invite_code', {
        username: 'newuser',
        password: 'supersecret',
      }),
    { instanceOf: NotAuthorizedError },
  );
});

test('registerUser() should throw when given an expired invite code', t => {
  const { db } = t.context;

  db.prepare(
    'INSERT INTO invitations (code, expiresAt) VALUES (:code, :expiresAt)',
  ).run({
    code: 'expired_invite_code',
    expiresAt: getCurrentUnixTimestamp() - 10000,
  });

  const registrationService = setupService(db);

  t.throws(
    () =>
      registrationService.registerUser('expired_invite_code', {
        username: 'newuser',
        password: 'supersecret',
      }),
    { instanceOf: NotAuthorizedError },
  );
});

test('registerUser() should throw when given an unsafe password', t => {
  const { db } = t.context;

  createInvitationsService({
    config: createLeafplayerConfig(),
    db,
  }).createInvitation({
    code: 'supersecret_invite_code',
  });

  const registrationService = setupService(db);

  t.throws(
    () =>
      registrationService.registerUser('supersecret_invite_code', {
        username: 'newuser',
        password: 'pw',
      }),
    { instanceOf: ValidationError },
  );
});

test('registerUser() should throw when given a username that already exists', t => {
  const { db } = t.context;

  createUsersService({ db }).create({
    username: 'testuser',
    displayName: 'Test User',
    password: createPasswordHash('supersecret'),
  });
  createInvitationsService({
    config: createLeafplayerConfig(),
    db,
  }).createInvitation({
    code: 'supersecret_invite_code',
  });

  const registrationService = setupService(db);

  ['testuser', 'testUser', 'Testuser', 'TESTUSER'].map(username =>
    t.throws(
      () =>
        registrationService.registerUser('supersecret_invite_code', {
          username,
          password: 'supersecret',
        }),
      { instanceOf: ValidationError },
    ),
  );
});

test('registerUser() should invalidate invite code and create user', t => {
  const { db } = t.context;

  createInvitationsService({
    config: createLeafplayerConfig(),
    db,
  }).createInvitation({
    code: 'supersecret_invite_code',
  });

  const registrationService = setupService(db);

  registrationService.registerUser('supersecret_invite_code', {
    username: 'newuser',
    password: 'supersecret',
  });

  const invitation = db
    .prepare<unknown[], InvitationRow>(
      `SELECT * FROM invitations WHERE code = 'supersecret_invite_code'`,
    )
    .first();
  const user = db
    .prepare<unknown[], UserRow>(
      `SELECT * FROM users WHERE username = 'newuser'`,
    )
    .first();

  t.truthy(user);
  t.truthy(invitation?.used);
});

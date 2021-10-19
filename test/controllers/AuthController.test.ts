import { User } from '@/common';
import { AuthService } from '@/services/AuthService';
import { InvitationsService } from '@/services/InvitationsService';
import anyTest, { TestInterface } from 'ava';
import { FastifyInstance } from 'fastify';
import td from 'testdouble';
import { SecurityConfig } from '../../lib/config';
import { AuthController } from '../../lib/controllers';
import { mockAuthMiddleware } from '../testAuthHelpers';
import { createMinimalServer } from '../testHelpers';

const MOCK_USER: User = {
  id: '03aefc55-92ed-4210-bded-d6a84f5e3aa1',
  displayName: 'Test User',
  username: 'testuser',
};
const MOCK_SESSION_ID = '76264bec-0b46-4ef8-932d-4a41f8bd93eb';
const MOCK_USER_PASSWORD = 'supersecret';

const test = anyTest as TestInterface<{
  server: FastifyInstance;
}>;

test.beforeEach(t => {
  t.context.server = createMinimalServer();
});
test.afterEach(async t => t.context.server.close());

test('it should call service method when invoking endpoint', async t => {
  const authService = td.object<AuthService>();

  const controller = createController(authService);

  await t.context.server.register(controller);

  const response = await t.context.server.inject({
    method: 'POST',
    path: '/password',
    payload: {
      currentPassword: 'supersecret',
      newPassword: 'timeforachange',
    },
  });

  t.is(response.statusCode, 204);
  t.notThrows(() =>
    td.verify(
      authService.changeUserPassword({
        activeSessionId: MOCK_SESSION_ID,
        newPassword: 'timeforachange',
        userId: MOCK_USER.id,
      }),
    ),
  );
});

test('it should send an unauthorized error and not invoke the service method, when supplying an invalid password', async t => {
  const authService = td.object<AuthService>();

  const controller = createController(authService);

  await t.context.server.register(controller);

  const response = await t.context.server.inject({
    method: 'POST',
    path: '/password',
    payload: {
      currentPassword: 'notthepassword',
      newPassword: 'timeforachange',
    },
  });

  t.is(response.statusCode, 401);
  t.notThrows(() =>
    td.verify(authService.changeUserPassword(td.matchers.anything()), {
      times: 0,
    }),
  );
});

function createController(authService: AuthService) {
  const config = td.object<SecurityConfig>();
  config.minimumPasswordLength = 8;
  const invitationsService = td.object<InvitationsService>();

  return AuthController({
    config,
    authMiddleware: mockAuthMiddleware({
      user: MOCK_USER,
      sessionId: MOCK_SESSION_ID,
      userPassword: MOCK_USER_PASSWORD,
    }),
    authService,
    invitationsService,
  });
}

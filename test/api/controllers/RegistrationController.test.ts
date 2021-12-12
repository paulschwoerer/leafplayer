import { FastifyInstance } from 'fastify';
import td from 'testdouble';

import { RegistrationService } from '@/services/RegistrationService';
import { createRegistrationController } from '@/api/controllers/RegistrationController';

import test from '../setupTestServer';
import { mockAuth } from '../mockAuth';
import { MOCK_SESSION_ID, MOCK_USER } from '../../testdata/mocks';

async function setup(server: FastifyInstance): Promise<{
  registrationService: RegistrationService;
}> {
  const registrationService = td.object<RegistrationService>();

  await server.register(mockAuth(MOCK_SESSION_ID, MOCK_USER));
  await server.register(
    createRegistrationController({
      registrationService,
    }),
  );

  return { registrationService };
}

test('endpoint should call service', async t => {
  const { registrationService } = await setup(t.context.server);

  const response = await t.context.server.inject({
    method: 'POST',
    path: '/register',
    payload: {
      inviteCode: 'supersecret_invite_code',
      username: 'newuser',
      displayName: 'New User',
      password: 'supersecret',
    },
  });

  t.is(response.statusCode, 201);
  t.notThrows(() => {
    td.verify(
      registrationService.registerUser('supersecret_invite_code', {
        username: 'newuser',
        displayName: 'New User',
        password: 'supersecret',
      }),
    );
  });
});

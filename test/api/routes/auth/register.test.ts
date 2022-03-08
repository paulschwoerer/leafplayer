import td from 'testdouble';

import test from '../../setupTestServer';

import { register } from '~/api/routes/auth/register';
import { RegistrationService } from '~/services/RegistrationService';

test('endpoint should call service', async t => {
  const registrationService = td.object<RegistrationService>();

  const { server } = t.context;
  await server.register(register({ registrationService }));

  const response = await server.inject({
    method: 'POST',
    path: '/auth/register',
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

import { type FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { type RegisterRequestDto } from 'leafplayer-common';

import { type RegistrationService } from '../../../services/RegistrationService.ts';

type Injects = {
  registrationService: RegistrationService;
};

const schema = {
  body: {
    type: 'object',
    properties: {
      inviteCode: {
        type: 'string',
      },
      username: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
      displayName: {
        type: 'string',
      },
    },
    required: ['inviteCode', 'username', 'password'],
  },
};

export function register({ registrationService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.post<{ Body: RegisterRequestDto }>(
      '/auth/register',
      { schema },
      async (request, reply) => {
        const { username, password, displayName, inviteCode } = request.body;

        registrationService.registerUser(inviteCode, {
          username,
          displayName,
          password,
        });

        return reply.status(201).send();
      },
    );
  });
}

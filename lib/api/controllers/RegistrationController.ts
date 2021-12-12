import { FastifyPluginAsync } from 'fastify';

import { RegisterRequestDto } from '@/common';
import RegisterSchema from '@/schemas/register.json';
import { RegistrationService } from '@/services/RegistrationService';

type Injects = {
  registrationService: RegistrationService;
};

export function createRegistrationController({
  registrationService,
}: Injects): FastifyPluginAsync {
  return async server => {
    server.post<{ Body: RegisterRequestDto }>(
      '/register',
      { schema: RegisterSchema },
      async (request, reply) => {
        const { username, password, displayName, inviteCode } = request.body;

        await registrationService.registerUser(inviteCode, {
          username,
          displayName,
          password,
        });

        return reply.status(201).send();
      },
    );
  };
}
